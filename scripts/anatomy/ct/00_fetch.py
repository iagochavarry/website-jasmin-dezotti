# Step 0: fetch ONE NasalSeg entry (CC BY 4.0, Zhang et al., Sci Data 2024, doi 10.5281/zenodo.12177181) from the 1.1 GB zips on
# Zenodo with HTTP range requests (no full download). Data goes to .cache/ct/raw (gitignored), never committed:
#   for i in 1 2 3 4; do python3 scripts/anatomy/ct/00_fetch.py https://zenodo.org/api/records/12177181/files/NasalSeg_images_$i.zip/content P099_img .cache/ct/raw/P099_img.nrrd | grep -q got && break; done
#   curl -L -o .cache/ct/raw/labels.zip https://zenodo.org/api/records/12177181/files/NasalSeg_labels.zip/content && unzip -q .cache/ct/raw/labels.zip -d .cache/ct/raw/lab
import sys, struct, urllib.request, zlib
url, want, out = sys.argv[1], sys.argv[2], sys.argv[3]
def rng(a,b):
    return urllib.request.urlopen(urllib.request.Request(url,headers={"Range":f"bytes={a}-{b}"})).read()
size=int(urllib.request.urlopen(urllib.request.Request(url,method="HEAD")).headers["Content-Length"])
tail=rng(size-65536,size-1); i=tail.rfind(b"PK\x05\x06")
cd_size,cd_off=struct.unpack("<II",tail[i+12:i+20]); n_ent=struct.unpack("<H",tail[i+10:i+12])[0]
if cd_off==0xFFFFFFFF or cd_size==0xFFFFFFFF:
    j=tail.rfind(b"PK\x06\x06"); cd_size,cd_off=struct.unpack("<QQ",tail[j+40:j+56])
cd=rng(cd_off,cd_off+cd_size-1); p=0; names=[]
while p<len(cd) and cd[p:p+4]==b"PK\x01\x02":
    method=struct.unpack("<H",cd[p+10:p+12])[0]; comp,usize=struct.unpack("<II",cd[p+20:p+28]); nl,el,cl=struct.unpack("<HHH",cd[p+28:p+34]); loff=struct.unpack("<I",cd[p+42:p+46])[0]
    name=cd[p+46:p+46+nl].decode(); extra=cd[p+46+nl:p+46+nl+el]
    if 0xFFFFFFFF in (comp,usize,loff):
        q=0
        while q<len(extra):
            hid,hs=struct.unpack("<HH",extra[q:q+4])
            if hid==1:
                vals=[]; r=q+4
                for v in (usize,comp,loff):
                    if v==0xFFFFFFFF: vals.append(struct.unpack("<Q",extra[r:r+8])[0]); r+=8
                    else: vals.append(v)
                usize,comp,loff=vals
            q+=4+hs
    names.append(name)
    if want in name:
        lh=rng(loff,loff+29); fnl,fel=struct.unpack("<HH",lh[26:30]); start=loff+30+fnl+fel
        data=rng(start,start+comp-1)
        if method==8: data=zlib.decompress(data,-15)
        open(out,"wb").write(data); print("got",name,len(data)); break
    p+=46+nl+el+cl
else: print("not found; sample:", names[:5], len(names))
