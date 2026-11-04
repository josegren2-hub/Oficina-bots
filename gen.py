from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, json, sys
OUT='/workspace/oficina-bots/propuesta-v17/'
Z=[("Tinta Rosa",0,0,13,11,"#E8B4B8"),("Oficina Mateo",0,0,5,5,"#F3C9CC"),("Personal · Ted",0,11,13,11,"#F2D7A6"),
("Lounge · atrio central",13,0,10,14,"#D7CBB8"),("Café",13,14,10,8,"#D9A07A"),
("Proyectos",23,0,13,12,"#C9D8B6"),("Jurídico y Finanzas",23,12,13,10,"#C7C1DE")]
D=[(13,4,'v',2),(13,11,'v',2),(23,5,'v',2),(23,12,'v',2),(17,14,'h',2),(2,5,'h',2)]
GLASS={"Oficina Mateo"}
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def font(s):
    try: return ImageFont.truetype(FONT,s)
    except: return ImageFont.load_default()
# ---------- SVG / PNG plan
s=20
svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 740 490" font-family="sans-serif"><rect x="-10" y="-10" width="2000" height="2000" fill="#FAF7F2"/>']
for n,x,y,w,h,c in Z:
    svg.append(f'<rect x="{x*s}" y="{y*s}" width="{w*s}" height="{h*s}" fill="{c}" stroke="#3B3A36" stroke-width="3"/>')
for n,x,y,w,h,c in Z:
    fs=13 if w<6 else 15
    svg.append(f'<text x="{(x+w/2)*s}" y="{(y+h/2)*s}" text-anchor="middle" font-size="{fs}" fill="#2B2A27">{n.split(" · ")[0] if w<6 else n}</text><text x="{(x+w/2)*s}" y="{(y+h/2)*s+17}" text-anchor="middle" font-size="11" fill="#555">{w}×{h} u</text>')
for x,y,o,l in D:
    if o=='h': svg.append(f'<rect x="{x*s-2}" y="{y*s-3}" width="{l*s+4}" height="6" fill="#FFFFFF"/>')
    else: svg.append(f'<rect x="{x*s-3}" y="{y*s-2}" width="6" height="{l*s+4}" fill="#FFFFFF"/>')
svg.append('<text x="360" y="472" text-anchor="middle" font-size="13">Sin recepción ni pasillo · huecos blancos = puertas · 1 u = 0.5 m</text></svg>')
open(OUT+'plano-v17.svg','w').write(''.join(svg))
im=Image.new('RGB',(1480,980),'#FAF7F2'); d=ImageDraw.Draw(im); k=2; o=20
for n,x,y,w,h,c in Z: d.rectangle([o+x*s*k,o+y*s*k,o+(x+w)*s*k,o+(y+h)*s*k],fill=c,outline='#3B3A36',width=6)
for n,x,y,w,h,c in Z:
    t=n.split(" · ")[0] if w<6 else n; f=font(26 if w<6 else 30)
    cx,cy=o+(x+w/2)*s*k,o+(y+h/2)*s*k
    d.text((cx,cy),t,fill='#2B2A27',font=f,anchor='ms'); d.text((cx,cy+34),f"{w}×{h} u",fill='#555',font=font(22),anchor='ms')
for x,y,ori,l in D:
    if ori=='h': d.rectangle([o+x*s*k-4,o+y*s*k-6,o+(x+l)*s*k+4,o+y*s*k+6],fill='white')
    else: d.rectangle([o+x*s*k-6,o+y*s*k-4,o+x*s*k+6,o+(y+l)*s*k+4],fill='white')
d.text((o+360*k,o+472*k),"Sin recepción ni pasillo · huecos blancos = puertas · 1 u = 0.5 m",fill='#2B2A27',font=font(26),anchor='ms')
im.save(OUT+'plano-v17.png')
json.dump({"zonas":[dict(nombre=n,x=x,y=y,w=w,h=h) for n,x,y,w,h,c in Z],"puertas":[dict(x=x,y=y,orient=o_,largo=l) for x,y,o_,l in D]},open(OUT+'plano-v17.json','w'),ensure_ascii=False,indent=1)
