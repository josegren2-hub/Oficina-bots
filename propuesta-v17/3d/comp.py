from PIL import Image,ImageDraw,ImageFont
import os
B='/workspace/oficina-bots/'; O=B+'capturas/v17b-comparacion/'; os.makedirs(O,exist_ok=True)
M=[('01-corte-dia','esc-01-apilada'),('02-corte-noche','esc-02-noche'),('03-pisos-lado-a-lado','esc-03-lado'),('04-PB-cafeteria-personal','esc-piso-0'),('05-P1-juridico-finanzas','esc-piso-1'),('06-P2-proyectos-podcast','esc-piso-2'),('07-P3-tinta-rosa','esc-piso-3'),('08-P4-penthouse-ted','esc-piso-4'),('09-P4-oficina-ted-pizarron','esc-ted')]
try: F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',22)
except: F=None
for a,c in M:
    ims=[B+'propuesta-v17/3d/'+a+'.jpg',B+'propuesta-v17/3d/raw2/'+a+'.png',B+'capturas/v17b-preview/'+c+'.png']
    if not os.path.exists(ims[2]): ims[2]=B+'capturas/v17b-preview/esc-piso-4.png'
    H=720; L=[]
    for p in ims:
        im=Image.open(p).convert('RGB'); L.append(im.resize((int(im.width*H/im.height),H)))
    W=sum(i.width for i in L)+40; C=Image.new('RGB',(W,H+40),'white'); x=0
    d=ImageDraw.Draw(C)
    for t,im in zip(['1) Original de Ted','2) Blender + correcciones Rob','3) Web v17b (lightmaps horneados)'],L):
        C.paste(im,(x,40)); d.text((x+6,8),t,fill='black',font=F); x+=im.width+20
    C.save(O+a+'.jpg',quality=86)
print('ok')
