# /// script
# dependencies = ["numpy", "scipy", "scikit-image"]
# ///
"""Step 6: bone mask (threshold + sinus wall shells), teeth, and the partition of the bone into named parts using the
registered BodyParts3D bones. Writes .cache/ct/bone_<subject>.npz (uint8 part-id volume + part names)."""
import numpy as np, sys, os, pickle
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(__file__))
from common import *

hu, lab, bmin, h = load_vol()
shape = hu.shape
sin = np.load(f"{CACHE}/sinus_{SUBJECT}.npz")["L"]
air = np.load(f"{CACHE}/air_{SUBJECT}.npz")["inside"]
bp = pickle.load(open(f"{CACHE}/bp3d_{SUBJECT}.pkl", "rb"))["meshes"]
hs = ndi.gaussian_filter(hu.astype(np.float32), 1.0)
head6 = np.load(f"{CACHE}/head_{SUBJECT}.npz")["head6"]
up = lambda m: np.repeat(np.repeat(np.repeat(m, 2, 0), 2, 1), 2, 2)[:shape[0], :shape[1], :shape[2]]
inhead = up(head6)

# ── 1. solids of the registered BodyParts3D bones ──
order = ["parR", "parL", "occ", "tempR", "tempL", "frontal", "sph", "eth", "maxR", "maxL", "zygR", "zygL", "palR", "palL",
         "mand", "nasalR", "nasalL", "lacR", "lacL", "vomer"]
ID = {n: i + 1 for i, n in enumerate(order)}
solid = np.zeros(shape, np.uint8)
for n in order:
    sl, m = voxelize_solid(*bp[n], bmin, h, shape)
    solid[sl][m] = ID[n]
    print(n, m.sum() * h ** 3 / 1000, "mL", flush=True)

# ── 2. bone envelope ──
# threshold + thin-wall bridging, + ~1.5 mm walls around every sinus and around the nasal airway where it borders bone, closed
# morphologically (r = 2 mm), then the true air (airway, sinuses, ear canal ...) is cut out again and small enclosed voids
# (mastoid / diploic air cells, treated as bone) are filled. 09_mesh subtracts septum, conchae, teeth and the sinus margin.
T_BONE = 200
st = ndi.generate_binary_structure(3, 1)
st2 = ndi.generate_binary_structure(3, 2)
B0 = ndi.binary_closing((hs > T_BONE) & inhead, structure=st, iterations=2) & inhead
S = (sin >= 1) & (sin <= 8)
airway = np.isin(sin, (9, 10, 11))
shellS = ndi.binary_dilation(S, structure=st2, iterations=4) & ~S
near_bone = ndi.binary_dilation(B0, structure=st, iterations=4)
shellA = ndi.binary_dilation(airway, structure=st2, iterations=3) & ~airway & near_bone
try:
    mouth = np.load(f"{CACHE}/ostium_{SUBJECT}.npz")["mouth"]
except Exception:
    mouth = np.zeros(shape, bool)
B1 = (B0 | shellS | shellA) & ~mouth          # the ostium mouths stay open
Benv = ndi.binary_closing(np.pad(B1, 10), structure=st, iterations=6)[10:-10, 10:-10, 10:-10] & inhead   # r = 3 mm
air_all = (hs < -450) & inhead
Benv &= ~air_all | shellS | shellA              # walls we added win over partial-volume "air"
Benv &= ~S & ~airway & ~mouth
# small enclosed voids (not sinus / airway) are bone-internal air cells -> fill
void = ~Benv
lv, nv = ndi.label(void)
szv = np.bincount(lv.ravel()); szv[0] = 0
border = np.unique(np.concatenate([lv[0].ravel(), lv[-1].ravel(), lv[:, 0].ravel(), lv[:, -1].ravel(), lv[:, :, 0].ravel(), lv[:, :, -1].ravel()]))
keepv = ndi.binary_dilation(S | airway, iterations=2)
hasc = np.unique(lv[keepv]); 
fillable = (szv * h ** 3 < 800) & (szv > 0); fillable[border] = False; fillable[hasc] = False
Benv |= fillable[lv] & (lv > 0)
# orbits: the soft tissue around each globe (fat, muscles, nerve) is segmented as the connected non-bone, non-air region inside a
# 32 mm ball around the eye (open towards the lid at z = eye + 14 mm). Walls >= ~1 mm are then built between the orbit and the
# neighbouring sinus / nasal airway (lamina papyracea, orbital floor), which are too thin to survive the threshold on this CT.
import json
orbit_all = np.zeros(shape, bool)
try:
    eyes_ = json.load(open(f"{CACHE}/eyes_{SUBJECT}.json"))
except FileNotFoundError:
    eyes_ = {}
cavities = S | airway | air_all
for nm, (c, r) in eyes_.items():
    c = np.array(c); R_ = 32.0
    lo_ = np.maximum(((c - R_ - bmin) / h).astype(int), 0); hi_ = np.minimum(((c + R_ - bmin) / h).astype(int) + 1, shape)
    sl_ = tuple(slice(a_, b_) for a_, b_ in zip(lo_, hi_))
    g = np.indices(Benv[sl_].shape).reshape(3, -1).T + lo_
    pw = g * h + bmin
    ball = (np.linalg.norm(pw - c, axis=1) < R_).reshape(Benv[sl_].shape)
    ant = (pw[:, 2] <= c[2] + 14.0).reshape(Benv[sl_].shape)
    free = ~Benv[sl_] & ~cavities[sl_] & ball & ant & inhead[sl_]
    free = ndi.binary_opening(free, iterations=1)
    lbl, n_ = ndi.label(free)
    ci = np.round((c - bmin) / h).astype(int) - lo_
    comp = lbl == lbl[tuple(ci)]
    if lbl[tuple(ci)] == 0: print("orbit seed failed", nm); continue
    comp = ndi.binary_closing(comp, iterations=2)
    oc = np.zeros(shape, bool); oc[sl_] = comp; orbit_all |= oc
    print(nm, "orbit soft-tissue volume mL", round(comp.sum() * h ** 3 / 1000, 1))
near_cav = ndi.binary_dilation(S | airway, iterations=6)
orb_wall = ndi.binary_dilation(orbit_all, structure=st2, iterations=5) & near_cav & ~orbit_all & ~S & ~airway & ~mouth
Benv |= orb_wall
Benv &= ~orbit_all
for nm, (c, r) in eyes_.items():
    c = np.array(c); lo_ = np.maximum(((c - r - 4 - bmin) / h).astype(int), 0); hi_ = ((c + r + 4 - bmin) / h).astype(int)
    sl_ = tuple(slice(a_, b_) for a_, b_ in zip(lo_, hi_))
    g = np.indices(Benv[sl_].shape).reshape(3, -1).T + lo_
    d = np.linalg.norm(g * h + bmin - c, axis=1).reshape(Benv[sl_].shape)
    Benv[sl_] &= d > r + 1.0
# ── constructed walls in the ethmoid / lacrimal / medial-orbit / lateral-wall / nasal-root region (the CT lattice there reads as noise) ──
# walls = shells around the ethmoid cells (~1 mm), a continuous plate between orbit and cells (lamina papyracea), a ~1 mm shell
# around the airway (lateral wall, uncinate/bulla relief comes from the real airway shape), plus only the THICK CT bone (opening
# r = 1.5 mm) there; light closing + gaussian smoothing so it reads as one smooth bone. Legibility, not CT truth.
sx = lambda v, a_: int(round((v - bmin[a_]) / h))
xm_ = float(np.load(f"{CACHE}/sinus_{SUBJECT}.npz")["mid"])
roi = (slice(sx(xm_ - 18, 0), sx(xm_ + 18, 0)), slice(sx(-6, 1), sx(40, 1)), slice(sx(-58, 2), sx(12, 2)))
pad_ = 12
roi_p = tuple(slice(max(r_.start - pad_, 0), r_.stop + pad_) for r_ in roi)
cells = np.isin(sin, (5, 6))
Bc = Benv[roi_p]; cav = (S | airway | orbit_all | mouth)[roi_p]
thick = ndi.binary_opening(Bc, structure=st, iterations=3)
cl_ = cells[roi_p]; S_ = S[roi_p]; ao_ = airway[roi_p]; or_ = orbit_all[roi_p]
shell_cells = ndi.binary_dilation(cl_, structure=st2, iterations=5) & ~cl_
lamina = ndi.binary_dilation(or_, structure=st2, iterations=5) & ndi.binary_dilation(S_ | ao_, iterations=9)
shell_air = ndi.binary_dilation(ao_, structure=st2, iterations=5) & ~ao_
shell_sin = ndi.binary_dilation(S_, structure=st2, iterations=5) & ~S_
const = (shell_cells | lamina | shell_sin | thick) & ~cav   # no extra airway shell: it left fins across the conchae
const = ndi.binary_closing(np.pad(const, 6), structure=st, iterations=3)[6:-6, 6:-6, 6:-6] & ~cav
const = ndi.gaussian_filter(const.astype(np.float32), 1.1) > 0.45
const &= ~cav
inner = tuple(slice(r_.start - p_.start, r_.stop - p_.start) for r_, p_ in zip(roi, roi_p))
newroi = Benv[roi_p].copy(); newroi[inner] = const[inner]
Benv[roi_p] = newroi
np.savez_compressed(f"{CACHE}/orbit_{SUBJECT}.npz", orbit=orbit_all)
# ── thin medial maxillary wall: shells around sinus + airway + closing stack up to 8-10 mm. Between each maxillary lumen and the
# nasal airway keep only a plate hugging the sinus (<= 3.5 mm from the lumen, ~2.5 mm after the 1 mm gap carved in 09), y > -16 mm
# (above the palate). The ostium mouths stay open. Legibility, not CT truth.
mx_ = np.isin(sin, (1, 2))
dS_ = ndi.distance_transform_edt(~mx_) * h
dA_ = ndi.distance_transform_edt(~airway) * h
yy_ = (bmin[1] + np.arange(shape[1]) * h)[None, :, None]
zone_ = (dS_ < 12) & (dA_ < 12) & (yy_ > -16) & ~mx_
Benv &= ~(zone_ & (dS_ > 3.5))
Benv &= ~mouth
B = Benv
# nearest BodyParts3D bone (1 mm grid) -> proximity filter + partition of the bone
sol1 = solid[::2, ::2, ::2]
dist, idx = ndi.distance_transform_edt(sol1 == 0, return_indices=True)
near1 = sol1[tuple(idx)]
dist_full = np.repeat(np.repeat(np.repeat(dist, 2, 0), 2, 1), 2, 2)[:shape[0], :shape[1], :shape[2]] * 2 * h
near = up(near1)
owner = np.where(solid > 0, solid, near)
B &= (dist_full < 6.0) | (solid > 0)
# keep only components attached to the skull (> 30 mm3)
lb, nb = ndi.label(B)
sz = np.bincount(lb.ravel()); sz[0] = 0
big = sz * h ** 3 >= 30
B = big[lb]
print("bone volume mL", B.sum() * h ** 3 / 1000)

# ── 3. teeth: dense voxels near the registered tooth rows ──
parts = np.zeros(shape, np.uint8)
parts[B] = owner[B]
np.savez_compressed(f"{CACHE}/bone_{SUBJECT}.npz", parts=parts, B=B, order=np.array(order), shell=shellS)
for n in order: print(f"{n:8s} {(parts == ID[n]).sum() * h ** 3 / 1000:7.2f} mL")
