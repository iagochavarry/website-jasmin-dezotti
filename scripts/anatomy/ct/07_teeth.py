# /// script
# dependencies = ["numpy", "scipy"]
# ///
"""Step 7: teeth. A CT cannot separate roots from alveolar bone reliably at this resolution, so the BodyParts3D tooth rows
(upper: rigid+scale ICP to the dense crown voxels of the maxilla, lower: same on the mandible) are placed on the scan.
Writes teeth_<subject>.pkl (meshes in scene mm) and teeth_<subject>.npz (1 upper / 2 lower solid voxel mask)."""
import numpy as np, sys, os, pickle
from scipy import ndimage as ndi
from scipy.spatial import cKDTree
sys.path.insert(0, os.path.dirname(__file__))
from common import *
hu, lab, bmin, h = load_vol(); shape = hu.shape
hs = ndi.gaussian_filter(hu.astype(np.float32), 1.0)
reg = pickle.load(open(f"{CACHE}/bp3d_{SUBJECT}.pkl", "rb"))
lines = [l.split("\t") for l in open(os.path.join(ROOT, ".cache/parts_list_e.txt")).read().split("\n") if "secondary" in l and "tooth" in l]
rows = {1: [], 2: []}
for fma, name in lines:
    rows[1 if "upper" in name else 2].append(bp(int(fma.replace("FMA", ""))))
def tf(T, v): s, R, t = T; return s * v @ R.T + t
def icp(src, tree, ct, T0, iters=30, trim=0.7):
    s, R, t = T0
    for _ in range(iters):
        p = s * src @ R.T + t; d, j = tree.query(p)
        k = np.argsort(d)[: int(len(d) * trim)]
        s, R, t = umeyama(src[k], ct[j[k]], True)
        s = min(max(s, 0.9), 1.1) if False else s
    d, _ = tree.query(s * src @ R.T + t)
    return (s, R, t), float(np.mean(np.sort(d)[: int(len(d) * trim)]))
dense = hs > 1250
dpts = np.argwhere(dense) * h + bmin
out = {}; mask = np.zeros(shape, np.uint8)
for k, key in ((1, "maxR"), (2, "mand")):
    T0 = reg["bones"][key]
    src = np.concatenate([sample_surface(v, f, 0.8) for v, f in rows[k]])
    p0 = tf(T0, src); c = p0.mean(0)
    sel = dpts[np.all(np.abs(dpts - c) < [45, 25, 35], 1)]
    # keep only dense voxels in the tooth zone of this jaw: within 7 mm of the transformed row
    near = cKDTree(p0).query(sel)[0] < 7
    ct = sel[near]; print("jaw", k, "crown pts", len(ct))
    T, dd = icp(src, cKDTree(ct), ct, T0, iters=25, trim=0.6)
    print("  mean trimmed dist", dd, "scale", T[0])
    meshes = []
    for v, f in rows[k]:
        meshes.append((tf(T, v), f))
        sl, m = voxelize_solid(meshes[-1][0], f, bmin, h, shape)
        mask[sl][m] = k
    out[k] = meshes
pickle.dump(out, open(f"{CACHE}/teeth_{SUBJECT}.pkl", "wb"))
np.savez_compressed(f"{CACHE}/teeth_{SUBJECT}.npz", teeth=mask)
np.savez_compressed(f"{CACHE}/dbg.npz", hu=hu, k=mask, bmin=bmin, h=h)
for k in (1, 2): print("teeth", k, (mask == k).sum() * h ** 3 / 1000, "mL")
