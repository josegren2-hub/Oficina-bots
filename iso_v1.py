import sys; sys.argv=['x']
exec(open('/workspace/oficina-bots/gen.py').read().split('# ---------- SVG')[0])
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math
S=27; C=math.cos(math.radians(30)); Sn=0.5; W,H=2200,1350; OX,OY=880,190; SS=2
def P(x,y,z): return ((OX+(x-y)*C*S)*SS,(OY+(x+y)*Sn*S-z*S)*SS)
def sh(c,f):
    c=c.lstrip('#'); r,g,b=[int(c[i:i+2],16) for i in (0,2,4)]
    return tuple(max(0,min(255,int(v*f))) for v in (r,g,b))
# furniture: (x,y,w,d,h,color)
F=[]
def desk(x,y,w=3,dd=1.5): F.append((x,y,w,dd,1.5,'#D9B48A')); F.append((x+w/2-0.5,y+dd+0.2,1,1,1.0,'#3B3A36')); F.append((x+w/2-0.6,y+0.2,1.2,0.2,2.4,'#2B2A27'))
for i in range(3): desk(2+i*4,4)
F.append((3,9,6,2.5,1.5,'#C8A27A')); F.append((0.2,1,0.6,10,4,'#E8B4B8'))  # mesa edición, muro portadas
F.append((12.8,1,1,4,3.5,'#B08860')) # librero
for (x,y) in [(2,16),(9,16),(2,24)]: desk(x,y)
desk(5.5,20); F.append((1,28,2,1.5,1.2,'#9B7BB8')) # Ted centro, rincón Luna
# sala de juntas
F.append((15.5,3,6,3,1.5,'#D9B48A'))
for i in range(4): F+= [(16+i*1.4,2,0.9,0.8,1,'#3B3A36'),(16+i*1.4,6.2,0.9,0.8,1,'#3B3A36')]
F.append((14.3,2.5,0.3,4,3,'#2B2A27'))
# cabinas: 2 booths
F+= [(23.4,0.5,3.2,3.5,4.2,'#7A9A6E'),(23.4,5,3.2,3.5,4.2,'#7A9A6E')]
# café
F.append((27.5,0.5,6,1.5,2.2,'#D9B48A')); F.append((32,0.6,1.2,1.2,3,'#3B3A36'))
for i in range(4): F.append((28+i*1.4,2.4,0.7,0.7,1.4,'#C8784E'))
F+= [(28.5,5.5,1.6,1.6,1.5,'#D9B48A'),(31.5,5.5,1.6,1.6,1.5,'#D9B48A')]
# terraza
F+= [(35,0.3,12.5,1,1.2,'#5E7F52'),(47,1,0.8,7.5,1.2,'#5E7F52'),(38,5,4,1.2,1,'#B08860'),(43,4,1.5,1.5,1.5,'#D9B48A')]
# lounge atrio: sofas, rug, table, plant, bookshelf
F+= [(18,12.5,6,1.8,1.5,'#F3EAD8'),(18,18,6,1.8,1.5,'#F3EAD8'),(25.5,14,1.8,3.5,1.5,'#E9C46A'),(20,15,2.5,2,0.8,'#B08860'),(31,11,1.5,1.5,4,'#5E7F52'),(16,20,1.5,1.5,4,'#5E7F52'),(32.5,15,1,5,3.5,'#B08860')]
# proyectos: 2 islands of desks + podcast booth + screen
for i in range(4): desk(36+i*3,13,3,1.5)
for i in range(3): desk(36+i*3,20,3,1.5)
F+= [(43,25,4,4,3.5,'#3B3A36'),(36,27,4,0.3,2.8,'#2B2A27')]
# recepción
F+= [(16,24.5,6,1.5,2.2,'#D9B48A'),(14.5,28,4,1,1,'#B08860'),(22.5,28,1.2,1.2,4,'#5E7F52')]
# jurídico
desk(25,24); desk(29.5,24)
F+= [(24.3,28.5,4,1,2.5,'#8E8BA8'),(32.5,28.5,1.2,1.2,1.6,'#3B3A36')]
LAMPS=[(6,6),(7,20),(18.5,4.5),(30,3),(21,15.5),(27,16),(40,15),(40,22),(19,25),(29,25),(25,6.5)]+[(36+i*2,1) for i in range(6)]
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
    if ext and ((o=='h' and y==30) or (o=='v' and x==48)): h=0.5
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
    d.polygon([P(0,0,0),P(48,0,0),P(48,30,0),P(48,30,-0.6),P(0,30,-0.6),P(0,30,0)],fill=col('#8C8172',0.9))
    d.polygon([P(48,0,0),P(48,30,0),P(48,30,-0.6),P(48,0,-0.6)],fill=col('#8C8172',0.75))
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
    pts=[P(21+3.2*math.cos(a/20*math.pi),15.5+3.2*math.sin(a/20*math.pi),0.02) for a in range(40)]
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
    if night:
        for i in range(30):
            x=34.5+i*0.43; cx,cy=P(x,0.4,2.2+0.4*math.sin(i)); d.ellipse([cx-5*SS,cy-5*SS,cx+5*SS,cy+5*SS],fill=(255,214,140))
    if labels:
        f=ImageFont.truetype(FONT,26*SS)
        for n,x,y,w,h,c in Z:
            cx,cy=P(x+w/2,y+h/2,4.5)
            tb=d.textbbox((cx,cy),n,font=f,anchor='mm'); pad=10*SS
            d.rounded_rectangle([tb[0]-pad,tb[1]-pad,tb[2]+pad,tb[3]+pad],radius=12*SS,fill=(255,255,255,235),outline=sh(c,0.7),width=4*SS)
            d.text((cx,cy),n,font=f,fill=(43,42,39),anchor='mm')
        cx,cy=P(19,31.5,0); d.text((cx,cy),"↑ Entrada principal",font=f,fill=(43,42,39),anchor='mm')
    im=im.resize((W,H),Image.LANCZOS)
    t={'dia':'render-v2-dia.jpg','noche':'render-v2-noche.jpg'}[mode] if not labels else 'render-v2-etiquetado.jpg'
    im.save(OUT+t,quality=92); return im
render('dia'); render('noche'); im=render('dia',True)
# close-up café+lounge: crop from day render
full=Image.open(OUT+'render-v2-dia.jpg')
x0,_=P(14,22,0);x1,_=P(34,0,0);_,y0=P(27,0,4);_,y1=P(34,22,0)
full.crop((int(x0/SS)-20,int(y0/SS)-20,int(x1/SS)+20,int(y1/SS)+20)).save(OUT+'render-v2-cafe-lounge-base.jpg',quality=92)
