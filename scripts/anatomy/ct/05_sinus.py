# /// script
# dependencies = ["numpy", "scipy", "scikit-image"]
# ///
"""Step 5: split the inside-head air into maxillary / frontal / ethmoid / sphenoid (left+right) and the airway.
Label volume (uint8):  1,2 maxillary R,L   3,4 frontal R,L   5,6 ethmoid R,L   7,8 sphenoid R,L
                       9,10 nasal cavity R,L   11 nasopharynx   (R = x<0 = patient's right)"""
import numpy as np, sys, os
from scipy import ndimage as ndi
from skimage.segmentation import watershed
from skimage.feature import peak_local_max
sys.path.insert(0, os.path.dirname(__file__))
from common import *

hu, lab, bmin, h = load_vol()
a = np.load(f"{CACHE}/air_{SUBJECT}.npz")
terr, rest, inside = a["terr"], a["rest"], a["inside"]
hs = ndi.gaussian_filter(hu.astype(np.float32), 1.0)
shape = hu.shape
X = lambda i: bmin[0] + i * h
mid = 0.5 * (np.argwhere(terr == 3)[:, 0].mean() + np.argwhere(terr == 4)[:, 0].mean()) * h + bmin[0]
print("nasal midline x (scene mm)", round(mid, 2))
xs = (bmin[0] + np.arange(shape[0]) * h)[:, None, None]

# ── the sinus component: the biggest rest component with centroid inside the sphenoethmoid box ──
sz = np.bincount(rest.ravel()); sz[0] = 0
best = None
for c in np.argsort(-sz)[:12]:
    m = rest == c
    p = np.argwhere(m).mean(0) * h + bmin
    if abs(p[0]) < 20 and 0 < p[1] < 45 and -60 < p[2] < -15 and sz[c] * h ** 3 > 8000: best = c; break
print("sinus component", best, sz[best] * h ** 3 / 1000, "mL")
C = rest == best
ii = np.argwhere(C); lo = np.maximum(ii.min(0) - 2, 0); hi = np.minimum(ii.max(0) + 3, shape)
sl = tuple(slice(l, u) for l, u in zip(lo, hi)); Cc = C[sl]
edt = ndi.distance_transform_edt(Cc) * h
es = ndi.gaussian_filter(edt, 1.0)
pk = peak_local_max(es, min_distance=6, threshold_abs=0.6, exclude_border=False)
mk = np.zeros(Cc.shape, np.int32)
for n, p in enumerate(pk): mk[tuple(p)] = n + 1
ws = watershed(-es, mk, mask=Cc)
kind = {}
frontal_mask = np.zeros(Cc.shape, bool); sph_mask = np.zeros(Cc.shape, bool); eth_mask = np.zeros(Cc.shape, bool); drop_mask = np.zeros(Cc.shape, bool)
for n in range(1, len(pk) + 1):
    m = ws == n; v = m.sum() * h ** 3
    c = (np.argwhere(m).mean(0) + lo) * h + bmin
    if v < 150: k = "drop"
    elif c[2] < -43: k = "sph"
    elif c[1] > 29 and c[2] > -16: k = "front"
    elif abs(c[0] - mid) < 5.5 and v < 400: k = "drop"
    else: k = "eth"
    kind[n] = k
    if k == "drop" and abs(c[0] - mid) >= 10: continue   # small lateral pockets: bone-internal air cells, not airway (06 fills them)
    {"drop": drop_mask, "sph": sph_mask, "front": frontal_mask, "eth": eth_mask}[k][m] = True
# below y = 28 mm only a tapering channel (>= 1.6 mm radius) is kept: no flat floor, it narrows into the frontal recess
yfl = (bmin[1] + (np.arange(Cc.shape[1]) + lo[1]) * h)[None, :, None]
edtc = ndi.gaussian_filter(edt, 0.6)
frontal_mask &= (yfl >= 28) | ((yfl >= 19) & (edtc >= 1.6 + 0.0 * yfl))   # natural taper into the frontal recess: the narrow duct stays only where it is a real channel
print({k: sum(1 for v in kind.values() if v == k) for k in ("drop", "sph", "front", "eth")})
# paired split of the unpaired chambers: whole basins (cells delimited by real septa / narrow necks) go to the side of their centroid.
# frontal: the intersinus septum x = column of the densest tissue around the sinus; sphenoid: nasal midline.
def septum_x(m):
    d = ndi.binary_dilation(m, iterations=2); ij = np.argwhere(d)
    xg = bmin[0] + (np.arange(m.shape[0]) + lo[0]) * h
    fr = np.array([((hu[sl][x] > -150) & d[x]).sum() / max(1, d[x].sum()) for x in range(m.shape[0])])
    fr = ndi.gaussian_filter1d(fr, 3); w = np.abs(xg - mid) < 6
    return float(xg[w][np.argmax(fr[w])])
xs_f = septum_x(frontal_mask); xs_s = mid
print("frontal septum x", xs_f)
L = np.zeros(shape, np.uint8)
# ethmoid cells go to the side of their centroid
for n in range(1, len(pk) + 1):
    if kind[n] != "eth": continue
    m = ws == n; c = (np.argwhere(m).mean(0) + lo) * h + bmin
    full = np.zeros(shape, bool); full[sl] = m
    L[full] = 5 if c[0] < mid else 6
# frontal and sphenoid: two seeds (deepest points of each half), flooded over the distance map -> the cut follows the narrowest neck / septum
xg = bmin[0] + (np.arange(Cc.shape[0]) + lo[0]) * h
def paired(mask_c, cut, lab_r, lab_l):
    es2 = np.where(mask_c, es, 0)
    sides = []
    for sgn in (-1, 1):
        sel = mask_c & ((xg[:, None, None] - cut) * sgn > 3)
        if not sel.any(): sides.append(None); continue
        sides.append(np.unravel_index(np.argmax(np.where(sel, es2, -1)), es2.shape))
    if None in sides:
        full = np.zeros(shape, bool); full[sl] = mask_c; L[full] = lab_r if sides[0] is not None else lab_l; return
    mk2 = np.zeros(Cc.shape, np.int32); mk2[sides[0]] = 1; mk2[sides[1]] = 2
    w2 = watershed(-es2, mk2, mask=mask_c)
    for v, lb_ in ((1, lab_r), (2, lab_l)):
        full = np.zeros(shape, bool); full[sl] = w2 == v; L[full] = lb_
paired(frontal_mask, xs_f, 3, 4)
# sphenoid: this scan shows one septated chamber; the paired split is the sagittal plane through the nasal septum (the real septum
# is oblique and partly incomplete). Cells keep their own side by centroid when they lie clearly to one side.
full = np.zeros(shape, bool); full[sl] = sph_mask
L[full & (xs < mid)] = 7; L[full & (xs >= mid)] = 8
# maxillary + airway from the NasalSeg territories (x sign for sides: terr 1 / 2 are R / L by position)
for k, dst in ((1, None), (2, None)):
    m = terr == k; side = 1 if np.argwhere(m)[:, 0].mean() * h + bmin[0] < mid else 2
    L[m & (L == 0)] = side
for k in (3, 4):
    m = terr == k; side = 9 if np.argwhere(m)[:, 0].mean() * h + bmin[0] < mid else 10
    L[m & (L == 0)] = side
L[(terr == 5) & (L == 0)] = 11
# ── stray cells: ethmoid fragments inside / on the roof of a maxillary sinus (Haller-like) become maxillary; other detached bits are dropped ──
mxm = np.isin(L, (1, 2))
dmx, imx = ndi.distance_transform_edt(~mxm, return_indices=True)
dmx *= h
for side_lab in (5, 6):
    m = L == side_lab
    lbx, nx = ndi.label(m, structure=np.ones((3, 3, 3)))
    if nx < 2: continue
    szx = np.bincount(lbx.ravel()); szx[0] = 0; main_ = int(np.argmax(szx))
    for c_ in range(1, nx + 1):
        if c_ == main_: continue
        cm = lbx == c_; v_ = szx[c_] * h ** 3
        if dmx[cm].min() <= 2.5 or (dmx[cm] <= 1.5).mean() > 0.3:
            L[cm] = L[tuple(i[cm] for i in imx)]; print("ethmoid fragment", int(v_), "mm3 -> maxillary")
        elif v_ < 60:
            L[cm] = 0; print("ethmoid fragment", int(v_), "mm3 dropped")
# ethmoid voxels hugging a maxillary lumen are maxillary
hug = np.isin(L, (5, 6)) & (dmx <= 1.0)
L[hug] = L[tuple(i[hug] for i in imx)]
for lbl_ in (3, 4, 7, 8):   # frontal / sphenoid: keep the main body per side only
    m = L == lbl_; lbx, nx = ndi.label(m, structure=np.ones((3, 3, 3)))
    if nx > 1:
        szx = np.bincount(lbx.ravel()); szx[0] = 0
        for c_ in range(1, nx + 1):
            if c_ != int(np.argmax(szx)) and szx[c_] * h ** 3 < 150: L[lbx == c_] = 0
# remaining nose air (vestibule, olfactory cleft, dropped basins): airway, side by x
AIR = (hs < -450) & inside
noseair = np.zeros(shape, bool)
full = np.zeros(shape, bool); full[sl] = drop_mask; noseair |= full
ex = (rest > 0) & (rest != best) & AIR
bx = (xs - mid)
yy = np.arange(shape[1])[None, :, None] * h + bmin[1]; zz = np.arange(shape[2])[None, None, :] * h + bmin[2]
vest = ex & (np.abs(bx) < 20) & (zz > -12) & (yy < 14) & (yy > -22)
lv, nv = ndi.label(vest | np.isin(L, (9, 10)))   # keep only what connects to the nasal cavities
keepv = np.unique(lv[np.isin(L, (9, 10))]); keepv = keepv[keepv > 0]
vest = vest & np.isin(lv, keepv)
noseair |= vest
L[noseair & (L == 0) & (bx < 0)] = 9; L[noseair & (L == 0) & (bx >= 0)] = 10
np.savez_compressed(f"{CACHE}/sinus_{SUBJECT}.npz", L=L, mid=mid)  # 05b_ostium.py adds the maxillary ostium channels
for k, n in ((1, "mx R"), (2, "mx L"), (3, "fr R"), (4, "fr L"), (5, "eth R"), (6, "eth L"), (7, "sph R"), (8, "sph L"), (9, "nose R"), (10, "nose L"), (11, "NP")):
    m = L == k; ii = np.argwhere(m)
    if len(ii): print(f"{n:6s} {m.sum() * h ** 3 / 1000:6.2f} mL  AP {(np.ptp(ii[:, 2]) + 1) * h:5.1f} H {(np.ptp(ii[:, 1]) + 1) * h:5.1f} W {(np.ptp(ii[:, 0]) + 1) * h:5.1f} mm")
