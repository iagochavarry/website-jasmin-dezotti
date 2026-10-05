# /// script
# dependencies = ["numpy", "scipy", "scikit-image"]
# ///
"""Step 8: septum and turbinates (the mucosa-covered tissue enclosed by the nasal airway), globes.
soft labels: 1 septal cartilage, 2 perpendicular plate, 3 vomer, 11/12/13 inferior/middle/superior concha R, 14/15/16 same L,
21/22 globe R/L."""
import numpy as np, sys, os, pickle
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(__file__))
from common import *
hu, lab, bmin, h = load_vol(); shape = hu.shape
L = np.load(f"{CACHE}/sinus_{SUBJECT}.npz")["L"]; mid = float(np.load(f"{CACHE}/sinus_{SUBJECT}.npz")["mid"])
bone = np.load(f"{CACHE}/bone_{SUBJECT}.npz")
hs = ndi.gaussian_filter(hu.astype(np.float32), 1.0)
xs = (bmin[0] + np.arange(shape[0]) * h)
air = hs < -450
S = (L >= 1) & (L <= 8)
AR = (L == 9); AL = (L == 10)   # nasal cavities only (not the nasopharynx)
def span_fill(A, axis):
    """tissue between the first and last airway voxel along `axis`"""
    idx = np.arange(A.shape[axis]).reshape([-1 if i == axis else 1 for i in range(3)])
    big = A.shape[axis] + 5
    first = np.where(A, idx, big).min(axis); last = np.where(A, idx, -1).max(axis)
    first = np.expand_dims(first, axis); last = np.expand_dims(last, axis)
    return (idx >= first) & (idx <= last)
# septum: along x between the right and the left airway (right airway x < mid < left airway x)
sep = np.zeros(shape, bool)
lastR = np.where(AR, np.arange(shape[0])[:, None, None], -1).max(0)       # [y,z] last (most medial) right-airway voxel
firstL = np.where(AL, np.arange(shape[0])[:, None, None], 10 ** 6).min(0)
ok = (lastR >= 0) & (firstL < 10 ** 6) & ((firstL - lastR) * h < 14) & (firstL > lastR)
ix = np.arange(shape[0])[:, None, None]
# the plate is thin (2.6 mm) and follows the centre line between the two airways; the centre line is smoothed (3 mm) and
# interpolated where one airway label is missing (upper left cavity), so it never swallows the turbinates
from scipy.signal import fftconvolve  # noqa
rel = ok & ((firstL - lastR) * h < 8)
c0 = np.where(rel, 0.5 * (lastR + firstL), 0.0).astype(np.float32)
def smooth_c(sig):
    num = ndi.gaussian_filter(c0, sig); den = ndi.gaussian_filter(rel.astype(np.float32), sig)
    return num / np.maximum(den, 1e-6), den
cx, den = smooth_c(6.0); cx2, den2 = smooth_c(24.0)
cx = np.where(den > 0.05, cx, cx2)
foot = ok | ((den > 0.02) & ndi.binary_dilation(ok, iterations=30))
okc = ndi.binary_fill_holes(ndi.binary_closing(np.pad(foot, 40), iterations=30))[40:-40, 40:-40] & ndi.binary_dilation(foot, iterations=40)
foot = foot | okc
def _spans(a, ax):
    n = a.shape[ax]; idx = np.arange(n).reshape([-1, 1] if ax == 0 else [1, -1])
    f = np.where(a, idx, n + 5).min(ax, keepdims=True); l = np.where(a, idx, -1).max(ax, keepdims=True)
    return (idx >= f) & (idx <= l)
foot = foot | (_spans(foot, 0) & _spans(foot, 1))   # orthogonally convex: no windows in the plate (the septum is one plate)
cxmm = bmin[0] + cx * h
sept_x = float(np.median(cxmm[rel]))
# a normal septum is straight: the plate is flattened onto the median plane (this scan's septum bows by up to ~2 mm; keeping that
# would put the plate off the x = 0 cut plane of the UI at some places)
cxmm = sept_x + 0.0 * (cxmm - sept_x)
sep = foot[None] & (np.abs(xs[:, None, None] - cxmm[None]) <= 1.3) & ~np.isin(L, (1, 2, 3, 4, 7, 8))   # the plate separates the left and right ethmoid cells: it wins over cells on the midline
sept_x = float(np.median(cxmm[rel]))
print("septum plane x (median centre line) mm", sept_x, " nasal-cavity mid", mid)
import json; json.dump(dict(x_shift_mm=-sept_x), open(f"{CACHE}/frame_{SUBJECT}.json", "w"))
for xi_ in np.where(sep.any((1, 2)))[0]:   # air pockets / pin-holes inside the plate (seen in sagittal cuts): fill, whatever their density
    sl_ = sep[xi_]; fl_ = ndi.binary_fill_holes(sl_)
    hl_, nh_ = ndi.label(fl_ & ~sl_); sz_ = np.bincount(hl_.ravel()); sz_[0] = 0
    sep[xi_] = sl_ | (np.isin(hl_, np.where((sz_ > 0) & (sz_ <= 500))[0]) & ~np.isin(L[xi_], (1, 2, 3, 4, 7, 8)))
print("septum mL", sep.sum() * h ** 3 / 1000)
sep &= ~np.isin(L, (1, 2, 3, 4, 7, 8))
bn_ = np.load(f"{CACHE}/bone_{SUBJECT}.npz"); vid = list(bn_["order"]).index("vomer") + 1
sepgap = ndi.binary_dilation(sep | ((bn_["parts"] == vid) & (np.abs(xs[:, None, None] - cxmm[None]) < 2.5)), iterations=5)   # the turbinates stay >= 2.5 mm away from the septum (open common meatus)
# turbinates: tissue enclosed by one side's airway along x or along y, not septum, not within 1.2 mm of a sinus
wall = ndi.binary_dilation(S, iterations=2)
turb = {}
for side, A in (("R", AR), ("L", AL)):
    ii = np.argwhere(A); lo = np.maximum(ii.min(0) - 20, 0); hi = np.minimum(ii.max(0) + 21, shape)
    sl = tuple(slice(a_, b_) for a_, b_ in zip(lo, hi))
    Ac = A[sl]; R_ = 4.5 / h
    dil = ndi.distance_transform_edt(~Ac) <= R_
    clo = ndi.distance_transform_edt(np.pad(dil, 1)) [1:-1, 1:-1, 1:-1] > R_
    clo |= Ac
    t = np.zeros(shape, bool)
    t[sl] = clo & (ndi.distance_transform_edt(~Ac) * h < 6.0)
    t = (t | span_fill(A, 0) | span_fill(A, 1)) & ~air & ~S & ~wall & ~sepgap & ~(AR | AL)
    t &= ndi.distance_transform_edt(~A) * h < 6.0
    t = ndi.binary_opening(t, iterations=1)
    lb, n = ndi.label(t); sz = np.bincount(lb.ravel()); sz[0] = 0
    t = (sz * h ** 3 >= 15)[lb]
    turb[side] = t
    print("turbinate tissue", side, t.sum() * h ** 3 / 1000, "mL")

# ── inferior / middle / superior concha: per coronal slice, 2-D components by height above the nasal floor ──
YF = -17.5  # nasal floor (scene origin convention)
yy = bmin[1] + np.arange(shape[1]) * h
soft = np.zeros(shape, np.uint8)
for side, base in (("R", 11), ("L", 14)):
    t = turb[side]
    # height above the nasal floor, per voxel; smooth class indicators so the cut between conchae is a smooth surface
    yy3 = yy[None, :, None] * np.ones(shape, np.float32)
    zz3 = (bmin[2] + np.arange(shape[2]) * h)[None, None, :] * np.ones(shape, np.float32)
    hgt = yy3 - YF
    lab3 = np.where(hgt < 16.5, 1, 2).astype(np.uint8)
    sc = np.stack([ndi.gaussian_filter(((lab3 == k) & t).astype(np.float32), 2.0 / h * 0.5) for k in (1, 2)])
    best = np.zeros(shape, np.uint8); best[t] = sc[:, t].argmax(0).astype(np.uint8) + 1
    cut = ndi.maximum_filter(best, size=3) != ndi.minimum_filter(np.where(best == 0, 9, best), size=3)  # 1 voxel slot between the conchae (meatus)
    cut = ndi.binary_dilation(cut, iterations=3)
    best[cut & (best > 0) & (np.abs(hgt - 16.5) < 4.0)] = 0   # legibility carving: ~3 mm channel where inferior and middle conchae touch
    sup = (best == 2) & (yy3 > 4) & (zz3 < -30)       # the superior concha: postero-superior part of the upper conchal mass
    best[sup] = 3
    for k in (1, 2, 3):   # close small through-holes (seen from the side / front) left by the airway hull
        m = best == k
        for ax in (0, 2):
            add = np.zeros(m.shape, bool); mv = np.moveaxis(m, ax, 0); av = np.moveaxis(add, ax, 0)
            for i_ in np.where(mv.any((1, 2)))[0]:
                f2 = ndi.binary_fill_holes(mv[i_]); hl2, n2 = ndi.label(f2 & ~mv[i_])
                if not n2: continue
                sz2 = np.bincount(hl2.ravel()); sz2[0] = 0
                av[i_] = np.isin(hl2, np.where((sz2 > 0) & (sz2 <= 220))[0])   # holes <= ~7 mm across in that plane
            m = m | (add & ~sepgap & ~S)
        best[m & (best == 0)] = k
    best[best == 3] = 0   # the superior concha is not a clean shell on this CT: not exported
    for k in (1, 2):      # main component only, holes closed
        lbk, nk_ = ndi.label(best == k)
        if nk_ > 1:
            szk = np.bincount(lbk.ravel()); szk[0] = 0
            best[(best == k) & (lbk != np.argmax(szk))] = 0
    soft[best == 1] = base; soft[best == 2] = base + 1
    for k in (1, 2): print("concha", side, k, (soft == base + k - 1).sum() * h ** 3 / 1000, "mL")
# ── left middle concha: the NasalSeg left cavity label hugs only the lower part, so the airway-hull method truncates it (1.3 cm vs
# 3.9 cm on the right). Rebuild it from the (nearly symmetric) right one mirrored about the septum plane, kept where the CT really
# has soft tissue, away from the septum, sinus lumens and the left airway.
mid_i = (mid - bmin[0]) / h
ii_ = np.arange(shape[0]); mir = np.clip(np.round(2 * mid_i - ii_).astype(int), 0, shape[0] - 1)
mR = (soft == 12)[mir]            # mask of the right middle concha reflected to x > mid
tissueL = (hs > -300) & (hs < 400)
# per (y,z) column the reflected concha is slid laterally (<= 4 mm) until it clears the septum gap
cand = np.zeros(shape, bool)
gapL = ndi.binary_dilation(sep, iterations=5)
firstfree = np.where(gapL, np.arange(shape[0])[:, None, None], -1).max(0) + 1     # first x index lateral of the gap on the left
cols = np.argwhere(mR.any(0))
for j, k_ in cols:
    xi_ = np.where(mR[:, j, k_])[0]
    need = firstfree[j, k_] if firstfree[j, k_] > 0 else xi_.min()
    sh = int(np.clip(need - xi_.min(), 0, 8))
    cand[xi_ + sh, j, k_] = True
cand &= (hs > -750) & ~S & ~ndi.binary_dilation(S, iterations=1) & ~gapL & ~AL & ~(soft == 14) & ~(soft > 0)
cand |= (soft == 15)
cand = ndi.binary_closing(np.pad(cand, 4), iterations=2)[4:-4, 4:-4, 4:-4] & ~sepgap & ~S & ~(soft == 14)
for ax in (0, 1, 2):
    cand = np.moveaxis(np.stack([ndi.binary_fill_holes(sl_) for sl_ in np.moveaxis(cand, ax, 0)]), 0, ax) & ~sepgap & ~S | cand
lbk, nk_ = ndi.label(cand)
if nk_ > 1:
    szk = np.bincount(lbk.ravel()); szk[0] = 0; cand = lbk == np.argmax(szk)
soft[(soft == 15)] = 0
soft[cand & (soft == 0)] = 15
iiL = np.argwhere(soft == 15) * h + bmin
print("left middle concha mL", (soft == 15).sum() * h ** 3 / 1000, "z range mm", iiL[:, 2].min(), iiL[:, 2].max(), " right:", (np.argwhere(soft == 12)[:, 2] * h + bmin[2]).min(), (np.argwhere(soft == 12)[:, 2] * h + bmin[2]).max())
np.savez_compressed(f"{CACHE}/soft0_{SUBJECT}.npz", sep=sep, tR=turb["R"], tL=turb["L"], conchae=soft)
np.savez_compressed(f"{CACHE}/dbg.npz", hu=hu, k=np.where(soft > 0, soft - 10, sep.astype(np.uint8) * 7).astype(np.uint8), bmin=bmin, h=h)
