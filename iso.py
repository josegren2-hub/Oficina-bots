import sys; sys.argv=['x']
exec(open('/workspace/oficina-bots/gen.py').read().split('# ---------- SVG')[0])
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math
S=32; C=math.cos(math.radians(30)); Sn=0.5; W,H=1800,1200; OX,OY=760,170; SS=2
def P(x,y,z): return ((OX+(x-y)*C*S)*SS,(OY+(x+y)*Sn*S-z*S)*SS)
def sh(c,f):
    c=c.lstrip('#'); r,g,b=[int(c[i:i+2],16) for i in (0,2,4)]
    return tuple(max(0,min(255,int(v*f))) for v in (r,g,b))
# furniture: (x,y,w,d,h,color)
F=[]
def desk(x,y,w=3,dd=1.5): F.append((x,y,w,dd,1.5,'#D9B48A')); F.append((x+w/2-0.5,y+dd+0.2,1,1,1.0,'#3B3A36')); F.append((x+w/2-0.6,y+0.2,1.2,0.2,2.4,'#2B2A27'))
# Tinta Rosa: Mateo glass office + Tadeo, Naim, Dany
desk(1,1.5); desk(6,2); desk(9.5,2); desk(6,7); F.append((0.2,6,0.6,4.5,4,'#E8B4B8'))
# Personal: Ted centro, Luna, Valery, Emiliano
desk(5,15.5); desk(1,12.5); desk(9,12.5); desk(1,18.5); F.append((10,19.5,2,1.5,1.2,'#9B7BB8'))
# Lounge
F+= [(15,3,6,1.8,1.5,'#F3EAD8'),(15,9,6,1.8,1.5,'#F3EAD8'),(21,5,1.6,3.5,1.5,'#E9C46A'),(17,6,2.5,2,0.8,'#B08860'),(13.6,0.6,1.3,1.3,4,'#5E7F52'),(21.5,12,1.2,1.2,4,'#5E7F52'),(19,0.4,3,0.8,3.5,'#B08860')]
# Café
F.append((14,20,8,1.5,2.2,'#D9B48A')); F.append((20.5,20.1,1.2,1.2,3,'#3B3A36'))
for k in range(4): F.append((15+k*1.5,18.6,0.7,0.7,1.4,'#C8784E'))
F+= [(14.5,15.5,1.6,1.6,1.5,'#D9B48A'),(19.5,15.5,1.6,1.6,1.5,'#D9B48A')]
# Proyectos: 6 desks in 2 islands of 3
for k in range(3): desk(25+k*3.5,2.5,3,1.5)
for k in range(3): desk(25+k*3.5,7.5,3,1.5)
# Juridico: Julian, Ines
desk(26,15); desk(31,15); F+= [(34.5,13,1,4,2.5,'#8E8BA8'),(34.5,18,1.2,1.2,1.6,'#3B3A36')]
LAMPS=[(2.5,2.5),(8,4),(8,9),(6.5,15),(2.5,19),(18,6),(18,17),(28,4),(31,9),(28.5,16),(33,16)]
# walls
def door_at(x,y,o):
    for dx,dy,do,l in D:
        if do==o and ((o=='h' and dy==y and dx<=x<dx+l) or (o=='v' and dx==x and dy<=y<dy+l)): return True
    return False
segs={}
for n,x,y,w,h,c in Z:
    for i in range(w):
        for yy in (y,y+h): segs.setdefault(('h',x+i,yy),set()).add(n)
    for j in range(h):
        for xx in (x,x+w): segs.setdefault(('v',xx,y+j),set()).add(n)
WT=0.3; WH=2.8
for (o,x,y),ns in segs.items():
    if door_at(x,y,o): continue
    ext=len(ns)==1
    terr='Terraza / jardín' in ns
    glass=bool(ns & GLASS) and not ext
    h=WH
    if ext and ((o=='h' and y==22) or (o=='v' and x==36)): h=0.5
    if terr and ext: h=1.0
    col='#9FC6D8' if glass else ('#FAF7F2')
    if o=='h': F.append((x,y-WT/2,1,WT,h,'G' if glass else col))
    else: F.append((x-WT/2,y,WT,1,h,'G' if glass else col))
def render(mode,labels=False):
    night=mode=='noche'
    bg=(31,42,68) if night else (236,231,222)
    im=Image.new('RGB',(W*SS,H*SS),bg); d=ImageDraw.Draw(im,'RGBA')
    if not night:
        for yy in range(H*SS): d.line([(0,yy),(W*SS,yy)],fill=(int(214+22*yy/(H*SS)),int(228+3*yy/(H*SS)),int(240-18*yy/(H*SS))))
    else:
        for yy in range(H*SS): t=yy/(H*SS); d.line([(0,yy),(W*SS,yy)],fill=(int(31+30*t),int(42+20*t),int(68+5*t)))
    lf=0.93 if night else 1.0
    tint=(255,200,140) if night else None
    def col(c,f):
        r=sh(c,f*lf)
        if night: r=tuple(int(r[i]*0.82+tint[i]*0.18) for i in range(3))
        return r
    # base slab
    d.polygon([P(0,0,0),P(36,0,0),P(36,22,0),P(36,22,-0.6),P(0,22,-0.6),P(0,22,0)],fill=col('#8C8172',0.9))
    d.polygon([P(36,0,0),P(36,22,0),P(36,22,-0.6),P(36,0,-0.6)],fill=col('#8C8172',0.75))
    floor={'Café':'#C8784E','Terraza / jardín':'#B08860'}
    for n,x,y,w,h,c in Z:
        fc=floor.get(n,'#E4CFA8' if n not in('Lounge · atrio central',) else '#E9DCC6')
        d.polygon([P(x,y,0),P(x+w,y,0),P(x+w,y+h,0),P(x,y+h,0)],fill=col(fc,1.0))
        # zone colour accent rug
        m=1.2 if w>6 else 0.6
        d.polygon([P(x+m,y+m,0.01),P(x+w-m,y+m,0.01),P(x+w-m,y+h-m,0.01),P(x+m,y+h-m,0.01)],fill=col(c,1.0)+(150,))
        if n=='Terraza / jardín':
            for i in range(int(w)): d.line([P(x+i,y,0.02),P(x+i,y+h,0.02)],fill=col('#8A6A4A',1),width=2)
    # round rug in atrium
    pts=[P(18.2+3*math.cos(a/20*math.pi),6.8+3*math.sin(a/20*math.pi),0.02) for a in range(40)]
    d.polygon(pts,fill=col('#7A9A6E',1.05)+(200,))
    # boxes painter
    items=sorted(F,key=lambda b:(b[0]+b[2]/2)+(b[1]+b[3]/2)+0.001*b[4])
    if night:
        gl=Image.new('RGBA',im.size,(0,0,0,0)); g=ImageDraw.Draw(gl)
        for lx,ly in LAMPS:
            cx,cy=P(lx,ly,0)
            r=4.5*S*SS; g.ellipse([cx-r,cy-r*0.58,cx+r,cy+r*0.58],fill=(255,184,102,110))
        gl=gl.filter(ImageFilter.GaussianBlur(40*SS)); im.paste(gl,(0,0),gl); d=ImageDraw.Draw(im,'RGBA')
    for x,y,w,dd,h,c in items:
        if c=='G':
            a=(170,205,225,120) if not night else (190,200,215,110)
            d.polygon([P(x,y+dd,0),P(x+w,y+dd,0),P(x+w,y+dd,h),P(x,y+dd,h)],fill=a)
            d.polygon([P(x+w,y,0),P(x+w,y+dd,0),P(x+w,y+dd,h),P(x+w,y,h)],fill=a)
            d.polygon([P(x,y,h),P(x+w,y,h),P(x+w,y+dd,h),P(x,y+dd,h)],fill=(40,40,40,255))
            continue
        d.polygon([P(x,y+dd,0),P(x+w,y+dd,0),P(x+w,y+dd,h),P(x,y+dd,h)],fill=col(c,0.82))
        d.polygon([P(x+w,y,0),P(x+w,y+dd,0),P(x+w,y+dd,h),P(x+w,y,h)],fill=col(c,0.68))
        d.polygon([P(x,y,h),P(x+w,y,h),P(x+w,y+dd,h),P(x,y+dd,h)],fill=col(c,1.0))
        if c=='#FAF7F2':
            d.polygon([P(x,y+dd,0),P(x+w,y+dd,0),P(x+w,y+dd,0.4),P(x,y+dd,0.4)],fill=col('#7A9A6E',0.9))
    # lamps
    for lx,ly in LAMPS:
        cx,cy=P(lx,ly,3.6); r=0.45*S*SS
        d.line([(cx,cy),(cx,cy-1.5*S*SS)],fill=(60,60,60),width=2*SS)
        d.ellipse([cx-r,cy-r*0.6,cx+r,cy+r*0.6],fill=(255,190,110) if night else (233,196,106))
    if labels:
        f=ImageFont.truetype(FONT,26*SS)
        for n,x,y,w,h,c in Z:
            cx,cy=P(x+w/2,y+h/2,4.5)
            tb=d.textbbox((cx,cy),n,font=f,anchor='mm'); pad=10*SS
            d.rounded_rectangle([tb[0]-pad,tb[1]-pad,tb[2]+pad,tb[3]+pad],radius=12*SS,fill=(255,255,255,235),outline=sh(c,0.7),width=4*SS)
            d.text((cx,cy),n,font=f,fill=(43,42,39),anchor='mm')
        pass
    im=im.resize((W,H),Image.LANCZOS)
    t={'dia':'render-v2-dia.jpg','noche':'render-v2-noche.jpg'}[mode] if not labels else 'render-v2-etiquetado.jpg'
    im.save(OUT+t,quality=92); return im
render('dia'); render('noche'); im=render('dia',True)
# close-up café+lounge: crop from day render
full=Image.open(OUT+'render-v2-dia.jpg')
x0,_=P(8,22,0);x1,_=P(28,0,0);_,y0=P(13,0,4);_,y1=P(25,22,0)
full.crop((int(x0/SS)-20,int(y0/SS)-20,int(x1/SS)+20,int(y1/SS)+20)).save(OUT+'render-v2-cafe-lounge-base.jpg',quality=92)
