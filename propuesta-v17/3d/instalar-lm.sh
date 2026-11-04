cd /workspace/oficina-bots/propuesta-v17/3d/bake
python3 - <<'P'
import json,shutil
from PIL import Image,ImageFilter
K={}
for f in ['PB','P2','P3','P4','P5']:
    for n in ('dia','noche'):
        Image.open(f'{f}-{n}.png').convert('RGB').filter(ImageFilter.GaussianBlur(0.7)).save(f'../../../public/v17b/{f}-{n}.webp',quality=80,method=6)
    shutil.copy(f'{f}.glb',f'../../../public/v17b/{f}.glb'); K[f]=json.load(open(f'{f}.glb.json'))['K']
json.dump(K,open('../../../public/v17b/lm.json','w'))
print(K)
P
du -ch ../../../public/v17b/* | tail -1
