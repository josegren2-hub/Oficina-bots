from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, json, sys
OUT='/workspace/oficina-bots/propuesta-v17/'
Z=[("Tinta Rosa",0,0,14,13,"#E8B4B8"),("Personal · Ted",0,13,14,17,"#F2D7A6"),
("Sala de juntas",14,0,9,9,"#B9D3E0"),("Cabinas",23,0,4,9,"#DCE6EA"),("Café",27,0,7,9,"#D9A07A"),
("Terraza / jardín",34,0,14,9,"#A7C4A0"),("Lounge · atrio central",14,9,20,13,"#D7CBB8"),
("Proyectos",34,9,14,21,"#C9D8B6"),("Recepción",14,22,10,8,"#E9DCC6"),("Jurídico y Finanzas",24,22,10,8,"#C7C1DE")]
# doors: (x,y,orient,len) h=horizontal wall along x
D=[(14,10,'v',2),(14,16,'v',2),(17,9,'h',2),(24,9,'h',2),(23,3,'v',2),(29,9,'h',2),(34,4,'v',2),(40,9,'h',2),(34,14,'v',2),(18,22,'h',2),(28,22,'h',2),(18,30,'h',2)]
GLASS={"Sala de juntas","Cabinas"}
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def font(s):
    try: return ImageFont.truetype(FONT,s)
    except: return ImageFont.load_default()
# ---------- SVG / PNG plan
s=20
svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 980 650" font-family="sans-serif"><rect x="-10" y="-10" width="2000" height="2000" fill="#FAF7F2"/>']
for n,x,y,w,h,c in Z:
    svg.append(f'<rect x="{x*s}" y="{y*s}" width="{w*s}" height="{h*s}" fill="{c}" stroke="#3B3A36" stroke-width="3"/>')
for n,x,y,w,h,c in Z:
    fs=13 if w<6 else 15
    svg.append(f'<text x="{(x+w/2)*s}" y="{(y+h/2)*s}" text-anchor="middle" font-size="{fs}" fill="#2B2A27">{n.split(" · ")[0] if w<6 else n}</text><text x="{(x+w/2)*s}" y="{(y+h/2)*s+17}" text-anchor="middle" font-size="11" fill="#555">{w}×{h} u</text>')
for x,y,o,l in D:
    if o=='h': svg.append(f'<rect x="{x*s-2}" y="{y*s-3}" width="{l*s+4}" height="6" fill="#FFFFFF"/>')
    else: svg.append(f'<rect x="{x*s-3}" y="{y*s-2}" width="6" height="{l*s+4}" fill="#FFFFFF"/>')
svg.append('<text x="380" y="632" text-anchor="middle" font-size="13">Entrada principal abajo (Recepción) · huecos blancos = puertas · 1 u = 0.5 m</text></svg>')
open(OUT+'plano-v17.svg','w').write(''.join(svg))
im=Image.new('RGB',(1960,1300),'#FAF7F2'); d=ImageDraw.Draw(im); k=2; o=20
for n,x,y,w,h,c in Z: d.rectangle([o+x*s*k,o+y*s*k,o+(x+w)*s*k,o+(y+h)*s*k],fill=c,outline='#3B3A36',width=6)
for n,x,y,w,h,c in Z:
    t=n.split(" · ")[0] if w<6 else n; f=font(26 if w<6 else 30)
    cx,cy=o+(x+w/2)*s*k,o+(y+h/2)*s*k
    d.text((cx,cy),t,fill='#2B2A27',font=f,anchor='ms'); d.text((cx,cy+34),f"{w}×{h} u",fill='#555',font=font(22),anchor='ms')
for x,y,ori,l in D:
    if ori=='h': d.rectangle([o+x*s*k-4,o+y*s*k-6,o+(x+l)*s*k+4,o+y*s*k+6],fill='white')
    else: d.rectangle([o+x*s*k-6,o+y*s*k-4,o+x*s*k+6,o+(y+l)*s*k+4],fill='white')
d.text((o+380*k,o+632*k),"Entrada principal abajo (Recepción) · huecos blancos = puertas · 1 u = 0.5 m",fill='#2B2A27',font=font(26),anchor='ms')
im.save(OUT+'plano-v17.png')
json.dump({"zonas":[dict(nombre=n,x=x,y=y,w=w,h=h) for n,x,y,w,h,c in Z],"puertas":[dict(x=x,y=y,orient=o_,largo=l) for x,y,o_,l in D]},open(OUT+'plano-v17.json','w'),ensure_ascii=False,indent=1)
