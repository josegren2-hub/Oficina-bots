import json,glob,os
from PIL import Image,ImageDraw,ImageFont,ImageEnhance
B='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';R='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
J={f['id']:f for f in json.load(open('../plano-B-pisos.json'))}
TIT={'04':'PB','05':'P1','06':'P2','07':'P3','08':'P4','09':'P4'}
for p in sorted(glob.glob('raw/*.png')):
    n=os.path.basename(p)[:-4]; im=Image.open(p).convert('RGB'); W,H=im.size; d=ImageDraw.Draw(im,'RGBA')
    night='noche' in n; fc=(255,240,220) if night else (35,34,32); sc=(230,215,195) if night else (80,80,80)
    lab=json.load(open(p+'.json'))
    if n[:2]=='03' and 'P5' in lab: lab={{'PB':'PB','P2':'P1','P3':'P2','P4':'P3','P5':'P4'}[k]:v for k,v in lab.items()}
    if n[:2] in('01','02'):
        P=900; bg=im.getpixel((5,5)); im2=Image.new('RGB',(W+P,H),bg); im2.paste(im,(0,0)); im=im2; d=ImageDraw.Draw(im,'RGBA')
        lab={k:((W-40)/W,v) for k,(u,v) in lab.items()}
    if n[:2] in('01','02','03'):
        fs=int(W*0.017)
        for fid,(u,v) in lab.items():
            x,y=u*W,(1-v)*H; F=J[fid]
            if n[:2]=='03': x,y=x+10,y+fs*0.5; anc='la'
            else: x,y=x+15,y; anc='la'
            t1=F['nombre']; t2=F['bots']
            f1=ImageFont.truetype(B,fs); f2=ImageFont.truetype(R,int(fs*0.62))
            for t,f,c,dy in ((t1,f1,fc,0),(t2,f2,sc,fs*1.25)):
                bb=d.textbbox((x,y+dy),t,font=f,anchor=anc); d.rectangle([bb[0]-6,bb[1]-4,bb[2]+6,bb[3]+4],fill=(20,24,40,150) if night else (255,255,255,170))
                d.text((x,y+dy),t,font=f,fill=c,anchor=anc)
    else:
        F=J[TIT[n[:2]]]; fs=int(W*0.024)
        t1=F['nombre']+(' · oficina de Ted y pizarrón' if n[:2]=='09' and 'pizarron' in n else ''); t2=F['bots']
        f1=ImageFont.truetype(B,fs); f2=ImageFont.truetype(R,int(fs*0.6))
        d.rectangle([0,0,W,int(fs*2.6)],fill=(255,255,255,175))
        d.text((30,int(fs*0.3)),t1,font=f1,fill=(35,34,32)); d.text((30,int(fs*1.55)),t2,font=f2,fill=(80,80,80))
    im.save(n+'.jpg',quality=92)
