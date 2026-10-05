# /// script
# dependencies = ["numpy", "scipy", "pynrrd"]
# ///
"""Step 1: find the rigid transform that puts the midsagittal plane at x = 0 and the nasal floor/palate horizontal."""
import numpy as np, json, sys
from scipy import ndimage as ndi
from scipy.optimize import minimize
sys.path.insert(0, __import__("os").path.dirname(__file__))
from common import *

img, seg, sp, org = load_ct()
print("CT", img.shape, sp, org)
# patient-axes volume P (x left, y up, z ant) at 2 mm from the bone field, centred in mm
G = 2.0
Pdim = np.array([img.shape[0] * sp[0], img.shape[2] * sp[2], img.shape[1] * sp[1]])
P0 = np.array([org[0], org[2], -(org[1] + (img.shape[1] - 1) * sp[1])])  # min corner of the P box
n = np.ceil(Pdim / G).astype(int)
# build with an identity transform
c0 = P0 + Pdim / 2
A, off = scene_grid_to_ct_index(np.eye(3), np.zeros(3), c0, sp, org, n, -n * G / 2, G)
sm = ndi.gaussian_filter(np.clip(img, -200, 1500), 1.0)  # light
A0, off0 = scene_grid_to_ct_index(np.eye(3), np.zeros(3), c0, sp, org, n, -n * G / 2, G)
base = ndi.affine_transform(sm, A0, off0, output_shape=tuple(n), order=1, cval=-1000)
ctr = (np.array(n) - 1) / 2
def vol(R, t):
    # output index o (about the grid centre) <- input index = R^T (o - ctr - t/G) + ctr
    Rt = np.asarray(R).T
    off = ctr - Rt @ (ctr + np.asarray(t) / G)
    return ndi.affine_transform(base, Rt, off, order=1, cval=-1000)
# use only the skull: bone > 300 and above the mandible (y in the upper 62% of the box covers vault + face down to the maxilla)
def score(p):
    yaw, roll, tx = p
    R = rot("z", roll) @ rot("y", yaw)
    v = vol(R, np.array([tx, 0, 0]))
    b = ndi.gaussian_filter((v > 250).astype(np.float32), 1.5)
    # skull region: exclude the bottom 25 mm of the box (neck) and the table (posterior-inferior)
    m = b[:, int(n[1] * 0.28):, :]
    f = m[::-1]
    return -float((np.minimum(m, f)).sum() / (np.maximum(m, f).sum() + 1e-6))
best = None
for yaw0 in (-4, 4):
    for roll0 in (-4, 4):
        r = minimize(score, [yaw0, roll0, 0], method="Nelder-Mead", options=dict(xatol=0.05, fatol=1e-5, initial_simplex=np.array([[yaw0, roll0, 0], [yaw0 + 2, roll0, 0], [yaw0, roll0 + 2, 0], [yaw0, roll0, 3]])))
        print(yaw0, roll0, r.x.round(2), round(r.fun, 4), flush=True)
        if best is None or r.fun < best.fun: best = r
yaw, roll, tx = best.x
print("best", best.x, best.fun)
json.dump(dict(yaw=yaw, roll=roll, tx=float(tx), c0=c0.tolist()), open(f"{CACHE}/xf0_{SUBJECT}.json", "w"))
