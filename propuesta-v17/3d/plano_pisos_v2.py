from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math, json
OUT='/workspace/oficina-bots/propuesta-v17/'; FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FB='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def font(s,b=False): return ImageFont.truetype(FB if b else FONT,s)
FW,FD=18,9
def sh(c,f):
    c=c.lstrip('#'); return tuple(max(0,min(255,int(int(c[i:i+2],16)*f))) for i in (0,2,4))
def desk(L,x,y,w=3,dd=1.4):
    L+=[(x,y,w,dd,1.5,'#D9B48A'),(x+w/2-0.5,y+dd+0.2,1,1,1.0,'#3B3A36'),(x+w/2-0.6,y+0.2,1.2,0.2,2.4,'#2B2A27')]
CORE=(16,0,2,3)
FLOORS=[]
# PB
f=[]; f+=[(1,1,7,1.4,2.2,'#D9B48A'),(6.5,1.1,1.2,1.2,3,'#3B3A36')]+[(1.5+k*1.5,3,0.7,0.7,1.4,'#C8784E') for k in range(4)]
f+=[(2,6,1.6,1.6,1.5,'#D9B48A'),(5,6,1.6,1.6,1.5,'#D9B48A'),(8.85,0.2,0.3,3.2,1.5,'#5E7F52'),(14.6,6.6,1.4,2.2,1.5,'#F3EAD8'),(0.3,7.5,1,1,3.5,'#5E7F52')]
desk(f,9.6,1); desk(f,12.8,1); desk(f,11.2,5.3)
FLOORS.append(dict(id="PB",nombre="PB · Cafetería + Personal",bots="Luna, Valery, Emiliano · cafetería compartida",col="#EBC9A6",floor="#C8784E",items=f,rooms=[]))
f=[]; desk(f,3,3); desk(f,10,3); f+=[(0.3,1,1,4,2.5,'#8E8BA8'),(14,6.5,1.2,1.2,1.6,'#3B3A36'),(7,7,0.9,0.9,3.5,'#5E7F52')]
FLOORS.append(dict(id="P2",nombre="Piso 1 · Jurídico y Finanzas",bots="Julián, Inés",col="#C7C1DE",floor="#E4CFA8",items=f,rooms=[]))
f=[]; desk(f,0.8,1); desk(f,4.3,1); desk(f,7.8,1); desk(f,0.8,5.5); desk(f,4.3,5.5)
# studio 11..18 x 3..9 ; desk mic, panels, on air
f+=[(12.5,5,3,1.4,1.5,'#3B3A36'),(13.6,4.4,0.3,0.3,2.6,'#888888'),(13.4,6.6,1,1,1.0,'#C8784E'),(11.4,3.4,0.2,1.5,2.0,'#7A5A8A'),(11.4,6.6,0.2,1.5,2.0,'#7A5A8A'),(12,3.3,1.5,0.2,2.0,'#C8784E'),(14.5,3.3,1.5,0.2,2.0,'#7A9A6E')]
FLOORS.append(dict(id="P3",nombre="Piso 2 · Proyectos + Estudio de podcast",bots="Tommy, Charly, Rodrigo, Joss, Luca · Rulo en el estudio",col="#C9D8B6",floor="#E4CFA8",items=f,rooms=[("Estudio podcast",11,3,7,6,'solid',(11,7.5,'v',1.2))],onair=(12.5,3.15,2.6)))
f=[]; desk(f,1,1.5,3,1.2); desk(f,7,1); desk(f,11,1); desk(f,8,5.5); f+=[(0.2,6,0.5,2.5,3,'#E8B4B8')]
FLOORS.append(dict(id="P4",nombre="Piso 3 · Tinta Rosa",bots="Mateo (oficina de cristal), Tadeo, Naim, Dany",col="#E8B4B8",floor="#E4CFA8",items=f,rooms=[("Oficina Mateo",0,0,5,5,'glass',(5,2,'v',1.6))]))
LAMPS={"PB":[(4,4),(12,5)],"P1":[(9,5),(3,3),(13,3)],"P2":[(5,5),(12,5)],"P3":[(3,3),(6,7),(14,6)],"P4":[(2.5,2.5),(9,3),(10,7)]}
def walls(F):
    W=[]  # (x,y,w,d,h,kind)
    W+=[(0,-0.15,FW,0.3,2.6,'solid'),(-0.15,0,0.3,FD,2.6,'solid')]  # back walls
    W+=[(0,FD-0.15,FW,0.3,1.0,'glass'),(FW-0.15,0,0.3,FD,1.0,'glass')]  # front low glass
    for n,x,y,w,d,k,door in F['rooms']:
        dx,dy,o,l=door
        segs=[('h',x,y,w),('h',x,y+d,w),('v',x,y,d),('v',x+w,y,d)]
        for so,sx,sy,sl in segs:
            if (so=='h' and sy in(0,FD)) or (so=='v' and sx in(0,FW)): continue
            h=2.6
            if so=='h':
                W.append((sx,sy-0.15,sl,0.3,h,k))
            else:
                if o=='v' and sx==dx:
                    W.append((sx-0.15,sy,0.3,dy-sy,h,k)); W.append((sx-0.15,dy+l,0.3,sy+sl-dy-l,h,k))
                else: W.append((sx-0.15,sy,0.3,sl,h,k))
    W.append(CORE+(2.6,'core'))
    return W
def render(S,OX,OY,Wd,Ht,floors,gap,night,labels,fn,SS=2):
    C=math.cos(math.radians(30))
    def P(x,y,z): return ((OX+(x-y)*C*S)*SS,(OY+(x+y)*0.5*S-z*S)*SS)
    im=Image.new('RGB',(Wd*SS,Ht*SS)); d=ImageDraw.Draw(im,'RGBA')
    for yy in range(Ht*SS):
        t=yy/(Ht*SS)
        c=(int(31+35*t),int(42+25*t),int(68+10*t)) if night else (int(214+22*t),int(228+3*t),int(240-18*t))
        d.line([(0,yy),(Wd*SS,yy)],fill=c)
    tint=(255,200,140)
    def col(c,f):
        r=sh(c,f*(0.93 if night else 1))
        return tuple(int(r[i]*0.82+tint[i]*0.18) for i in range(3)) if night else r
    def box(x,y,z,w,dd,h,c,alpha=None):
        if alpha:
            for poly in ([P(x,y+dd,z),P(x+w,y+dd,z),P(x+w,y+dd,z+h),P(x,y+dd,z+h)],[P(x+w,y,z),P(x+w,y+dd,z),P(x+w,y+dd,z+h),P(x+w,y,z+h)]): d.polygon(poly,fill=alpha)
            d.polygon([P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+dd,z+h),P(x,y+dd,z+h)],fill=(40,40,40,255)); return
        d.polygon([P(x,y+dd,z),P(x+w,y+dd,z),P(x+w,y+dd,z+h),P(x,y+dd,z+h)],fill=col(c,0.82))
        d.polygon([P(x+w,y,z),P(x+w,y+dd,z),P(x+w,y+dd,z+h),P(x+w,y,z+h)],fill=col(c,0.68))
        d.polygon([P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+dd,z+h),P(x,y+dd,z+h)],fill=col(c,1.0))
    for i,F in enumerate(floors):
        z0=i*gap
        # slab
        box(0,0,z0-0.7,FW,FD,0.7,'#EDE6DA')
        d.polygon([P(0,0,z0),P(FW,0,z0),P(FW,FD,z0),P(0,FD,z0)],fill=col(F['floor'],1))
        m=0.8; d.polygon([P(m,m,z0+0.01),P(FW-m,m,z0+0.01),P(FW-m,FD-m,z0+0.01),P(m,FD-m,z0+0.01)],fill=col(F['col'],1)+(140,))
        for n,x,y,w,dd,k,door in F['rooms']:
            d.polygon([P(x,y,z0+0.02),P(x+w,y,z0+0.02),P(x+w,y+dd,z0+0.02),P(x,y+dd,z0+0.02)],fill=col('#5A4A6A' if k=='solid' else '#F3C9CC',1))
        if F.get('rug'):
            cx,cy,r=F['rug']; d.polygon([P(cx+r*math.cos(a*math.pi/20),cy+r*math.sin(a*math.pi/20),z0+0.03) for a in range(40)],fill=col('#7A9A6E',1.05))
        if night:
            gl=Image.new('RGBA',im.size,(0,0,0,0)); g=ImageDraw.Draw(gl)
            for lx,ly in LAMPS[F['id']]:
                cx,cy=P(lx,ly,z0); r=3.5*S*SS; g.ellipse([cx-r,cy-r*0.58,cx+r,cy+r*0.58],fill=(255,184,102,120))
            gl=gl.filter(ImageFilter.GaussianBlur(int(S*SS*1.2))); im.paste(gl,(0,0),gl); d=ImageDraw.Draw(im,'RGBA')
        objs=[(x,y,w,dd,h,c) for x,y,w,dd,h,c in F['items']]+[(x,y,w,dd,h,'#'+k) for x,y,w,dd,h,k in walls(F)]
        objs.sort(key=lambda b:(b[0]+b[2]/2)+(b[1]+b[3]/2)+(-100 if b[5] in('#solid',) and (b[1]<0 or b[0]<0) else 0))
        for x,y,w,dd,h,c in objs:
            if c=='#glass': box(x,y,z0,w,dd,h,None,alpha=(170,205,225,110))
            elif c=='#solid': box(x,y,z0,w,dd,h,'#FAF7F2' if (y<0 or x<0) else '#6E5A80')
            elif c=='#core': box(x,y,z0,w,dd,h,None,alpha=(150,170,185,150))
            else: box(x,y,z0,w,dd,h,c)
        for lx,ly in LAMPS[F['id']]:
            cx,cy=P(lx,ly,z0+3.2); r=0.4*S*SS
            d.ellipse([cx-r,cy-r*0.6,cx+r,cy+r*0.6],fill=(255,190,110) if night else (233,196,106))
        if F.get('onair'):
            x,y,h=F['onair']; cx,cy=P(x,y,z0+h); r=0.55*S*SS
            d.rounded_rectangle([cx-r*1.6,cy-r*0.6,cx+r*1.6,cy+r*0.6],radius=4*SS,fill=(220,30,40))
            d.text((cx,cy),"ON AIR",font=font(max(8,int(S*0.42))*SS,True),fill='white',anchor='mm')
        if labels:
            cx,cy=P(0,FD,z0+0.5); f=font(int(S*0.75)*SS,True); f2=font(int(S*0.5)*SS)
            tx=cx-1.2*S*SS
            d.text((tx,cy-0.2*S*SS),F['nombre'],font=f,fill=(255,240,220) if night else (43,42,39),anchor='rs')
            d.text((tx,cy+0.6*S*SS),F['bots'],font=f2,fill=(230,215,195) if night else (85,85,85),anchor='rs')
    im.resize((Wd,Ht),Image.LANCZOS).save(OUT+fn,quality=92)
# plans
s=34; pw,ph=FW*s,FD*s
im=Image.new('RGB',(2*pw+120,3*(ph+90)+230),'#FAF7F2'); d=ImageDraw.Draw(im)
for k,F in enumerate(reversed(FLOORS)):
    k+=2
    ox=40+(k%2)*(pw+40); oy=230+(k//2)*(ph+90)
    d.text((ox,oy-12),F['nombre'],font=font(20,True),fill='#2B2A27',anchor='ls')
    d.rectangle([ox,oy,ox+pw,oy+ph],fill=F['col'],outline='#3B3A36',width=4)
    for n,x,y,w,dd,kd,door in F['rooms']:
        d.rectangle([ox+x*s,oy+y*s,ox+(x+w)*s,oy+(y+dd)*s],fill='#5A4A6A' if kd=='solid' else '#F3C9CC',outline='#3B3A36' if kd=='solid' else '#5B8FB0',width=4)
        dx,dy,o,l=door; d.rectangle([ox+dx*s-4,oy+dy*s,ox+dx*s+4,oy+(dy+l)*s],fill='white')
    x,y,w,dd=CORE; d.rectangle([ox+x*s,oy+y*s,ox+(x+w)*s,oy+(y+dd)*s],fill='#B8C6CF',outline='#3B3A36',width=2); d.text((ox+(x+w/2)*s,oy+(y+dd/2)*s),"Elev.",font=font(12),fill='#2B2A27',anchor='mm')
    for x,y,w,dd,h,c in F['items']:
        if w*dd>0.5: d.rectangle([ox+x*s,oy+y*s,ox+(x+w)*s,oy+(y+dd)*s],fill=c,outline='#3B3A36')
    for n,x,y,w,dd,kd,door in F['rooms']:
        d.text((ox+(x+w/2)*s,oy+(y+dd)*s-10),n,font=font(15,True),fill='white' if kd=='solid' else '#2B2A27',anchor='ms')
    d.text((ox,oy+ph+22),F['bots'],font=font(14),fill='#555',anchor='ls')
d.text((im.width//2,im.height-25),"Opción B · 18×9 u por piso (9×4.5 m) · núcleo de elevador/escalera en esquina · frente de cristal bajo",font=font(16),fill='#2B2A27',anchor='mm')
im.save(OUT+'plano-B-pisos.png')

# Piso 5 penthouse, full width top band
s5=s*1.0; ox,oy=40+1.6*s5,95
def R(x,y,w,h,**k): d.rectangle([ox+x*s5,oy+y*s5,ox+(x+w)*s5,oy+(y+h)*s5],**k)
d.text((40,40),"Piso 4 · Penthouse de Ted (más grande, cristal sin divisiones + terraza)",font=font(20,True),fill='#2B2A27',anchor='ls')
R(-1.6,-1.1,21.2,12.2,fill='#E9E2D4',outline='#3B3A36',width=4); R(-1,-0.5,20,7.5,fill='#CDBFAE',outline='#5B8FB0',width=4); R(-1.6,7,21.2,4.1,fill='#C79A6E')
R(-1,-0.5,9.5,5.5,fill='#9FB0C2',outline='#5B8FB0',width=4); R(8.5,-0.5,7.5,6,fill='#E1D5C2',outline='#5B8FB0',width=4)
R(16,0,2,3,fill='#B8C6CF',outline='#3B3A36',width=2)
R(1.5,1,4,1.8,fill='#5A3E2B'); R(3,3.1,1,0.9,fill='#3B3A36'); R(5.95,-0.5,2.2,0.3,fill='#1F3A93'); R(-0.7,0.2,0.9,3,fill='#6B4A33')
R(9.6,1.7,5.4,2.0,fill='#3A2A1E')
for k in range(7): R(9.7+k*0.78,0.85,0.6,0.6,fill='#3B3A36'); R(9.7+k*0.78,3.95,0.6,0.6,fill='#3B3A36')
R(8.85,2.4,0.6,0.6,fill='#3B3A36'); R(15.15,2.4,0.6,0.6,fill='#3B3A36')
for tx in (1,6,11,15): R(tx,8.2,2,1,fill='#F3EAD8')
d.text((ox+3.5*s5,oy+4.0*s5),"Oficina de Ted",font=font(14,True),fill='#1B2A3A',anchor='mt')
d.text((ox+7.05*s5,oy+0.0*s5),"pizarrón (en ventanal)",font=font(11),fill='#1F3A93',anchor='mt')
d.text((ox+12.3*s5,oy+5.0*s5),"Sala de juntas · 16 lugares",font=font(14,True),fill='#2B2A27',anchor='mm')
d.text((ox+9*s5,oy+10.4*s5),"Terraza",font=font(14,True),fill='#2B2A27',anchor='mm')
im.save(OUT+'plano-B-pisos.png')
