# /// script
# dependencies = ["numpy", "scipy", "scikit-image"]
# ///
"""Step 9: build every part mask and mesh it (marching cubes on gaussian-smoothed indicators, Taubin smoothing).
Complementary partitions use the same sigma, so their level sets cannot overlap (g_A + g_B <= 1).
Writes .cache/ct/meshes/<subject>_<part>.bin (cm) and parts_<subject>.json (volumes, bboxes)."""
import numpy as np, sys, os, pickle, json
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(__file__))
from common import *

hu, lab, bmin, h = load_vol(); shape = hu.shape
valid = np.load(f"{CACHE}/vol_{SUBJECT}.npz")["valid"].astype(bool)
sn = np.load(f"{CACHE}/sinus_{SUBJECT}.npz"); L = sn["L"]; mid = float(sn["mid"])
bn = np.load(f"{CACHE}/bone_{SUBJECT}.npz"); parts = bn["parts"]; order = list(bn["order"]); B = bn["B"]
soft = np.load(f"{CACHE}/soft0_{SUBJECT}.npz"); sep = soft["sep"]; conch = soft["conchae"]
teeth = np.load(f"{CACHE}/teeth_{SUBJECT}.npz")["teeth"]
hs = ndi.gaussian_filter(hu.astype(np.float32), 1.0)
reg = pickle.load(open(f"{CACHE}/bp3d_{SUBJECT}.pkl", "rb"))["meshes"]
SIG = 0.45
ID = {n: i + 1 for i, n in enumerate(order)}
out = {}
def emit(name, mask, sigma=SIG, **kw):
    try: r = mesh_mask(mask, bmin, h, sigma_mm=sigma, **kw)
    except ValueError: r = None
    if r is None or len(r[1]) == 0: print("EMPTY", name); return
    save_mesh(name, r); out[name] = r
    print(f"{name:28s} {len(r[1]):7d} tris  {abs(signed_volume(*r)) / 1000:8.3f} mL", flush=True)

# ── sinuses ──
S_ids = {"seio_maxilar_dir": 1, "seio_maxilar_esq": 2, "seio_frontal_dir": 3, "seio_frontal_esq": 4, "seio_etmoidal_dir": 5,
         "seio_etmoidal_esq": 6, "seio_esfenoidal_dir": 7, "seio_esfenoidal_esq": 8}
for n, k in S_ids.items():
    m = L == k
    ii = np.argwhere(m); lo_ = ii.min(0) - 2; hi_ = ii.max(0) + 3; sl_ = tuple(slice(max(a, 0), b) for a, b in zip(lo_, hi_))
    # mucosal droplets / partial-volume specks inside the lumen would become tiny internal shells (pin-holes in the caps): fill them
    mm = m[sl_]; mm = ndi.binary_fill_holes(mm) | ndi.binary_closing(mm, iterations=1) & ~B[sl_]
    if k in (1, 2, 3, 4, 7, 8):   # smooth lumens: absorb bone spicules / partial septa shorter than ~2 mm (leaves ethmoid cells alone)
        ball = ndi.generate_binary_structure(3, 1)
        it_ = 8 if k in (1, 2) else 4   # maxillary lumens are smooth: absorb ridges / canals up to ~4 mm wide
        cl_ = ndi.binary_closing(np.pad(mm, it_ + 2), structure=ball, iterations=it_)[it_ + 2:-it_ - 2, it_ + 2:-it_ - 2, it_ + 2:-it_ - 2]
        mm = mm | (cl_ & (L[sl_] == 0))
        if k in (1, 2):   # the maxillary lumen is star-convex: whatever sits deep inside its hull (ridges, canal, septa stubs) is lumen
            hull_ = ndi.binary_erosion(ndi.binary_fill_holes(cl_), iterations=1)
            mm = mm | (hull_ & np.isin(L[sl_], (0, 5, 6)))   # ethmoid fragments inside a maxillary hull are maxillary
    m = np.zeros(shape, bool); m[sl_] = mm
    if k not in (1, 2): m &= ~ndi.binary_dilation(np.isin(L, (1, 2)), iterations=2)
    if k not in (1, 2): m &= ~ndi.binary_dilation(sep, iterations=1)   # the septal plate is continuous: it cuts any cell lying on the midline   # neighbours keep 1 mm away from the maxillary lumen
    L[m & np.isin(L, (0, 5, 6)) if k in (1, 2) else m & (L == 0)] = k
    emit(n, m, 0.45, min_vol=(10 if k in (5, 6) else 5), main=(None if k in (5, 6) else 1.0))
S = (L >= 1) & (L <= 8)
# cutters (sinus grown by 1 mm) used by build-head.mjs to carve tooth roots out of the sinus floor without coplanar faces
for k_, n_ in ((1, 'cut_maxilar_dir'), (2, 'cut_maxilar_esq')):
    r_ = mesh_mask(ndi.binary_dilation(L == k_, iterations=2), bmin, h, sigma_mm=0.45)
    save_mesh(n_, r_)
# ── septum: cartilage / perpendicular plate / vomer ──
wall = ndi.binary_dilation(np.isin(L, (1, 2, 3, 4, 7, 8)), iterations=2)
sep = sep & ~wall
cls = np.zeros(shape, np.uint8)
sol = {}
for n in ("eth", "vomer"):
    sl, m = voxelize_solid(*reg[n], bmin, h, shape); z = np.zeros(shape, bool); z[sl] = m; sol[n] = z
# septal cartilage = the mid-line component of the BodyParts3D nasal cartilage
cv, cf = reg["cart"]
import scipy.sparse as sp
from scipy.sparse.csgraph import connected_components
A_ = sp.coo_matrix((np.ones(cf.size), (cf.ravel(), np.roll(cf, -1, 1).ravel())), shape=(len(cv),) * 2)
nc, lc = connected_components(A_, directed=False)
cart_parts = []
for c in range(nc):
    ff = cf[lc[cf[:, 0]] == c]
    if len(ff) < 30: continue
    vv = cv[np.unique(ff)]
    cart_parts.append((c, ff, vv.mean(0)))
cart_parts.sort(key=lambda t: abs(t[2][0] - mid))
print("cartilage components", [(round(t[2][0], 1), round(t[2][1], 1), round(t[2][2], 1), len(t[1])) for t in cart_parts[:6]])
pickle.dump(dict(cart=cart_parts), open(f"{CACHE}/cart_{SUBJECT}.pkl", "wb"))
cc, cff, _ = cart_parts[0]
sl, m = voxelize_solid(cv, cff, bmin, h, shape); septc = np.zeros(shape, bool); septc[sl] = m
mk = np.zeros(shape, np.uint8); mk[septc] = 1; mk[sol["eth"] & ~septc] = 2; mk[sol["vomer"] & ~septc & ~sol["eth"]] = 3
ii = np.argwhere(sep); lo = ii.min(0); hi = ii.max(0) + 1
sl = tuple(slice(a, b) for a, b in zip(lo, hi))
d, idx = ndi.distance_transform_edt(mk[sl] == 0, return_indices=True)
nearest = mk[sl][tuple(idx)]
# smooth the three-way split (majority of gaussian-weighted votes, sigma 1.5 mm): a clean boundary between plate and vomer / cartilage
votes = np.stack([ndi.gaussian_filter((nearest == q).astype(np.float32), 1.5 / h) for q in (1, 2, 3)])
nearest = votes.argmax(0).astype(np.uint8) + 1
cl = np.zeros(shape, np.uint8); cl[sl] = np.where(sep[sl], nearest, 0)
for n, k in (("septo_cartilagem", 1), ("septo_lamina_perpendicular", 2), ("vomer", 3)):
    print(n, (cl == k).sum() * h ** 3 / 1000, "mL")
np.savez_compressed(f"{CACHE}/septum_{SUBJECT}.npz", cl=cl)
for n, k in (("septo_cartilagem", 1), ("septo_lamina_perpendicular", 2), ("vomer", 3)): emit(n, cl == k, 0.7, main=0.05)
# ── conchae ──
cn = {"concha_inferior_dir": 11, "concha_media_dir": 12, "concha_inferior_esq": 14, "concha_media_esq": 15}
for n, k in cn.items(): emit(n, conch == k, 0.8, main=(0.1 if 'media' in n else 1.0), min_vol=20)   # a middle concha may have a detached posterior end
# cutters: parts a little larger than the visible ones (sinus / concha / septum grown by 0.5 mm), subtracted from the bone meshes by
# build-head.mjs, so bone can never poke through a turbinate or cross a sinus (the visible surface is always on top)
for n, k in cn.items():
    r_ = mesh_mask(ndi.binary_dilation(conch == k, iterations=1), bmin, h, sigma_mm=0.8, main=1.0)
    if r_ is not None: save_mesh("cut_" + n, r_)
for n, k in S_ids.items():
    if k in (5, 6): continue
    r_ = mesh_mask(ndi.binary_dilation(L == k, iterations=1), bmin, h, sigma_mm=0.45, main=1.0)
    if r_ is not None: save_mesh("cut_" + n, r_)
# ── bone ──
tmask = teeth > 0
Bf = B & ~ndi.binary_dilation(sep, iterations=1) & ~ndi.binary_dilation(conch > 0, iterations=2) & ~ndi.binary_dilation(tmask, iterations=1) & ~ndi.binary_dilation(S, iterations=2)
np.savez_compressed(f"{CACHE}/dbg.npz", hu=hu, k=(Bf.astype(np.uint8) + 2 * S.astype(np.uint8)), bmin=bmin, h=h)
# the nearest-BodyParts3D owner labels interleave in the thin ethmoid / lacrimal / orbit / nasal-root bone (mis-registration of a few
# mm), which meshes as a lattice of crumbs: majority-smooth the owner field (sigma 2.6 mm) over the facial bones
face_ids = [order.index(n) + 1 for n in ("frontal", "sph", "eth", "maxR", "maxL", "zygR", "zygL", "palR", "palL", "nasalR", "nasalL", "lacR", "lacL")]
fm = np.isin(parts, face_ids) & Bf
ii_ = np.argwhere(fm); lo_f = np.maximum(ii_.min(0) - 6, 0); hi_f = np.minimum(ii_.max(0) + 7, shape)
sl_f = tuple(slice(a_, b_) for a_, b_ in zip(lo_f, hi_f))
fmc = fm[sl_f]; pc = parts[sl_f]
best_ = np.zeros(fmc.shape, np.float32); lab_ = np.zeros(fmc.shape, np.uint8)
for i_ in face_ids:
    g_ = ndi.gaussian_filter(((pc == i_) & fmc).astype(np.float32), 2.6 / h)
    upd = g_ > best_; best_[upd] = g_[upd]; lab_[upd] = i_
parts = parts.copy(); pc2 = parts[sl_f]; pc2[fmc] = lab_[fmc]; parts[sl_f] = pc2
# vomer-owned bone farther than 3 mm from the septum plane is really palatine / maxillary crest: re-own it, so the vomer mesh is a plate
sx_ = -x_shift(); xs_ = (bmin[0] + np.arange(shape[0]) * h)[:, None, None]
vo_ = ID["vomer"]; far = (parts == vo_) & (np.abs(xs_ - sx_) > 3.0)
parts = parts.copy(); parts[far & (xs_ < sx_)] = ID["palR"]; parts[far & (xs_ >= sx_)] = ID["palL"]
names = {"parR": "osso_parietal", "parL": "osso_parietal", "occ": "osso_occipital", "tempR": "osso_temporal_dir", "tempL": "osso_temporal_esq",
         "frontal": "osso_frontal", "sph": "osso_esfenoide", "eth": "osso_etmoide", "maxR": "maxila_dir", "maxL": "maxila_esq",
         "zygR": "osso_zigomatico_dir", "zygL": "osso_zigomatico_esq", "palR": "osso_palatino_dir", "palL": "osso_palatino_esq",
         "mand": "mandibula", "nasalR": "osso_nasal_dir", "nasalL": "osso_nasal_esq", "lacR": "osso_lacrimal_dir", "lacL": "osso_lacrimal_esq", "vomer": "vomer_osso"}
SIGMA = {"maxila_dir": 0.55, "maxila_esq": 0.55, "osso_zigomatico_dir": 0.55, "osso_zigomatico_esq": 0.55, "osso_lacrimal_dir": 0.5, "osso_lacrimal_esq": 0.5, "osso_etmoide": 0.5, "osso_frontal": 0.55, "osso_nasal_dir": 0.5, "osso_nasal_esq": 0.5, "osso_palatino_dir": 0.5, "osso_palatino_esq": 0.5, "osso_esfenoide": 0.55, "osso_parietal": 1.0, "osso_occipital": 1.0, "osso_temporal_dir": 0.8, "osso_temporal_esq": 0.8, "mandibula": 0.7}
groups = {}
for k, n in names.items(): groups.setdefault(n, []).append(ID[k])
for n, ids in groups.items():
    m = np.isin(parts, ids) & Bf
    if n == "vomer_osso":
        cl_v = cl == 3
        m = m | cl_v   # leftover vomer-labelled bone joins the septal vomer
        out.pop("vomer", None); emit("vomer", m, 0.7, level=0.5, main=0.05); continue
    emit(n, m, SIGMA.get(n, 0.4), level=0.36, min_vol=12.0, main=(0.0 if n in ('osso_parietal',) else 0.12))   # thin cortical plates survive a low level; neighbours then overlap instead of cracking
json.dump({n: dict(tris=int(len(r[1])), ml=abs(signed_volume(*r)) / 1000) for n, r in out.items()}, open(f"{CACHE}/parts_{SUBJECT}.json", "w"))
