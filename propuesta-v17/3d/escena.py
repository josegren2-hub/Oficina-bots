import bpy, sys, math, json, random
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
a=sys.argv[sys.argv.index('--')+1:]
VIEW=a[0]; NIGHT=a[1]=='1'; OUT=a[2]; FSEL=a[3] if len(a)>3 else ''
SAMPLES=int(a[4]) if len(a)>4 else 96
T='/workspace/oficina-bots/propuesta-v17/3d/tex/'
random.seed(3)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene
S=0.5; FW,FD=18,9; FH=3.6  # floor-to-floor m
MAT={}
def mat(name,col,rough=0.5,metal=0,emit=0,trans=0,img=None,alpha=1):
    k=(name,NIGHT)
    if name in MAT: return MAT[name]
    m=bpy.data.materials.new(name); m.use_nodes=True; p=m.node_tree.nodes['Principled BSDF']
    c=tuple(int(col.lstrip('#')[i:i+2],16)/255 for i in (0,2,4)); c=tuple(x**2.2 for x in c)+(1,)
    p.inputs['Base Color'].default_value=c; p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
    if trans: p.inputs['Alpha'].default_value=0.22 if name=='glassM' else 0.035; p.inputs['Roughness'].default_value=0.05
    if emit: p.inputs['Emission Color'].default_value=c; p.inputs['Emission Strength'].default_value=emit
    if img:
        t=m.node_tree.nodes.new('ShaderNodeTexImage'); t.image=bpy.data.images.load(img)
        m.node_tree.links.new(t.outputs['Color'],p.inputs['Base Color'])
        if emit: m.node_tree.links.new(t.outputs['Color'],p.inputs['Emission Color'])
    if False:
        n=m.node_tree.nodes; w=n.new('ShaderNodeTexWave'); w.inputs['Scale'].default_value=1.2; w.inputs['Distortion'].default_value=6; w.wave_type='BANDS'
        mp=n.new('ShaderNodeMapping'); tc=n.new('ShaderNodeTexCoord'); mp.inputs['Scale'].default_value=(1,8,1)
        m.node_tree.links.new(tc.outputs['Object'],mp.inputs['Vector']); m.node_tree.links.new(mp.outputs['Vector'],w.inputs['Vector'])
        r=n.new('ShaderNodeValToRGB'); r.color_ramp.elements[0].color=tuple(x*0.78 for x in c[:3])+(1,); r.color_ramp.elements[1].color=c
        m.node_tree.links.new(w.outputs['Fac'],r.inputs['Fac']); m.node_tree.links.new(r.outputs['Color'],p.inputs['Base Color'])
    MAT[name]=m; return m
def box(x,y,z,w,d,h,m,bev=0.01):
    # plan units x,y,w,d ; z,h in meters
    bpy.ops.mesh.primitive_cube_add(size=1,location=((x+w/2)*S,-(y+d/2)*S,z+h/2))
    o=bpy.context.object; o.scale=(w*S,d*S,h); bpy.ops.object.transform_apply(scale=True)
    if bev:
        b=o.modifiers.new('b','BEVEL'); b.width=bev; b.segments=2
    o.data.materials.append(m); return o
def cyl(x,y,z,r,h,m,v=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=v,radius=r,depth=h,location=(x*S,-y*S,z+h/2)); o=bpy.context.object; o.data.materials.append(m)
    bpy.ops.object.shade_smooth(); return o
def sph(x,y,z,r,m,sc_=(1,1,1)):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=r,location=(x*S,-y*S,z)); o=bpy.context.object; o.scale=sc_; o.data.materials.append(m); bpy.ops.object.shade_smooth(); return o
def plane_img(cx,cy,z,w,h,img,face='y',emit=0):
    bpy.ops.mesh.primitive_plane_add(size=1,location=(cx*S,-cy*S,z)); o=bpy.context.object
    o.scale=(w*S,h,1); o.rotation_euler=(math.pi/2,0,0) if face=='y' else (math.pi/2,0,math.pi/2)
    m=bpy.data.materials.new(img); m.use_nodes=True; p=m.node_tree.nodes['Principled BSDF']; t=m.node_tree.nodes.new('ShaderNodeTexImage'); t.image=bpy.data.images.load(T+img)
    m.node_tree.links.new(t.outputs['Color'],p.inputs['Base Color']); p.inputs['Roughness'].default_value=0.3
    if emit: m.node_tree.links.new(t.outputs['Color'],p.inputs['Emission Color']); p.inputs['Emission Strength'].default_value=emit
    o.data.materials.append(m); return o
WOOD=lambda: mat('wood','#C99A6B',0.45); DARK=lambda: mat('dark','#2E2D2B',0.4); METAL=lambda: mat('metal','#B9BCC0',0.25,1)
def plant(x,y,z,s=1.0):
    cyl(x,y,z,0.18*s,0.32*s,mat('pot','#D8CFC2',0.6))
    g=[mat('leaf1','#4F7A43',0.6),mat('leaf2','#6C9A55',0.6),mat('leaf3','#3E6538',0.6)]
    for i in range(7):
        sph(x+random.uniform(-.35,.35)*s,y+random.uniform(-.35,.35)*s,z+0.32*s+random.uniform(0.15,0.75)*s,random.uniform(0.13,0.22)*s,random.choice(g))
def chair(cx,cy,z,col='#3B3A36',face=-1,k=1.0):
    m=mat('chair'+col,col,0.6); cyl(cx,cy,z,0.04,0.42,METAL()); cyl(cx,cy,z,0.26*k,0.03,METAL(),5)
    box(cx-0.45*k,cy-0.45*k,z+0.42,0.9*k,0.9*k,0.08,m,0.03)
    box(cx-0.45*k,cy+(0.35*k if face<0 else -0.5*k),z+0.5,0.9*k,0.15,0.5,m,0.03)
def desk(x,y,z,w=3,d=1.4,tag=None):
    box(x,y,z+0.72,w,d,0.04,WOOD(),0.005)
    for lx,ly in ((x+0.1,y+0.1),(x+w-0.2,y+0.1),(x+0.1,y+d-0.2),(x+w-0.2,y+d-0.2)): box(lx,ly,z,0.1,0.1,0.72,METAL(),0)
    mx=x+w/2; box(mx-0.6,y+0.2,z+0.76,1.2,0.06,0.42,DARK(),0.005)
    box(mx-0.58,y+0.27,z+0.79,1.16,0.01,0.36,mat('screen','#5B8FD0',0.2,emit=1.2 if NIGHT else 0.6),0)
    box(mx-0.05,y+0.15,z+0.76,0.1,0.1,0.05,DARK(),0)
    box(mx-0.45,y+0.6,z+0.76,0.9,0.3,0.02,mat('kb','#E5E2DC',0.5),0)
    cyl(x+0.35,y+0.55,z+0.76,0.08,0.18,mat('mug','#E07A5F',0.3))
    if w>=3: plant(x+w-0.35,y+0.4,z+0.76,0.35)
    # desk lamp
    cyl(x+0.4,y+0.25,z+0.76,0.012*20,0.02,DARK()); cyl(x+0.4,y+0.25,z+0.78,0.02,0.4,DARK()); 
    sph(x+0.4,y+0.35,z+1.2,0.09,mat('lampshade','#F2C14E',0.3,emit=6 if NIGHT else 0.5))
    chair(mx,y+d+0.7,z)
def wall(x,y,z,w,d,h,kind):
    if kind=='glass':
        box(x,y,z,w,d,h,mat('glass','#DDEEF5',0.03,trans=1),0)
    else: box(x,y,z,w,d,h,mat('wall','#F4F0E8',0.8),0.005)
def art(cx,cy,z,w,h,col,face='y'):
    if face=='y':
        box(cx-w/2,cy,z,w,0.06,h,mat('frame','#2B2A27',0.4),0.005); box(cx-w/2+0.08,cy+0.05,z+0.04,w-0.16,0.03,h-0.08,mat('art'+col,col,0.7),0)
    else:
        box(cx,cy-w/2,z,0.06,w,h,mat('frame','#2B2A27',0.4),0.005); box(cx+0.05,cy-w/2+0.08,z+0.04,0.03,w-0.16,h-0.08,mat('art'+col,col,0.7),0)
def shelf_wall(x,y,z,w):
    for k in range(3): box(x,y,z+1.2+k*0.4,w,0.5,0.03,WOOD(),0.004)
    for i in range(int(w*3)):
        if random.random()<0.75:
            bh=random.uniform(0.18,0.3); box(x+i/3+0.05,y+0.05,z+1.23+random.randint(0,2)*0.4,0.18,0.35,bh,mat('book%d'%(i%5),['#C0392B','#2E86AB','#E9C46A','#5E7F52','#8E6C8A'][i%5],0.7),0)
def pendant(x,y,z):
    cyl(x,y,z+FH-0.9,0.006/S,0.75,DARK(),8)
    bpy.ops.mesh.primitive_cone_add(vertices=24,radius1=0.22,radius2=0.06,depth=0.22,location=(x*S,-y*S,z+FH-1.0)); o=bpy.context.object; o.data.materials.append(mat('shade','#2B2A27',0.4)); bpy.ops.object.shade_smooth()
    sph(x,y,z+FH-1.08,0.07,mat('bulb','#FFD9A0',0.2,emit=20 if NIGHT else 2))
    if NIGHT:
        bpy.ops.object.light_add(type='POINT',location=(x*S,-y*S,z+FH-1.25)); l=bpy.context.object.data; l.energy=110; l.color=(1,0.78,0.5); l.shadow_soft_size=0.25
def rug(x,y,z,w,d,col): box(x,y,z+0.014,w,d,0.012,mat('rug'+col,col,1),0.004)
def core(z,fid):
    x,y,w,d=16,0,2,3
    box(x,y,z,w,d,FH-0.3,mat('core','#B8C6CF',0.6),0.01)
    box(x+0.3,y+d-0.02,z,1.4,0.05,2.2,mat('steel','#D5D8DC',0.2,1),0.005)
    box(x+0.98,y+d,z,0.04,0.06,2.2,DARK(),0)
    box(x+0.6,y+d+0.02,z+2.3,0.8,0.03,0.22,mat('lbl','#2B2A27',0.5),0)
LAMPS={"PB":[(4,4),(11,3),(13,6)],"P1":[(9,5),(3,3),(13,3)],"P2":[(5,5),(12,5)],"P3":[(3,3),(6,7),(14,6)],"P4":[(2.5,2.5),(9,3),(10,7)],"P5":[]}
FLOORCOL={"PB":'#B98557',"P1":'#C9A57A',"P2":'#BFA27F',"P3":'#C9A57A',"P4":'#C9A57A'}
ACC={"PB":'#D9A07A',"P1":'#F2D7A6',"P2":'#C7C1DE',"P3":'#C9D8B6',"P4":'#E8B4B8'}
LABELS=[]
def floor(fid,z):
    box(-0.3,-0.3,z-0.35,FW+0.6,FD+0.6,0.35,mat('slab','#EDE6DA',0.7),0.01)
    box(0,0,z+0.0,FW,FD,0.012,mat('woodf'+fid,FLOORCOL[fid],0.5),0)
    # back walls with accent paint on wall
    wall(-0.3,-0.3,z,FW+0.3,0.3,FH-0.35,'solid'); wall(-0.3,0,z,0.3,FD,FH-0.35,'solid')
    box(0,-0.01,z+0.01,FW,0.02,1.0,mat('acc'+fid,ACC[fid],0.8),0)  # wainscot accent
    box(-0.01,0,z+0.01,0.02,FD,1.0,mat('acc'+fid,ACC[fid],0.8),0)
    # front low glass with metal rail
    wall(0,FD-0.05,z,FW,0.1,1.0,'glass'); wall(FW-0.05,0,z,0.1,FD,1.0,'glass')
    box(0,FD-0.08,z+1.0,FW,0.16,0.04,METAL(),0); box(FW-0.08,0,z+1.0,0.16,FD,0.04,METAL(),0)
    core(z,fid)
    for lx,ly in LAMPS[fid]: pendant(lx,ly,z)
    LABELS.append(({'PB':'PB','P2':'P1','P3':'P2','P4':'P3'}[fid],(0,FD+0.6,z-0.3)))
    if fid=='PB':
        box(1,1,z,7,1.4,1.05,mat('counter','#D9B48A',0.4),0.02); box(0.9,0.9,z+1.05,7.2,1.6,0.05,mat('marble','#F1EEE8',0.15),0.01)
        box(6.6,1.15,z+1.1,1.0,0.9,0.5,mat('steel','#D5D8DC',0.2,1),0.02); box(6.75,1.9,z+1.25,0.7,0.1,0.15,DARK(),0)
        for k in range(4): cyl(1.85+k*1.5,3.35,z,0.05,0.7,METAL()); cyl(1.85+k*1.5,3.35,z+0.7,0.32,0.06,mat('stool','#C8784E',0.5))
        shelf_wall(1.2,-0.0,z+0.0,6)
        for cx,cy in ((2.8,6.8),(5.8,6.8)):
            cyl(cx,cy,z,0.05,0.72,METAL()); cyl(cx,cy,z+0.72,0.8*S*2/2*1.0,0.04,WOOD())
            for dx,dy in ((-1.2,0),(1.2,0)): chair(cx+dx,cy+dy,z,'#7A9A6E')
        desk(9.6,1,z); desk(12.8,1,z); desk(11.2,5.3,z)
        m=mat('sofa','#EFE6D2',0.9); box(14.6,6.6,z,1.4,2.2,0.42,m,0.08); box(15.6,6.6,z+0.42,0.4,2.2,0.42,m,0.08)
        rug(9.3,4.6,z,6.6,3.6,'#E8D8C0'); rug(0.6,5.6,z,7.4,2.6,'#D8C3A0')
        box(8.85,0.2,z,0.3,3.2,1.2,mat('planter','#8B6B4A',0.7),0.02)
        for k in range(4): sph(9.0,0.6+k*0.8,z+1.35,0.32,mat('leaf','#5E7F52',0.8))
        plant(0.8,8.0,z,1.1); plant(15.2,4.2,z,0.8)
        art(11,0,z+1.4,2.4,1.1,'#E9C46A'); art(14.3,0,z+1.4,1.2,0.9,'#2E86AB'); art(0,5,z+1.3,1.6,1.0,'#5E7F52','x')
    if fid=='P1':
        desk(1,1,z); desk(12,1,z); desk(1,6,z)
        m=mat('lounge','#9B7BB8',0.9); box(13,6.5,z,2,1.4,0.42,m,0.08); box(13,7.5,z+0.42,2,0.4,0.4,m,0.08)
        rug(12.5,6,z,3,2.6,'#E8D8C0'); rug(6.5,3.0,z,5,4.5,'#D8C3A0')
        plant(0.7,4.4,z,1.1); plant(15.2,4.3,z,0.8)
        art(4,0,z+1.4,1.6,1.0,'#E9C46A'); art(9,0,z+1.4,2.0,1.1,'#2E86AB'); art(0,4.5,z+1.4,1.4,0.9,'#E07A5F','x')
    if fid=='P2':
        desk(3,3,z); desk(10,3,z)
        box(0.3,1,z,1,4,2.1,WOOD(),0.01)
        for k in range(4):
            for j in range(8): box(1.15,1.2+j*0.45,z+0.15+k*0.5,0.12,0.3,0.32,mat('book%d'%((j+k)%5),['#2E86AB','#8E6C8A','#C0392B','#5E7F52','#E9C46A'][(j+k)%5],0.7),0)
        box(14,6.5,z,1.2,1.2,0.8,mat('safe','#4A4A48',0.4,0.5),0.02); box(14.1,6.3,z+0.8,1.0,1.0,0.25,mat('printer','#E5E2DC',0.4),0.02)
        plant(7.4,7.4,z,1.2)
        rug(2,2.5,z,12,4.8,'#B7AFD0')
        art(6,0,z+1.4,1.4,1.0,'#C0392B'); art(12,0,z+1.4,1.4,1.0,'#E9C46A'); shelf_wall(3,0,z,3)
    if fid=='P3':
        for dx,dy in ((0.8,1),(4.3,1),(7.8,1),(0.8,5.5),(4.3,5.5)): desk(dx,dy,z)
        # studio walls: y=3 wall from x11..18 , x=11 wall from 3..9 with door 7.5..8.7
        sw=mat('studio','#5A4A6A',0.9)
        box(11,2.85,z,7-2,0.3,FH-0.35,sw,0.005)
        box(10.85,3,z,0.3,4.5,FH-0.35,sw,0.005); box(10.85,8.7,z,0.3,0.3,FH-0.35,sw,0.005)
        box(10.85,7.5,z+2.2,0.3,1.2,FH-0.35-2.2,sw,0)
        box(11,3,z+0.012,7,6,0.008,mat('carpet','#3F3550',1),0)
        box(12.5,5,z,3,1.4,0.75,mat('sdesk','#2B2A27',0.4),0.02)
        cyl(13.75,4.6,z+0.75,0.02,0.35,METAL()); cyl(13.75,4.6,z+1.1,0.06,0.16,DARK())
        cyl(14.9,5.6,z+0.75,0.02,0.35,METAL()); cyl(14.9,5.6,z+1.1,0.06,0.16,DARK())
        box(12.8,5.3,z+0.75,1.2,0.6,0.08,mat('mixer','#3B3A36',0.3),0.01)
        chair(13.9,6.9,z,'#C8784E'); chair(15.2,6.9,z,'#C8784E')
        for k in range(5): box(11.6+k*1.25,3.0,z+0.6,1.0,0.12,1.4,mat('foam%d'%(k%2),['#7A5A8A','#C8784E'][k%2],1),0.04)
        for k in range(3): box(11.15,3.6+k*1.3,z+0.6,0.12,1.0,1.4,mat('foam%d'%(k%2),['#7A5A8A','#C8784E'][k%2],1),0.04)
        plane_img(14.5,3.17,z+2.45,2.6,0.42,'onair.png','y',emit=8)
        if NIGHT or True:
            bpy.ops.object.light_add(type='POINT',location=(14.5*S,-3.6*S,z+2.4)); l=bpy.context.object.data; l.energy=25; l.color=(1,0.15,0.15)
        rug(0.5,3.4,z,9,1.8,'#9DB88A'); plant(10,0.6,z,1.0); plant(9.6,8.2,z,1.1)
        art(5,0,z+1.4,1.6,1.0,'#5E7F52'); art(0,4,z+1.4,1.4,1.0,'#E07A5F','x'); shelf_wall(10,0,z,0.8)
    if fid=='P4':
        desk(1,1.5,z,3,1.2); desk(7,1,z); desk(11,1,z); desk(8,5.5,z)
        # glass office 0..5 x 0..5, door on x=5 at y 2..3.6
        box(0,4.95,z,5,0.1,FH-0.35,mat('glassM','#BFE0F0',0.03,trans=1),0)
        box(4.95,0,z,0.1,2,FH-0.35,mat('glassM','#BFE0F0',0.03,trans=1),0); box(4.95,3.6,z,0.1,1.4,FH-0.35,mat('glassM','#BFE0F0',0.03,trans=1),0)
        for x0,y0,w,d in ((0,4.92,5,0.16),(4.92,0,0.16,5)): box(x0,y0,z+FH-0.4,w,d,0.05,DARK(),0)
        box(4.92,0,z,0.16,0.08,FH-0.35,DARK(),0); box(4.92,4.92,z,0.16,0.16,FH-0.35,DARK(),0); box(4.92,1.95,z,0.16,0.08,FH-0.35,DARK(),0); box(4.92,3.6,z,0.16,0.08,FH-0.35,DARK(),0)
        rug(0.3,0.3,z,4.4,4.4,'#F3C9CC'); plant(0.6,4.3,z,0.9)
        box(0.2,6,z,0.5,2.5,1.0,mat('cred','#E8B4B8',0.6),0.02)
        for k in range(6): box(0.3,6.2+k*0.35,z+1.0,0.3,0.22,0.3+0.04*k,mat('mag%d'%(k%3),['#C0392B','#F2F2F2','#E07A5F'][k%3],0.6),0)
        rug(6.5,0.4,z,9,8,'#EBC6C9'); plant(15,4,z,1.0); plant(15,8,z,0.9)
        art(9,0,z+1.4,1.6,1.1,'#C0392B'); art(13,0,z+1.4,1.6,1.1,'#E9C46A'); art(0,2.5,z+1.4,1.4,1.0,'#2E86AB','x')

def board(bx,by,z):
    for lx in (bx,bx+2.0): box(lx,by,z,0.08,0.08,1.9,METAL(),0)
    box(bx-0.05,by-0.04,z+0.75,2.18,0.06,1.1,mat('wbframe','#C9CDD2',0.3,1),0.005)
    plane_img(bx+1.04,by+0.04,z+1.3,2.0,0.98,'pizarron.png','y',emit=0.6 if NIGHT else 0.15)
def floor5(z):
    H=4.4; G=mat('glass','#DDEEF5',0.03,trans=1); fr=mat('mull','#2B2A27',0.35,0.6)
    box(-1.6,-1.1,z-0.45,21.2,12.2,0.45,mat('slab5','#E9E2D4',0.6),0.02)
    box(-1,-0.5,z,20,7.5,0.012,mat('stone','#B9A894',0.3),0)
    box(-1.6,7,z,21.2,4.1,0.012,mat('deck','#A87A50',0.7),0)
    for k in range(40): box(-1.6,7+k*0.1,z,21.2,0.005,0.001,mat('deckline','#7A5638',0.8),0)
    # glass curtain: back, left, front(y=7) with mullions
    box(-1,-0.55,z,20,0.1,H,G,0); box(-1.05,-0.5,z,0.1,7.5,H,G,0)
    for p in ((-1.08,-0.58),): box(p[0],p[1],z,0.1,0.1,H,METAL(),0)
    box(-1,6.95,z,17,0.1,1.1,G,0); box(18.95,3,z,0.1,4,1.1,G,0); box(-1,6.9,z+1.1,17,0.2,0.05,METAL(),0)
    box(-1.1,-0.62,z+H,20.2,0.16,0.08,METAL(),0.005); box(-1.12,-0.6,z+H,0.16,7.6,0.08,METAL(),0.005)  # canopy roof (cut away in stack? keep thin)
    box(-1.6,10.95,z,21.2,0.08,1.0,G,0); box(-1.6,10.9,z+1.0,21.2,0.16,0.04,METAL(),0)
    box(16,0,z,2,3,H,mat('core','#B8C6CF',0.6),0.01); box(16.3,2.98,z,1.4,0.05,2.2,mat('steel','#D5D8DC',0.2,1),0.005)
    # Ted office glass room -1..8.5 x -0.5..5, door at x=8.5 y 3.4..5 (frameless)
    box(-1,4.95,z,9.5,0.1,H,G,0); box(8.45,-0.5,z,0.1,3.9,H,G,0)
    rug(-0.5,0,z,8.5,4.6,'#3A4A5C')
    box(1.5,1,z+0.74,4,1.8,0.06,mat('exec','#3A2618',0.25),0.02); box(1.6,1.1,z,3.8,0.3,0.74,mat('exec','#3A2618',0.25),0.01)
    for mx in (2.7,4.3): box(mx-0.6,1.15,z+0.8,1.2,0.06,0.45,DARK(),0); box(mx-0.58,1.22,z+0.82,1.16,0.01,0.4,mat('screen','#5B8FD0',0.2,emit=1.2 if NIGHT else 0.6),0)
    chair(3.5,3.4,z,'#1E1E1E')
    # pizarron mounted on the back window (no legs), beside the desk
    box(5.95,-0.47,z+0.75,2.18,0.06,1.1,mat('wbframe','#C9CDD2',0.3,1),0.005)
    plane_img(7.04,-0.38,z+1.3,2.0,0.98,'pizarron.png','y',emit=0.6 if NIGHT else 0.15)
    m=mat('leather','#6B4A33',0.5); box(-0.7,0.2,z,0.9,3,0.42,m,0.08); box(-0.7,0.2,z+0.42,0.3,3,0.4,m,0.08)
    box(0.5,1.2,z,1.0,1.4,0.36,WOOD(),0.03)
    m2=mat('arm','#C8B08A',0.8); box(6.2,2.6,z,1.1,1.1,0.42,m2,0.08); box(6.2,3.5,z+0.42,1.1,0.2,0.4,m2,0.08)
    plant(-0.5,4.4,z,1.2); plant(7.9,4.3,z,1.0)
    # boardroom 8.5..16 x -0.5..5.5 (16 seats)
    box(8.5,5.45,z,7.5,0.1,H,G,0); box(15.95,3,z,0.1,2.5,H,G,0)
    rug(9,0.3,z,6.6,4.8,'#C9B79C')
    box(9.6,1.7,z+0.72,5.4,2.0,0.08,mat('btable','#2B1E14',0.2),0.04)
    for lx in (10.6,12.3,14.0): box(lx-0.3,2.4,z,0.6,0.6,0.72,METAL(),0)
    for k in range(7):
        cx=9.95+k*0.78; chair(cx,1.15,z,'#3B3A36',face=1,k=0.7); chair(cx,4.25,z,'#3B3A36',face=-1,k=0.7)
    chair(9.15,2.7,z,'#3B3A36',k=0.7); chair(15.45,2.7,z,'#3B3A36',k=0.7)
    box(11.1,-0.4,z+1.0,2.6,0.08,1.5,DARK(),0.01); box(11.2,-0.33,z+1.1,2.4,0.02,1.3,mat('tv','#1F3A5A',0.2,emit=0.8),0)
    for cx in (10.8,12.3,13.8): pendant(cx,2.7,z+0.8)
    for lx,ly in ((3.5,2.2),): pendant(lx,ly,z+0.8)
    # lounge in open area / terrace
    plant(17,5.5,z,1.2); plant(-0.3,6.2,z,1.0)
    for tx in (1,6,11,15): 
        box(tx,8.2,z,2,1,0.38,mat('lounger','#EFE6D2',0.9),0.08); plant(tx+2.6,8.4,z,0.8)
    cyl(9.5,9.2,z,0.5,0.6,mat('fire','#3B3A36',0.3))
    if NIGHT:
        for lx,ly in ((3.5,2.5),(6,1.5),(12.3,2.7),(17,5),(5,9),(14,9)):
            bpy.ops.object.light_add(type='POINT',location=(lx*S,-ly*S,z+2.8)); l=bpy.context.object.data; l.energy=140; l.color=(1,0.8,0.55)
    LABELS.append(('P4n',(-1.6,11.1,z-0.4)))
FLIDS=["PB","P1","P2","P3","P4","P5"]
if VIEW in('stack',):
    GAP=2.6
    for i,f in enumerate(["PB","P2","P3","P4"]): floor(f,i*(FH+GAP))
    floor5(4*(FH+GAP)+0.3)
    tgt=Vector((4.5,-2.5,(FH+GAP)*2.35))
elif VIEW=='grid':
    pos={"P5":(0,0),"P4":(1,0),"P3":(0,1),"P2":(1,1),"PB":(0.5,2)}
    order=["PB","P2","P3","P4","P5"]
    for f in order:
        c,r=pos[f]
        # place via offsetting: build at z=0 then move new objects
        before=set(bpy.data.objects)
        floor5(0) if f=='P5' else floor(f,0)
        off=Vector((c*12.0 - r*0, -r*8.0, 0))
        off=Vector((c*12.5, -r*8.5, 0))
        for o in set(bpy.data.objects)-before: o.location+=off
        LABELS[-1]=(f,tuple(Vector(LABELS[-1][1])+Vector((off.x/S, -off.y/S, 0))))
    tgt=None
elif VIEW in('P5','P5ted'): floor5(0)
else:
    floor(VIEW,0)
# camera
cam=bpy.data.cameras.new('c'); co=bpy.data.objects.new('c',cam); sc.collection.objects.link(co); sc.camera=co
def look(o,t):
    d=Vector(t)-o.location; o.rotation_euler=d.to_track_quat('-Z','Y').to_euler()
if VIEW=='stack':
    cam.type='ORTHO'; cam.ortho_scale=37; co.location=tgt+Vector((26,-30,14)); look(co,tgt); W,H=1700,2500
    co.location=co.location+Vector((0,0,0))
elif VIEW=='grid':
    allp=[o.location for o in bpy.data.objects if o.type=='MESH']
    c=Vector((sum(p.x for p in allp)/len(allp),sum(p.y for p in allp)/len(allp),0))
    cam.type='ORTHO'; cam.ortho_scale=31; co.location=c+Vector((22,-26,26)); look(co,c); W,H=2400,1900
else:
    cam.type='PERSP'; cam.lens=24
    V={'PB':((10.2,-6.2,3.3),(4.2,-1.8,0.7)),'P1':((9.5,-6.6,3.2),(5.0,-1.6,0.9)),'P2':((9.0,-6.4,3.0),(4.0,-1.9,0.8)),'P3':((7.0,-9.0,5.2),(4.6,-2.3,0.4)),'P4':((8.6,-6.5,3.2),(3.6,-1.6,0.9)),'P5':((10.0,-9.5,6.2),(3.6,-1.4,0.6)),'P5ted':((0.6,-2.3,2.0),(2.6,0.1,1.1))}
    co.location=Vector(V[VIEW][0]); look(co,V[VIEW][1]); W,H=2000,1300
sc.render.resolution_x=W; sc.render.resolution_y=H
# world & lights
w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True; bg=w.node_tree.nodes['Background']
if NIGHT:
    bg.inputs['Color'].default_value=(0.012,0.016,0.035,1); bg.inputs['Strength'].default_value=1.0
    bpy.ops.object.light_add(type='SUN',rotation=(math.radians(60),0,math.radians(30))); l=bpy.context.object.data; l.energy=0.08; l.color=(0.6,0.7,1)
else:
    bg.inputs['Color'].default_value=(0.62,0.72,0.85,1); bg.inputs['Strength'].default_value=0.9
    bpy.ops.object.light_add(type='SUN',rotation=(math.radians(52),math.radians(0),math.radians(35))); l=bpy.context.object.data; l.energy=3.2; l.angle=math.radians(6); l.color=(1,0.95,0.88)
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=SAMPLES; sc.cycles.use_denoising=True
sc.cycles.max_bounces=6; sc.cycles.transmission_bounces=4
sc.view_settings.view_transform='AgX'; sc.view_settings.look='AgX - Medium High Contrast' if not NIGHT else 'AgX - Base Contrast'
sc.view_settings.exposure=0.0 if not NIGHT else 0.4
sc.render.image_settings.file_format='PNG'; sc.render.filepath=OUT
# film transparent off; label coords
bpy.context.view_layer.update()
lab={('P4' if f=='P4n' else f):list(world_to_camera_view(sc,co,Vector((p[0]*S,-p[1]*S,p[2])))[:2]) for f,p in LABELS}
json.dump(lab,open(OUT+'.json','w'))
fo=[o for o in bpy.data.objects if o.data and hasattr(o.data,'materials') and o.data.materials and o.data.materials[0].name.startswith('woodf')]
for o in fo[:1]: print('DBG',o.name,o.location,o.dimensions,tuple(o.data.materials[0].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value))
bpy.ops.render.render(write_still=True)
