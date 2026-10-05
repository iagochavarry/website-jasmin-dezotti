"""Shared helpers for the CT pipeline (see ../build-head.mjs for the overview).

Frames
  CT   : NRRD/LPS voxel array [i,j,k] -> x = left(+), y = posterior(+), z = superior(+), mm
  P    : "patient axes" in mm, P = (x, z, -y)  => +x left, +y up, +z anterior (same axes as the scene)
  scene: P after the rigid orientation fix (midsagittal plane = x 0, palate horizontal) and the origin shift, mm
"""
import numpy as np, os, json
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
CACHE = os.path.join(ROOT, ".cache/ct")
RAW = os.path.join(CACHE, "raw")
SUBJECT = os.environ.get("CT_SUBJECT", "P099")
H = 0.5  # working resolution (mm)

def load_ct(pid=SUBJECT):
    import nrrd
    img, h = nrrd.read(f"{RAW}/{pid}_img.nrrd")
    seg, _ = nrrd.read(f"{RAW}/lab/labels/{pid}_seg.nrrd")
    sp = np.abs(np.diag(h["space directions"])).astype(float)
    org = np.array(h["space origin"], float)
    return img.astype(np.float32), seg, sp, org

def rot(axis, deg):
    a = np.radians(deg); c, s = np.cos(a), np.sin(a)
    if axis == "x": return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
    if axis == "y": return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])

def load_xf():
    return json.load(open(f"{CACHE}/xf_{SUBJECT}.json"))

def scene_grid_to_ct_index(R, t, c, sp, org, shape_out, origin_out, h=H):
    """Affine (matrix, offset) for scipy.ndimage.affine_transform: output index (scene grid) -> input CT index.
    scene p = R (P - c) + t,  P = (x,z,-y)_mm,  x_mm = org + idx*sp."""
    # output index o -> scene p = origin_out + o*h ; P = R^T (p - t) + c ; ct mm = (P0, -P2, P1) ; idx = (mm - org)/sp
    Rt = np.asarray(R).T
    Mperm = np.array([[1, 0, 0], [0, 0, -1], [0, 1, 0]], float)  # ct_mm = Mperm @ P
    A = np.diag(1 / np.asarray(sp)) @ Mperm @ Rt * h
    off = np.diag(1 / np.asarray(sp)) @ (Mperm @ (Rt @ (np.asarray(origin_out) - np.asarray(t)) + np.asarray(c)) - np.asarray(org))
    return A, off

# ───────────── BodyParts3D (CC BY-SA 2.1 JP) loading: scene cm  ->  scene mm ─────────────
BP = os.path.join(ROOT, ".cache/bodyparts3d")
BP_IDS = dict(frontal=52734, occ=52735, sph=52736, tempR=52738, tempL=52739, eth=52740, nasalR=53647, nasalL=53648,
              maxR=53649, maxL=53650, zygR=52892, zygL=52893, lacR=53645, lacL=53646, palR=53655, palL=53656,
              mand=52748, vomer=9710, parR=52788, parL=52789, cart=71704, eyes=12513, skin=7163, conchaR=54737, conchaL=54738)

def load_stl(path):
    """Binary or ASCII STL -> (vertices (n,3), faces (m,3)) with shared vertices."""
    with open(path, "rb") as f: raw = f.read()
    n = int(np.frombuffer(raw[80:84], "<u4")[0])
    if 84 + 50 * n == len(raw):
        rec = np.frombuffer(raw[84:], dtype=np.dtype([("n", "<f4", 3), ("v", "<f4", (3, 3)), ("a", "<u2")]), count=n)
        tri = rec["v"].reshape(-1, 3).astype(np.float64)
    else:
        import re
        tri = np.array([[float(x) for x in m.groups()] for m in re.finditer(rb"vertex\s+(\S+)\s+(\S+)\s+(\S+)", raw)])
    key = np.round(tri * 1000).astype(np.int64)
    _, first, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
    return tri[first], inv.reshape(-1, 3)

def bp_scene_mm(v):
    """BodyParts3D mm (x left+, y posterior+, z up) -> the old scene frame (cm) -> mm: x, (z-1505)*0.1, -(y+185)*0.1 ."""
    return np.stack([v[:, 0] * 0.1, (v[:, 2] - 1505) * 0.1, -(v[:, 1] + 185) * 0.1], 1) * 10.0

def bp(name_or_fma):
    fma = BP_IDS.get(name_or_fma, name_or_fma)
    v, f = load_stl(f"{BP}/FMA{fma}.stl")
    return bp_scene_mm(v), f

def sample_surface(v, f, spacing=1.0, rng=np.random.default_rng(0)):
    a, b, c = v[f[:, 0]], v[f[:, 1]], v[f[:, 2]]
    area = 0.5 * np.linalg.norm(np.cross(b - a, c - a), axis=1)
    n = np.maximum(1, np.round(area / spacing ** 2).astype(int))
    idx = np.repeat(np.arange(len(f)), n)
    r1, r2 = rng.random(len(idx)), rng.random(len(idx)); s = np.sqrt(r1)
    return a[idx] * (1 - s)[:, None] + b[idx] * (s * (1 - r2))[:, None] + c[idx] * (s * r2)[:, None]

def umeyama(src, dst, scale=True):
    mu_s, mu_d = src.mean(0), dst.mean(0)
    S, D = src - mu_s, dst - mu_d
    U, sig, Vt = np.linalg.svd(D.T @ S / len(src))
    d = np.ones(3); d[-1] = np.sign(np.linalg.det(U) * np.linalg.det(Vt))
    R = U @ np.diag(d) @ Vt
    s = (sig * d).sum() / (S ** 2).sum(1).mean() if scale else 1.0
    return s, R, mu_d - s * R @ mu_s

def load_vol(pid=SUBJECT):
    d = np.load(f"{CACHE}/vol_{pid}.npz")
    return d["hu"], d["lab"], np.asarray(d["bmin"], float), float(d["h"])

# ───────────── meshing ─────────────
MESH_DIR = os.path.join(CACHE, "meshes")

def signed_volume(v, f):
    a, b, c = v[f[:, 0]], v[f[:, 1]], v[f[:, 2]]
    return float(np.einsum("ij,ij->i", a, np.cross(b, c)).sum() / 6)

def taubin(v, f, iters=10, lam=0.5, mu=-0.53, keep=None):
    """Taubin smoothing (volume preserving). keep: optional bool mask of vertices that must not move."""
    import scipy.sparse as sp
    n = len(v)
    e = np.concatenate([f[:, [0, 1]], f[:, [1, 2]], f[:, [2, 0]]])
    A = sp.coo_matrix((np.ones(len(e)), (e[:, 0], e[:, 1])), shape=(n, n)).tocsr()
    A = ((A + A.T) > 0).astype(float)
    d = np.asarray(A.sum(1)).ravel(); d[d == 0] = 1
    P = sp.diags(1 / d) @ A
    v = v.copy()
    for _ in range(iters):
        for k in (lam, mu):
            nv = v + k * (P @ v - v)
            if keep is not None: nv[keep] = v[keep]
            v = nv
    return v

def drop_small(v, f, min_vol_mm3=0.0, min_tris=0):
    """Remove connected components (by vertex connectivity) smaller than the thresholds. Returns compact mesh."""
    import scipy.sparse as sp
    from scipy.sparse.csgraph import connected_components
    n = len(v)
    A = sp.coo_matrix((np.ones(len(f) * 3), (f.ravel(), np.roll(f, -1, 1).ravel())), shape=(n, n))
    k, lab = connected_components(A, directed=False)
    fl = lab[f[:, 0]]
    keepc = np.ones(k, bool)
    for c in range(k):
        m = fl == c
        if m.sum() < min_tris: keepc[c] = False; continue
        if min_vol_mm3 and abs(signed_volume(v, f[m])) < min_vol_mm3: keepc[c] = False
    fm = keepc[fl]; f2 = f[fm]
    used = np.unique(f2); remap = -np.ones(n, np.int64); remap[used] = np.arange(len(used))
    return v[used], remap[f2]

def keep_main(v, f, frac=0.1, min_mm3=30.0):
    """Keep the largest connected component and any other holding >= frac of it (and >= min_mm3)."""
    import scipy.sparse as sp
    from scipy.sparse.csgraph import connected_components
    n = len(v)
    A = sp.coo_matrix((np.ones(len(f) * 3), (f.ravel(), np.roll(f, -1, 1).ravel())), shape=(n, n))
    k, lab = connected_components(A, directed=False)
    if k == 1: return v, f
    fl = lab[f[:, 0]]
    vols = np.array([abs(signed_volume(v, f[fl == c])) for c in range(k)])
    keepc = (vols >= max(frac * vols.max(), min_mm3)) | (vols == vols.max())
    f2 = f[keepc[fl]]
    used = np.unique(f2); remap = -np.ones(n, np.int64); remap[used] = np.arange(len(used))
    return v[used], remap[f2]

def mesh_field(field, origin, h, level=0.5, smooth=8, min_vol=2.0, main=None):
    """Marching cubes on a (cropped) float field with voxel size h. origin = world position of field[0,0,0] (mm).
    Returns (verts mm, faces) closed, outward oriented."""
    from skimage import measure
    f = np.pad(field, 1, constant_values=float(field.min()))
    v, fa, _, _ = measure.marching_cubes(f, level, spacing=(h, h, h))
    v = v + np.asarray(origin) - h
    fa = fa.astype(np.int64)
    if signed_volume(v, fa) < 0: fa = fa[:, ::-1]
    v, fa = drop_small(v, fa, min_vol_mm3=min_vol, min_tris=20)
    if main is not None: v, fa = keep_main(v, fa, main)
    if smooth: v = taubin(v, fa, smooth)
    return v, fa

def mesh_mask(mask, bmin, h, sigma_mm=0.6, pad_mm=3.0, **kw):
    """Gaussian-smoothed indicator -> closed mesh. mask: bool volume on the full grid."""
    from scipy import ndimage as ndi
    ii = np.argwhere(mask)
    if not len(ii): return None
    pad = int(np.ceil((pad_mm + 3 * sigma_mm) / h))
    lo = np.maximum(ii.min(0) - pad, 0); hi = np.minimum(ii.max(0) + pad + 1, mask.shape)
    sl = tuple(slice(a, b) for a, b in zip(lo, hi))
    f = ndi.gaussian_filter(mask[sl].astype(np.float32), sigma_mm / h)
    return mesh_field(f, bmin + lo * h, h, **kw)

def x_shift():
    """+x translation (mm) that puts the septum plane at x = 0 (written by 08_soft.py)."""
    try: return float(json.load(open(f"{CACHE}/frame_{SUBJECT}.json"))["x_shift_mm"])
    except FileNotFoundError: return 0.0

def save_mesh(name, vf):
    os.makedirs(MESH_DIR, exist_ok=True)
    v, f = vf
    with open(f"{MESH_DIR}/{SUBJECT}_{name}.bin", "wb") as fh:
        fh.write(np.array([len(v), len(f)], "<u4").tobytes())
        fh.write(((v + np.array([x_shift(), 0.0, 0.0])) / 10.0).astype("<f4").tobytes())   # mm -> cm, midline (septum plane) at x = 0
        fh.write(f.astype("<u4").tobytes())

def voxelize_solid(v, f, bmin, h, shape, pad=3):
    """Closed surface -> filled boolean mask. Returns (slice tuple, mask crop)."""
    from scipy import ndimage as ndi
    lo = np.maximum(np.floor((v.min(0) - bmin) / h).astype(int) - pad, 0)
    hi = np.minimum(np.ceil((v.max(0) - bmin) / h).astype(int) + pad, shape)
    pts = sample_surface(v, f, spacing=h * 0.55)
    ij = np.floor((pts - bmin) / h).astype(int) - lo
    ok = np.all((ij >= 0) & (ij < hi - lo), 1); ij = ij[ok]
    m = np.zeros(tuple(hi - lo), bool); m[ij[:, 0], ij[:, 1], ij[:, 2]] = True
    m = ndi.binary_closing(m, iterations=1) | m
    m = ndi.binary_fill_holes(m)
    return tuple(slice(a, b) for a, b in zip(lo, hi)), m
