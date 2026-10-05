# /// script
# dependencies = ["numpy", "scipy", "pynrrd"]
# ///
"""Step 2: apply yaw/roll/tx, estimate pitch from the nasal floor (hard palate), set the origin
(x = midline, nasal floor at the inferior turbinate head y = -17.5 mm, anterior nasal spine z = +4 mm),
then resample HU + labels to the scene frame at 0.5 mm and crop to the head."""
import numpy as np, json, sys, os
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(__file__))
from common import *

img, seg, sp, org = load_ct()
x0 = json.load(open(f"{CACHE}/xf0_{SUBJECT}.json"))
c0 = np.array(x0["c0"])
yaw, roll, tx = x0["yaw"], x0["roll"], x0["tx"]
Pdim = np.array([img.shape[0] * sp[0], img.shape[2] * sp[2], img.shape[1] * sp[1]])

def resample(R, t, box_min, box_max, h, order=1, data=img, cval=-1000):
    n = np.ceil((np.asarray(box_max) - np.asarray(box_min)) / h).astype(int)
    A, off = scene_grid_to_ct_index(R, t, c0, sp, org, n, box_min, h)
    return ndi.affine_transform(data, A, off, output_shape=tuple(n), order=order, cval=cval, mode="constant"), n

def run(R, t, h=1.0, box=((-110, -130, -150), (110, 130, 120))):
    hu, n = resample(R, t, *box, h)
    lb, _ = resample(R, t, *box, h, order=0, data=seg, cval=0)
    return hu, lb

R = rot("z", roll) @ rot("y", yaw)
t = np.array([tx, 0, 0])
# nasal floor line in the midsagittal band
def floor_line(hu, lb, h, box0):
    air = (lb == 3) | (lb == 4)
    xs = (np.arange(air.shape[0]) * h + box0[0])
    band = np.abs(xs) < 8
    a = air[band].any(0)  # [y, z]
    zz = np.arange(a.shape[1]) * h + box0[2]; yy = np.arange(a.shape[0]) * h + box0[1]
    ys, zs = [], []
    for k in range(a.shape[1]):
        col = np.where(a[:, k])[0]
        if len(col): ys.append(yy[col.min()]); zs.append(zz[k])
    return np.array(zs), np.array(ys)
box = ((-110, -130, -150), (110, 130, 120))
hu, lb = run(R, t)
zs, ys = floor_line(hu, lb, 1.0, box[0])
print("airway AP extent", zs.min(), zs.max())
zfront = zs.max()
sel = (zs > zs.min() + 12) & (zs < zs.min() + 50)  # hard-palate stretch of the floor
sel = (zs > zfront - 55) & (zs < zfront - 12)
for it in range(3):
    pf = np.polyfit(zs[sel], ys[sel], 1)
    res = ys[sel] - np.polyval(pf, zs[sel]); keep = np.abs(res) < max(1.0, 2 * res.std())
    idx = np.where(sel)[0]; sel2 = np.zeros_like(sel); sel2[idx[keep]] = True; sel = sel2
pf = np.polyfit(zs[sel], ys[sel], 1)
pitch = np.degrees(np.arctan(pf[0]))  # rotate about x so that dy/dz -> 0
print("floor slope", pf, "pitch deg", pitch, "n", sel.sum())
R = rot("x", pitch) @ R
# check
hu, lb = run(R, t)
zs, ys = floor_line(hu, lb, 1.0, box[0])
sel = (zs > zs.max() - 55) & (zs < zs.max() - 12)
print("after: slope", np.polyfit(zs[sel], ys[sel], 1))
# ANS: anterior-most bone point on the midline (|x|<1.5) around the floor height
bone = hu > 300
xs = np.arange(bone.shape[0]) - 110; mid = np.abs(xs + 0.0) < 1.5
yfloor = np.polyval(np.polyfit(zs[sel], ys[sel], 1), zs.max() - 20)
ys_ax = np.arange(bone.shape[1]) - 130; zs_ax = np.arange(bone.shape[2]) - 150
sag = bone[mid].any(0)  # [y,z]
rows = np.where((ys_ax > yfloor - 10) & (ys_ax < yfloor + 8))[0]
zb = [zs_ax[np.where(sag[r])[0].max()] for r in rows if sag[r].any()]
print("ANS z candidates", zb)
zANS = float(np.median(zb)) if False else float(max(zb))
print("ANS z", zANS, "floor y at head", yfloor)
# origin shift: scene = old - (0, yfloor + 17.5, zANS - 4)
shift = np.array([0.0, -(yfloor + 17.5), -(zANS - 4.0)])
json.dump(dict(R=R.tolist(), c0=c0.tolist(), t=(t + shift).tolist(), yaw=yaw, roll=roll, pitch=pitch, tx=tx, ANS_z_old=zANS, floor_y_old=float(yfloor)), open(f"{CACHE}/xf_{SUBJECT}.json", "w"))
# final resample: box in scene mm
T = t + shift
bmin = np.array([-95, -95, -200]); bmax = np.array([95, 150, 45])
hu, n = resample(R, T, bmin, bmax, H, order=3)   # cubic: no 1.5 mm slice terraces after upsampling
lb, _ = resample(R, T, bmin, bmax, H, order=0, data=seg, cval=0)
print("final grid", n, hu.shape)
valid, _ = resample(R, T, bmin, bmax, H, order=0, data=np.ones(img.shape, np.uint8), cval=0)
np.savez_compressed(f"{CACHE}/vol_{SUBJECT}.npz", hu=hu.astype(np.int16), lab=lb.astype(np.uint8), valid=valid.astype(np.uint8), bmin=bmin, h=H)
