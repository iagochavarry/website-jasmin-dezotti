# /// script
# dependencies = ["numpy", "scipy", "scikit-image"]
# ///
"""Step 10: skin ghost (heavily smoothed head mask, nostrils plugged), globes (sphere fit), teeth and nasal cartilages
(BodyParts3D meshes placed on the scan)."""
import numpy as np, sys, os, pickle, json
from scipy import ndimage as ndi
from scipy.signal import fftconvolve
sys.path.insert(0, os.path.dirname(__file__))
from common import *
hu, lab, bmin, h = load_vol(); shape = hu.shape
valid = np.load(f"{CACHE}/vol_{SUBJECT}.npz")["valid"].astype(bool)
sn = np.load(f"{CACHE}/sinus_{SUBJECT}.npz"); mid = float(sn["mid"])
hd = np.load(f"{CACHE}/head_{SUBJECT}.npz"); F6 = hd["head6"]
inside = np.load(f"{CACHE}/air_{SUBJECT}.npz")["inside"]
hs = ndi.gaussian_filter(hu.astype(np.float32), 1.0)
out = {}
def emit(name, vf):
    save_mesh(name, vf); out[name] = vf
    print(f"{name:24s} {len(vf[1]):7d} tris {abs(signed_volume(*vf)) / 1000:9.2f} mL", flush=True)

# ── skin ──
ds = lambda m: m[::2, ::2, ::2]
X = (bmin[0] + 2 * h * np.arange(F6.shape[0]))[:, None, None]
Y = (bmin[1] + 2 * h * np.arange(F6.shape[1]))[None, :, None]
Z = (bmin[2] + 2 * h * np.arange(F6.shape[2]))[None, None, :]
nose = (np.abs(X - mid) < 22) & (Y > -26) & (Y < 32) & (Z > -14)
skin = (F6 | (ds(inside) & nose)) & (Y > -76)   # horizontal cut below the chin: drops the slanted FOV edge and the neck stub
skin = ndi.binary_fill_holes(np.pad(skin, 1))[1:-1, 1:-1, 1:-1]
SK_SIG = 3.5
f = ndi.gaussian_filter(skin.astype(np.float32), SK_SIG / (2 * h))
v, fa = mesh_field(f, bmin, 2 * h, level=0.45, smooth=6, min_vol=500)
emit("pele", (v, fa))

# ── globes ──
reg = pickle.load(open(f"{CACHE}/bp3d_{SUBJECT}.pkl", "rb"))["meshes"]
ev, ef = reg["eyes"]
import scipy.sparse as sp
from scipy.sparse.csgraph import connected_components
A_ = sp.coo_matrix((np.ones(ef.size), (ef.ravel(), np.roll(ef, -1, 1).ravel())), shape=(len(ev),) * 2)
nc, lc = connected_components(A_, directed=False)
cents = []
for c in range(nc):
    ff = ef[lc[ef[:, 0]] == c]
    if len(ff) > 50: cents.append(ev[np.unique(ff)].mean(0))
cents.sort(key=lambda c: c[0])
for name, c0 in zip(("olho_dir", "olho_esq"), cents[:2] if len(cents) >= 2 else cents):
    R0 = 11.5
    w = 14
    lo = np.floor((c0 - 25 - bmin) / 1.0).astype(int)  # 1 mm crop via striding
    sub = hs[::2, ::2, ::2]; o = bmin
    i0 = np.floor((c0 - 20 - o) / (2 * h)).astype(int); i1 = i0 + 40
    cr = sub[i0[0]:i1[0], i0[1]:i1[1], i0[2]:i1[2]]
    ind = ((cr > -5) & (cr < 80)).astype(np.float32)
    r = int(round(R0 / (2 * h)))
    g = np.mgrid[-r:r + 1, -r:r + 1, -r:r + 1]; ball = ((g ** 2).sum(0) <= r * r).astype(np.float32); ball /= ball.sum()
    sc = fftconvolve(ind, ball, mode="same")
    # penalise centres whose sphere overlaps bone / fat: add shell term
    r2 = r + 2; g2 = np.mgrid[-r2:r2 + 1, -r2:r2 + 1, -r2:r2 + 1]; d2 = (g2 ** 2).sum(0)
    shell = ((d2 <= r2 * r2) & (d2 > r * r)).astype(np.float32); shell /= shell.sum()
    fat = ((cr < -30) | (cr > 250)).astype(np.float32)
    sc2 = sc + 0.5 * fftconvolve(fat, shell, mode="same")
    cc = np.array(np.unravel_index(np.argmax(sc2), sc2.shape)) + i0
    ctr = o + cc * 2 * h
    print(name, "BP3D centre", c0.round(1), "fitted", ctr.round(1), "score", sc.max().round(2))
    # radius: grow until the inside fraction falls below 0.88
    rad = 11.0
    gg = np.mgrid[-30:31, -30:31, -30:31] * 1.0; dd = np.sqrt((gg ** 2).sum(0))
    cr2 = hs[::2, ::2, ::2]; ci = np.round((ctr - o) / (2 * h)).astype(int)
    cube = cr2[ci[0] - 15:ci[0] + 16, ci[1] - 15:ci[1] + 16, ci[2] - 15:ci[2] + 16]
    dd = np.sqrt((np.mgrid[-15:16, -15:16, -15:16] ** 2).sum(0)) * 2 * h
    for rr in np.arange(10.0, 13.1, 0.25):
        m = (dd <= rr) & (dd > rr - 1.5); fr = ((cube[m] > -10) & (cube[m] < 90)).mean()
        if fr < 0.80: break
        rad = rr
    rad = float(np.clip(rad, 11.5, 12.5))
    print("   radius", rad)
    # sphere mesh (icosphere via uv grid, closed)
    n_u, n_v = 48, 24
    th = np.linspace(0, np.pi, n_v + 1); ph = np.linspace(0, 2 * np.pi, n_u, endpoint=False)
    vv = [ctr + np.array([0, rad, 0])]
    for t in th[1:-1]:
        for p in ph: vv.append(ctr + rad * np.array([np.sin(t) * np.cos(p), np.cos(t), np.sin(t) * np.sin(p)]))
    vv.append(ctr + np.array([0, -rad, 0])); vv = np.array(vv)
    ff = []
    for j in range(n_u): ff.append([0, 1 + j, 1 + (j + 1) % n_u])
    for i in range(n_v - 2):
        for j in range(n_u):
            a = 1 + i * n_u + j; b = 1 + i * n_u + (j + 1) % n_u; c = a + n_u; d = b + n_u
            ff += [[a, c, b], [b, c, d]]
    last = len(vv) - 1
    for j in range(n_u): ff.append([last, 1 + (n_v - 2) * n_u + (j + 1) % n_u, 1 + (n_v - 2) * n_u + j])
    ff = np.array(ff)
    if signed_volume(vv, ff) < 0: ff = ff[:, ::-1]
    out[name + "_c"] = (ctr, rad)
    emit(name, (vv, ff))
json.dump({k: [list(map(float, v[0])), float(v[1])] for k, v in out.items() if k.endswith("_c")}, open(f"{CACHE}/eyes_{SUBJECT}.json", "w"))

# ── teeth (BodyParts3D rows placed on the jaws) ──
tt = pickle.load(open(f"{CACHE}/teeth_{SUBJECT}.pkl", "rb"))
for name, k in (("dentes_superiores", 1), ("dentes_inferiores", 2)):
    vs, fs, off = [], [], 0
    for v, f in tt[k]:
        vs.append(v); fs.append(f + off); off += len(v)
    v, f = np.concatenate(vs), np.concatenate(fs)
    if signed_volume(v, f) < 0: f = f[:, ::-1]
    emit(name, (v, f))
