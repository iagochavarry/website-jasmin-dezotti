# /// script
# dependencies = ["numpy", "scipy"]
# ///
"""Step 3: register the BodyParts3D bones to the CT bone surface (trimmed similarity ICP globally, then
per-bone rigid ICP), save the transformed meshes (scene mm) in .cache/ct/bp3d_<subject>.npz."""
import numpy as np, sys, os, json, pickle
from scipy import ndimage as ndi
from scipy.spatial import cKDTree
sys.path.insert(0, os.path.dirname(__file__))
from common import *

hu, lab, bmin, h = load_vol()
def to_mm(ijk): return bmin + (np.asarray(ijk) + 0.0) * h
# CT bone surface points (1 mm)
bone = ndi.gaussian_filter(np.clip(hu[::2, ::2, ::2].astype(np.float32), -200, 1500), 0.7) > 280
surf = bone & ~ndi.binary_erosion(bone)
ii = np.argwhere(surf); pts = bmin + ii * (2 * h)
keep = ~((pts[:, 2] < -80) & (pts[:, 1] < -10))  # cervical spine
keep &= pts[:, 1] > -75
ct = pts[keep]; print("CT surface pts", len(ct))
tree = cKDTree(ct)

names = ["frontal", "occ", "sph", "tempR", "tempL", "eth", "nasalR", "nasalL", "maxR", "maxL", "zygR", "zygL", "lacR", "lacL", "palR", "palL", "mand", "vomer", "parR", "parL"]
M = {n: bp(n) for n in names}
S = {n: sample_surface(*M[n], spacing=1.5) for n in names}
skull = np.concatenate([S[n] for n in names if n not in ("mand",)])
print("src pts", len(skull))

def icp(src, T0, iters=40, trim=0.7, scale=True, tree=tree):
    s, R, t = T0
    for it in range(iters):
        p = s * src @ R.T + t
        d, j = tree.query(p)
        k = np.argsort(d)[: int(len(d) * trim)]
        s2, R2, t2 = umeyama(src[k], ct[j[k]], scale)
        s, R, t = s2, R2, t2
    d, _ = tree.query(s * src @ R.T + t)
    return (s, R, t), float(np.median(d)), float(np.mean(d[np.argsort(d)[: int(len(d) * trim)]]))
# multi-start: centroid of the face (maxilla) as anchor, pitch candidates
bmx = np.concatenate([S["maxR"], S["maxL"]]).mean(0)
cmx = ct[(ct[:, 1] > -45) & (ct[:, 1] < -5) & (np.abs(ct[:, 0]) < 40) & (ct[:, 2] > -15)].mean(0)
best = None
for pitch in (-15, -8, 0, 8, 15):
    for sc in (0.95, 1.0):
        R0 = rot("x", pitch); s0 = sc
        t0 = cmx - s0 * R0 @ bmx
        T, med, tr = icp(skull, (s0, R0, t0), iters=30)
        print(pitch, sc, "->", round(T[0], 3), round(med, 2), round(tr, 2), flush=True)
        if best is None or tr < best[2]: best = (T, med, tr)
T, med, tr = best
T, med, tr = icp(skull, T, iters=40, trim=0.8)
print("global", T[0], np.degrees(np.arccos(np.clip((np.trace(T[1]) - 1) / 2, -1, 1))), "median/trim dist", med, tr)
out = {"global": T}
res = {}
for n in names:
    src = S[n]; p0 = T[0] * src @ T[1].T + T[2]
    # restrict targets near the transformed bone (8 mm)
    near = cKDTree(p0).query_ball_point(ct, 8.0)
    sel = np.array([i for i, l in enumerate(near) if l]) if False else None
    d0, _ = tree.query(p0); 
    Tn, medn, trn = icp(src, T, iters=25, trim=0.75, scale=False if n != "mand" else True)
    # guard: accept only if it improves the trimmed distance and stays small
    drift = np.linalg.norm((Tn[0] * src.mean(0) @ Tn[1].T + Tn[2]) - (T[0] * src.mean(0) @ T[1].T + T[2]))
    print(n, "global trim-dist %.2f -> %.2f  drift %.1f mm" % (np.mean(np.sort(d0)[: int(len(d0) * .75)]), trn, drift))
    res[n] = Tn if (trn < 0.85 * np.mean(np.sort(d0)[: int(len(d0) * .75)]) and drift < 12) else T
out["bones"] = res
out["meshes"] = {}
for n in names:
    v, f = M[n]; Tn = res[n]
    out["meshes"][n] = (Tn[0] * v @ Tn[1].T + Tn[2], f)
for n in ("cart", "eyes", "skin", "conchaR", "conchaL"):
    v, f = bp(n); out["meshes"][n] = (T[0] * v @ T[1].T + T[2], f)
pickle.dump(out, open(f"{CACHE}/bp3d_{SUBJECT}.pkl", "wb"))
print("saved")
