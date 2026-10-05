# /// script
# dependencies = ["numpy", "scipy", "scikit-image"]
# ///
"""Step 4: head mask (skin), inside-head air and its split into airway / maxillary / frontal / ethmoid / sphenoid.
Writes .cache/ct/air_<subject>.npz  (uint8 label volumes on the 0.5 mm scene grid)."""
import numpy as np, sys, os
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(__file__))
from common import *

hu, lab, bmin, h = load_vol()
valid = np.load(f"{CACHE}/vol_{SUBJECT}.npz")["valid"].astype(bool)
nx, ny, nz = hu.shape
X = lambda i: bmin[0] + i * h
def ball(r):
    n = int(np.ceil(r)); g = np.mgrid[-n:n + 1, -n:n + 1, -n:n + 1]; return (g ** 2).sum(0) <= r * r
def edt_open(mask, r_vox):  # opening by ball via EDT
    e = ndi.distance_transform_edt(mask) > r_vox
    return e
# ── head mask at 1 mm ──
hs = ndi.gaussian_filter(hu.astype(np.float32), 1.0)  # 0.5 mm sigma
valid_e = ndi.binary_erosion(valid[::2, ::2, ::2], iterations=2)
t1 = (hs[::2, ::2, ::2] > -300) & valid_e
e = ndi.distance_transform_edt(t1) > 5          # erode 5 mm: kills the table, hair, ears' thin parts
lbl, n = ndi.label(e); sizes = ndi.sum(e, lbl, range(1, n + 1)); core = lbl == (1 + int(np.argmax(sizes)))
back = ndi.distance_transform_edt(~core) <= 5.5  # dilate back
zz = (bmin[2] + 2 * h * np.arange(t1.shape[2]))[None, None, :]
head = np.where(zz < -60, back & t1, t1)   # the table lies behind the skull; the thin nose must survive
# ears: a wider opening on the sides of the head removes the pinnae (thin flaps) but not the round skull
xx1 = (bmin[0] + 2 * h * np.arange(t1.shape[0]))[:, None, None]
open10 = ndi.distance_transform_edt(~(ndi.distance_transform_edt(head) > 10)) <= 10.5
head = np.where(np.abs(xx1) > 58, head & open10, head)
lh, nh = ndi.label(head); sh = ndi.sum(head, lh, range(1, nh + 1)); head = lh == (1 + int(np.argmax(sh)))
print("head vol L", head.sum() * 1e-6 * 1000 / 1000)
# close nostrils / mouth and fill
def close_fill(m, r):
    pd = int(r) + 3
    m = np.pad(m, pd)
    d = ndi.distance_transform_edt(~m) <= r
    c = ndi.distance_transform_edt(d) > r
    f = ndi.binary_fill_holes(c | m)[pd:-pd, pd:-pd, pd:-pd]
    # slice-wise fills too (the FOV cut opens the neck/oral cavity at the bottom)
    return f
jmin = np.argmax(valid_e, axis=1)  # lowest valid voxel of every (x,z) column
bot = valid_e.any(1)[:, None, :] & (np.arange(valid_e.shape[1])[None, :, None] < jmin[:, None, :])
filled6 = close_fill(head | bot, 6) & valid_e
filled = close_fill(head | bot, 12) & valid_e   # airway/sinus air is enclosed only after closing the nostrils
for ax in (0, 1, 2):
    filled = filled | np.stack([ndi.binary_fill_holes(s) for s in np.moveaxis(filled, ax, 0)]) .transpose({0:(0,1,2),1:(1,0,2),2:(1,2,0)}[ax]) if False else filled
# upsample to 0.5 mm
def up(m): return np.repeat(np.repeat(np.repeat(m, 2, 0), 2, 1), 2, 2)[:nx, :ny, :nz]
inside = up(filled) & valid
np.savez_compressed(f"{CACHE}/head_{SUBJECT}.npz", head1=filled, head6=filled6, tissue1=head)
print("inside voxels", inside.sum() * h ** 3 / 1e6, "L")

# ── air inside the head ──
AIR = (hs < -300) & inside
# labelled territories (NasalSeg): 1,2 maxillary (x<0 / x>0), 3,4 nasal cavities, 5 nasopharynx
def lab_mask(k, sigma=0.6):
    f = ndi.gaussian_filter((lab == k).astype(np.float32), sigma / h)  # sigma in voxels
    return f > 0.5
terr = np.zeros(hu.shape, np.uint8)
for k in (1, 2, 3, 4, 5):
    terr[lab_mask(k, 1.2) & (terr == 0)] = k
seed = (terr > 0) & AIR
# unlabelled air voxels within 1.2 mm of a seed inherit its territory (the boundary air of the sinus / cavity)
dist, idx = ndi.distance_transform_edt(~seed, return_indices=True)
near = (dist <= 2.4) & AIR   # 1.2 mm
terr2 = np.zeros_like(terr); terr2[near] = terr[tuple(i[near] for i in idx)]
terr2[seed] = terr[seed]
print({k: round((terr2 == k).sum() * h ** 3 / 1000, 2) for k in range(1, 6)}, "mL")
rest = AIR & (terr2 == 0)
# remove what is clearly not sinus: oral cavity / pharynx / ears — keep components, classify by position
lblr, nr = ndi.label(rest)
sz = np.bincount(lblr.ravel())[1:]
order = np.argsort(-sz)[:40]
objs = ndi.find_objects(lblr)
print("components of the remaining air:")
for o in order:
    sl = objs[o]; vox = sz[o]
    if vox * h ** 3 < 20: continue
    m = lblr[sl] == o + 1; c = np.argwhere(m).mean(0) + [s.start for s in sl]
    p = bmin + c * h
    lo = bmin + np.array([s.start for s in sl]) * h; hi = bmin + np.array([s.stop for s in sl]) * h
    print(f"  #{o + 1} {vox * h ** 3:9.1f} mm3  c=({p[0]:6.1f},{p[1]:6.1f},{p[2]:6.1f}) bbox x[{lo[0]:.0f},{hi[0]:.0f}] y[{lo[1]:.0f},{hi[1]:.0f}] z[{lo[2]:.0f},{hi[2]:.0f}]")
np.savez_compressed(f"{CACHE}/air_{SUBJECT}.npz", terr=terr2, rest=lblr.astype(np.int32), inside=inside)
