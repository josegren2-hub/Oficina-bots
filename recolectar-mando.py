#!/usr/bin/env python3
"""Centro de mando: junta datos REALES por bot, guarda historial local, cifra (AES-GCM, PBKDF2) y publica mando.enc en gh-pages.
Uso: python3 recolectar-mando.py [--no-publicar]   Requiere GITHUB_TOKEN_OFICINA para publicar (nunca se imprime)."""
import json,glob,os,re,sys,sqlite3,base64,datetime,csv,secrets,urllib.request
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
B='/workspace/oficina-bots';AD='/home/box/agent-data';SUP='/workspace/supervisor'
TZ=datetime.timezone(datetime.timedelta(hours=-6))
MAP={'e290':'ted','60f9':'tadeo','83ad':'mateo','276c':'julian','2927':'ines','fb47':'vale','d53b':'rulo','a873':'emiliano','4c6a':'luna','5b96':'libro','7257':'apps','7abd':'ceo','6cb7':'tr-editor','c945':'tr-cm','dd3a':'director'}
NOMBRE_REP={'ted':'Ted','tadeo':'Tadeo','mateo':'Mateo','julian':'Julián','ines':'Inés','vale':'Valery','rulo':'Rulo','emiliano':'Emiliano','luna':'Luna','libro':'Libro','apps':'Apps','ceo':'CEO Digital','tr-editor':'Editor Jefe','tr-cm':'Community Manager','director':'Director'}
iso=lambda ms:datetime.datetime.fromtimestamp(ms/1000,TZ).isoformat(timespec='minutes')
ahora=datetime.datetime.now(TZ)
def corta(t,n):t=re.sub(r'\s+',' ',t).strip();return t if len(t)<=n else t[:n-1]+'…'
estado=json.load(open(f'{B}/public/estado.json'))
bots={b['id']:{'id':b['id'],'nombre':b['nombre'],'area':b['area'],'estado':b['estado'],'frase':b.get('frase')} for b in estado['bots']}
fuentes={'estado':f"public/estado.json ({estado.get('actualizado')})"}
# 1) supervisor: tarea / pendiente / última actividad
sup=sorted(glob.glob(f'{SUP}/estado-oficina-*.txt'))
if sup:
  txt=open(sup[-1]).read();fuentes['supervisor']=os.path.basename(sup[-1])
  for m in re.finditer(r'\{ id: "(\w+)".*?estado: "(\w+)", ultima: "([^"]*)", tarea: "([^"]*)", pendiente: "([^"]*)" \}',txt):
    bid=MAP.get(m.group(1))
    if bid:bots[bid].update(sup_estado=m.group(2),sup_ultima=m.group(3),tarea=m.group(4),pendiente=m.group(5))
# 2) reporte de pendientes: viñetas por sección del bot
rep=sorted(glob.glob(f'{SUP}/reporte-pendientes-*.md'))
if rep:
  fuentes['pendientes']=os.path.basename(rep[-1]);sec=None;cur={}
  for l in open(rep[-1]):
    if l.startswith('## '):sec=l[3:].strip();continue
    if sec and l.startswith('- ') :cur.setdefault(sec,[]).append(re.sub(r'\*\*','',l[2:].strip()))
  for bid,n in NOMBRE_REP.items():
    for s,items in cur.items():
      if s.split(' (')[0].strip()==n or s.startswith(n+' ') or (bid in('mateo','tr-editor','tr-cm') and s.startswith('En pausa')):
        bots[bid].setdefault('pendientes',[]).extend(corta(i,400) for i in items if not(bid!='mateo' and s.startswith('En pausa')))
# 3) índice de mensajes: último trabajo, historial y actividad
db=sqlite3.connect(f'file:{AD}/search-index.db?mode=ro',uri=True);fuentes['mensajes']='índice de conversaciones de cada bot (solo lectura)'
desde=int((ahora-datetime.timedelta(days=30)).timestamp()*1000)
for pre,bid in MAP.items():
  b=bots[bid];rows=db.execute("select timestamp_ms,body from messages where agent_id like ? and role='assistant' and in_main_chat=1 and length(body)>40 order by timestamp_ms desc limit 15",(pre+'%',)).fetchall()
  b['ultimo']={'t':iso(rows[0][0]),'txt':corta(rows[0][1],600)} if rows else None
  b['historial']=[{'t':iso(t),'txt':corta(x,220)} for t,x in rows]
  dia={}
  for t,r in db.execute("select timestamp_ms,role from messages where agent_id like ? and timestamp_ms>=?",(pre+'%',desde)):
    k=iso(t)[:10];dia.setdefault(k,[0,0]);dia[k][0 if r=='user' else 1]+=1
  tot=db.execute("select count(*),sum(role='user'),min(timestamp_ms),max(timestamp_ms) from messages where agent_id like ?",(pre+'%',)).fetchone()
  b['stats']={'por_dia':dia,'mensajes':tot[0],'peticiones':tot[1] or 0,'desde':iso(tot[2]) if tot[2] else None,'ultima_actividad':iso(tot[3]) if tot[3] else None}
# 4) bitácora de rutinas de Ted
try:
  r=list(csv.DictReader(open(f'{SUP}/registro-rutinas.csv')));fuentes['rutinas']='supervisor/registro-rutinas.csv'
  bots['ted']['rutinas']=[{'t':x['fecha'],'txt':corta(x['resultado'],220),'err':x['errores']} for x in r[::-1][:30]]
except Exception:pass
# 5) historial local (para estadísticas de estados en el tiempo)
os.makedirs(f'{B}/mando-local',exist_ok=True);H=f'{B}/mando-local/historial.jsonl'
snap={'t':ahora.isoformat(timespec='minutes'),'e':{k:v['estado'] for k,v in bots.items()}}
with open(H,'a') as f:f.write(json.dumps(snap)+'\n')
hist=[json.loads(l) for l in open(H)][-400:]
data={'generado':ahora.isoformat(timespec='minutes'),'fuentes':fuentes,'bots':list(bots.values()),'snapshots':hist}
raw=json.dumps(data,ensure_ascii=False).encode()
# cifrado
pw=(os.environ.get('MANDO_CLAVE') or open(f'{B}/.clave-mando').read()).strip().encode();salt=base64.b64decode(open(f'{B}/.sal-mando').read());IT=310000
key=PBKDF2HMAC(hashes.SHA256(),32,salt,IT).derive(pw);iv=secrets.token_bytes(12)
enc={'v':1,'kdf':'PBKDF2-SHA256','iter':IT,'salt':base64.b64encode(salt).decode(),'iv':base64.b64encode(iv).decode(),'ct':base64.b64encode(AESGCM(key).encrypt(iv,raw,None)).decode()}
out=f'{B}/mando-local/mando.enc';open(out,'w').write(json.dumps(enc));print(f'mando.enc listo ({len(raw)} B en claro, cifrado)')
if '--no-publicar' in sys.argv:sys.exit()
tok=os.environ.get('GITHUB_TOKEN_OFICINA') or sys.exit('Falta GITHUB_TOKEN_OFICINA')
api='https://api.github.com/repos/josegren2-hub/Oficina-bots/contents/mando.enc';h={'Authorization':'Bearer '+tok,'Accept':'application/vnd.github+json'}
sha=None
try:sha=json.load(urllib.request.urlopen(urllib.request.Request(api+'?ref=gh-pages',headers=h)))['sha']
except Exception:pass
body={'message':'mando.enc','branch':'gh-pages','content':base64.b64encode(open(out,'rb').read()).decode()}
if sha:body['sha']=sha
urllib.request.urlopen(urllib.request.Request(api,data=json.dumps(body).encode(),headers=h,method='PUT'));print('mando.enc publicado')
