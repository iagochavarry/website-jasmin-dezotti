# /// script
# dependencies = ["numpy", "scipy", "scikit-image"]
# ///
"""Step 11: nasal cartilages. Not separable on CT, so the BodyParts3D upper/lower lateral cartilages are placed in the nose:
rigid+scale start = the registration of the nasal bones, then a small translation search that keeps them inside the soft
tissue of the nose (inside the skin, outside the nasal airway and bone)."""
import numpy as np, sys, os, pickle
from scipy import ndimage as ndi
import scipy.sparse as sp
from scipy.sparse.csgraph import connected_components
sys.path.insert(0, os.path.dirname(__file__))
from common import *
hu, lab, bmin, h = load_vol(); shape = hu.shape
reg = pickle.load(open(f"{CACHE}/bp3d_{SUBJECT}.pkl", "rb"))
sn = np.load(f"{CACHE}/sinus_{SUBJECT}.npz"); mid = float(sn["mid"]); L = sn["L"]
hs = ndi.gaussian_filter(hu.astype(np.float32), 1.0)
cv0, cf = bp("cart")
A_ = sp.coo_matrix((np.ones(cf.size), (cf.ravel(), np.roll(cf, -1, 1).ravel())), shape=(len(cv0),) * 2)
nc, lc = connected_components(A_, directed=False)
comps = []
for c in range(nc):
    ff = cf[lc[cf[:, 0]] == c]
    if len(ff) < 30: continue
    comps.append((np.unique(ff), ff))
tissue = hs > -250
air_nose = np.isin(L, (9, 10))
Bbone = np.load(f"{CACHE}/bone_{SUBJECT}.npz")["B"]
def tf(T, v): s, R, t = T; return s * v @ R.T + t
Tg = reg["global"]
# local anchor: shift so that the globally registered BodyParts3D nasal bones land on the CT nasal bones
bn = np.load(f"{CACHE}/bone_{SUBJECT}.npz"); order = list(bn["order"]); parts = bn["parts"]
ids = [order.index("nasalR") + 1, order.index("nasalL") + 1]
ct_nb = (np.argwhere(np.isin(parts, ids) & Bbone) * h + bmin).mean(0)
bp_nb = np.concatenate([tf(Tg, bp("nasalR")[0]), tf(Tg, bp("nasalL")[0])]).mean(0)
shift0 = ct_nb - bp_nb
print("nasal bone centroid CT", ct_nb.round(1), "BP3D(global)", bp_nb.round(1), "shift", shift0.round(1))
Tavg = (Tg[0], Tg[1], Tg[2] + shift0)
def inside_score(pts):
    ij = np.round((pts - bmin) / h).astype(int)
    ok = np.all((ij >= 0) & (ij < shape), 1); ij = ij[ok]
    t = tissue[ij[:, 0], ij[:, 1], ij[:, 2]]
    a = air_nose[ij[:, 0], ij[:, 1], ij[:, 2]]
    b = Bbone[ij[:, 0], ij[:, 1], ij[:, 2]]
    return (t & ~a & ~b).mean()
from scipy.optimize import minimize
bnp = np.load(f"{CACHE}/bone_{SUBJECT}.npz"); parts_ = bnp["parts"]
nasal = np.isin(parts_, ids) & Bbone
sepm = np.load(f"{CACHE}/septum_{SUBJECT}.npz")["cl"] > 0
ii = np.argwhere(nasal | sepm); lo = np.maximum(ii.min(0) - 40, 0); hi = np.minimum(ii.max(0) + 41, shape)
sl = tuple(slice(a_, b_) for a_, b_ in zip(lo, hi))
d_nb = ndi.distance_transform_edt(~nasal[sl]) * h
d_sep = ndi.distance_transform_edt(~sepm[sl]) * h
tis = tissue[sl]; anose = air_nose[sl]; bb = Bbone[sl]
xi = int(round((mid - bmin[0]) / h))
prof = (hs[xi - 4:xi + 5].max(0) > -250)
tip_z = max(np.where(prof[int(round((y - bmin[1]) / h))])[0].max() * h + bmin[2] for y in range(-24, -4, 2))
print("skin tip z", tip_z)
# classify the components first (centre in the starting registration): septal / lateral / alar
cen0 = {k: tf(Tavg, cv0[vi]).mean(0) for k, (vi, ff) in enumerate(comps)}
sept_k = min(cen0, key=lambda k: abs(cen0[k][0] - mid))
others = [k for k in cen0 if k != sept_k]
ysorted = sorted(cen0[k][1] for k in others); ymid = 0.5 * (ysorted[len(ysorted) // 2 - 1] + ysorted[len(ysorted) // 2])
alar = [k for k in others if cen0[k][1] <= ymid]; lat = [k for k in others if cen0[k][1] > ymid]
pts = {k: sample_surface(cv0, comps[k][1], 0.8) for k in others}
P_al = np.concatenate([pts[k] for k in alar]); P_la = np.concatenate([pts[k] for k in lat])
piv = np.array([mid, 3.0, 16.0])
def xf(p, q):  # similarity: isotropic scale + pitch about x + shift, about the rhinion pivot
    s_, rx, tx, ty, tz = q
    R = rot("x", rx)
    return piv + s_ * (R @ (tf(Tavg, p) - piv).T).T + [tx, ty, tz]
def cost(q):
    A = xf(P_al, q); Lt = xf(P_la, q); allp = np.concatenate([A, Lt])
    ij = np.round((allp - bmin) / h).astype(int) - lo
    ok = np.all((ij >= 0) & (ij < np.array(tis.shape)), 1); ij2 = ij[ok]
    inside = (tis[tuple(ij2.T)] & ~anose[tuple(ij2.T)] & ~bb[tuple(ij2.T)]).sum() / len(allp)
    top = Lt[Lt[:, 1] >= np.percentile(Lt[:, 1], 80)]
    ijt = np.clip(np.round((top - bmin) / h).astype(int) - lo, 0, np.array(tis.shape) - 1)
    dn = d_nb[tuple(ijt.T)].mean()                     # upper edge of the upper lateral cartilages sits under the nasal bones
    ija = np.clip(np.round((A - bmin) / h).astype(int) - lo, 0, np.array(tis.shape) - 1)
    ds = np.sort(d_sep[tuple(ija.T)])[: max(1, len(ija) // 5)].mean()   # alar medial crura meet the anterior edge of the septum
    dome = A[:, 2].max()
    return -inside + 0.04 * dn + 0.05 * ds + 0.03 * abs(dome - (tip_z - 3.5)) + 0.02 * abs(q[0] - 1) * 10
best = None
for s0 in (0.95, 1.05, 1.15):
    r = minimize(cost, [s0, 0, 0, 0, 0], method="Nelder-Mead", options=dict(xatol=0.05, fatol=1e-4, maxiter=400, initial_simplex=np.array([[s0, 0, 0, 0, 0], [s0 + .08, 0, 0, 0, 0], [s0, 6, 0, 0, 0], [s0, 0, 3, 0, 0], [s0, 0, 0, 3, 0], [s0, 0, 0, 0, 3]])))
    print("start", s0, "->", np.round(r.x, 2), round(r.fun, 3)); best = r if best is None or r.fun < best.fun else best
q = best.x
A = xf(P_al, q); Lt = xf(P_la, q)
ij = np.round((np.concatenate([A, Lt]) - bmin) / h).astype(int) - lo; ij = ij[np.all((ij >= 0) & (ij < np.array(tis.shape)), 1)]
print("final: scale %.3f pitch %.1f shift %s  in-tissue %.2f  dome z %.1f (skin tip %.1f)" % (q[0], q[1], q[2:].round(1), (tis[tuple(ij.T)] & ~anose[tuple(ij.T)] & ~bb[tuple(ij.T)]).mean(), A[:, 2].max(), tip_z))
def subdivide(v, f):
    e = {}; nv = list(v); nf = []
    def mid_(a_, b_):
        k = (min(a_, b_), max(a_, b_))
        if k not in e: e[k] = len(nv); nv.append((v[a_] + v[b_]) / 2)
        return e[k]
    for a_, b_, c_ in f:
        ab, bc, ca = mid_(a_, b_), mid_(b_, c_), mid_(c_, a_)
        nf += [[a_, ab, ca], [ab, b_, bc], [ca, bc, c_], [ab, bc, ca]]
    return np.array(nv), np.array(nf)
for k in others:
    vi, ff = comps[k]
    remap = -np.ones(len(cv0), int); remap[vi] = np.arange(len(vi))
    v = xf(cv0[vi], q); f = remap[ff]
    if signed_volume(v, f) < 0: f = f[:, ::-1]
    v, f = subdivide(v, f); v = taubin(v, f, 12)
    cen = v.mean(0)
    kind = "cartilagem_alar" if k in alar else "cartilagem_lateral"
    side = "dir" if cen[0] < mid else "esq"
    print(kind, side, "volume mL", round(signed_volume(v, f) / 1000, 3), "centre", cen.round(1))
    save_mesh(f"{kind}_{side}", (v, f))
