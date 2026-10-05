# /// script
# dependencies = ["numpy", "scipy"]
# ///
"""Step 5b: maxillary ostium / infundibulum. The CT only shows it as partial volume, so it is constructed: a straight 3 mm tube from the
upper medial wall of each maxillary lumen (posterior-superior third, y ~ +1...+9 mm, z ~ -37...-25 mm) through the wall into the
middle-meatus airway lateral to the middle turbinate. The tube is added to the maxillary label; `ostium_<subject>.npz` holds the
mouth region (sphere r 3 mm at the airway end) where 06_bone leaves the wall open; ostium_<subject>.json lists the mouth centres."""
import numpy as np, sys, os, json
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(__file__))
from common import *
hu, lab, bmin, h = load_vol(); shape = hu.shape
sn = np.load(f"{CACHE}/sinus_{SUBJECT}.npz"); L = sn["L"].copy(); mid = float(sn["mid"])
mouth = np.zeros(shape, bool); info = {}
ix = lambda p: np.round((np.asarray(p) - bmin) / h).astype(int)
for k, nk, nm in ((1, 9, "dir"), (2, 10, "esq")):
    S = L == k; N = L == nk
    dN = ndi.distance_transform_edt(~N) * h
    pos = np.argwhere(S) * h + bmin
    sel = (pos[:, 1] > 2.5) & (pos[:, 1] < 9) & (pos[:, 2] > -37) & (pos[:, 2] < -25)
    cand = pos[sel]; dd = dN[tuple(ix(cand).T)]
    start = cand[np.argmin(dd)]
    npos = np.argwhere(N) * h + bmin
    # airway end: nearest airway voxel in the same height band, medial to the sinus
    band = npos[(np.abs(npos[:, 1] - start[1]) < 4) & (np.abs(npos[:, 2] - start[2]) < 6)]
    end = band[np.argmin(np.linalg.norm(band - start, axis=1))]
    d = (end - start) / max(np.linalg.norm(end - start), 1e-6)
    p0, p1 = start - d * 3.0, end + d * 1.5        # reach into the lumen and 1.5 mm into the airway
    t = np.linspace(0, 1, 200)[:, None]; line = p0 + (p1 - p0) * t
    lo = ix(np.minimum(p0, p1) - 6); hi = ix(np.maximum(p0, p1) + 6) + 1
    sl = tuple(slice(a, b) for a, b in zip(lo, hi))
    g = np.indices(L[sl].shape).reshape(3, -1).T + lo
    pw = g * h + bmin
    dist = np.full(len(pw), 1e9)
    for q in line[::4]: dist = np.minimum(dist, np.linalg.norm(pw - q, axis=1))
    tube = (dist.reshape(L[sl].shape) <= 2.0)
    Lc = L[sl]; Lc[tube & ~np.isin(Lc, (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11))] = k
    # voxels of the airway label inside the tube stay airway; the part of the tube in the wall becomes maxillary
    L[sl] = Lc
    md = np.linalg.norm(pw - end, axis=1).reshape(L[sl].shape) <= 3.5
    mm = np.zeros(shape, bool); mm[sl] = md; mouth |= mm
    info[nm] = dict(start=start.tolist(), mouth=end.tolist(), length_mm=float(np.linalg.norm(end - start)))
    print(nm, "start", start.round(1), "mouth", end.round(1), "length mm", round(float(np.linalg.norm(end - start)), 1), "wall voxels labelled", int((tube & (Lc == k)).sum()))
np.savez_compressed(f"{CACHE}/sinus_{SUBJECT}.npz", L=L, mid=mid)
np.savez_compressed(f"{CACHE}/ostium_{SUBJECT}.npz", mouth=mouth)
json.dump(info, open(f"{CACHE}/ostium_{SUBJECT}.json", "w"))
