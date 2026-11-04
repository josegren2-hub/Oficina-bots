#!/usr/bin/env python3
"""v16.9 · Oficina casi en vivo: estado por actividad reciente (solo marcas de tiempo). Sin IA, stdlib."""
import json,os,sqlite3,time,hashlib,fcntl,subprocess,datetime,sys,urllib.request
B='/workspace/oficina-bots';F=f'{B}/public/estado.json';ML=f'{B}/mando-local'
BASE=f'{ML}/estado-base.json';ULT=f'{ML}/estado-vivo.ultimo';LOG=f'{ML}/estado-vivo.log';LOCK=f'{ML}/estado.lock'
DB='file:/home/box/agent-data/search-index.db?mode=ro';VENT=10*60*1000
TZ=datetime.timezone(datetime.timedelta(hours=-6))
MAP={'e2903041':'ted','60f97de3':'tadeo','83adc556':'mateo','276c99d2':'julian','2927051e':'ines','fb47c498':'vale','d53bedc7':'rulo','a87312c5':'emiliano','4c6a2028':'luna','5b967cf9':'libro','725791b6':'apps','7abdf69b':'ceo','6cb78d87':'tr-editor','c945be0f':'tr-cm','dd3a26cf':'director','b3eb69a1':'luca'}
NUEVOS={'luca':{'id':'luca','nombre':'Luca','area':'Técnico digital','estado':'pausa','frase':'Descansando'}}
PRIV={'julian','emiliano','ines'};GEN={'trabajando':'Trabajando','esperando':'Esperando respuesta','pausa':'Descansando'}
NO_GEN=('café','sillón','descans','pausa','esperando')  # frases de pausa: no sirven para "trabajando"
def log(m):
  if os.path.exists(LOG) and os.path.getsize(LOG)>100_000:os.replace(LOG,LOG+'.1')
  with open(LOG,'a') as f:f.write(datetime.datetime.now(TZ).strftime('%Y-%m-%d %H:%M ')+m+'\n')
def generica(fr):return bool(fr) and len(fr)<=30 and len(fr.split())<=4 and not any(x in fr.lower() for x in NO_GEN) and not any(c.isdigit() for c in fr)
def h(b):return hashlib.sha256(b).hexdigest()
# v16.14: avisos ntfy (>24 h esperando). Tema en .ntfy-tema (privado). Uno por bot+esperando_desde.
TEMA=f'{B}/.ntfy-tema';ENV=f'{B}/.ntfy-enviados.json'
sys.path.insert(0,B);import ntfy_oficina
def ntfy(txt):return ntfy_oficina.enviar(txt)
def avisos(bots):
  try:
    if not os.path.exists(TEMA):return
    env=json.load(open(ENV)) if os.path.exists(ENV) else {}
    ahora=datetime.datetime.now(TZ)
    for b in bots:
      d=b.get('esperando_desde')
      if b.get('estado')!='esperando' or not d:continue
      k=b['id']+'|'+d
      if k in env:continue
      hrs=int((ahora-datetime.datetime.fromisoformat(d)).total_seconds()//3600)
      if hrs<24:continue
      try:st=ntfy(f"{b.get('nombre',b['id'])} te espera desde hace {hrs} h")
      except Exception as e:log('ntfy error '+type(e).__name__);continue
      env[k]=ahora.isoformat(timespec='seconds');log(f'ntfy aviso {b["id"]} {hrs} h rc={st}')
      tmp=ENV+'.tmp';open(tmp,'w').write(json.dumps(env));os.chmod(tmp,0o600);os.replace(tmp,ENV)
  except Exception as e:log('ntfy fallo '+type(e).__name__+': '+str(e)[:100])
# v16.16: racha (días seguidos en que "Te esperan" llegó a cero al menos una vez) y salud genérica
RACHA=f'{ML}/racha.json';LATIDO=30*60
def racha(n_esperan):
  try:r=json.load(open(RACHA))
  except Exception:
    r={'dias':{}}
    try:  # siembra con el historial del recolector (estados por corrida)
      for l in open(f'{ML}/historial.jsonl'):
        x=json.loads(l)
        if not any(v=='esperando' for v in x['e'].values()):r['dias'][x['t'][:10]]=1
    except Exception:pass
  hoy=datetime.datetime.now(TZ).date()
  if n_esperan==0 and not r['dias'].get(hoy.isoformat()):r['dias'][hoy.isoformat()]=1
  r['dias']={k:v for k,v in r['dias'].items() if k>=(hoy-datetime.timedelta(days=400)).isoformat()}
  tmp=RACHA+'.tmp';open(tmp,'w').write(json.dumps(r));os.replace(tmp,RACHA)
  d=hoy if r['dias'].get(hoy.isoformat()) else hoy-datetime.timedelta(days=1);n=0
  while r['dias'].get(d.isoformat()):n+=1;d-=datetime.timedelta(days=1)
  return {'dias':n,'hoy_cero':bool(r['dias'].get(hoy.isoformat()))}
def salud():
  iso=lambda t:datetime.datetime.fromtimestamp(t,TZ).isoformat(timespec='seconds')
  s={'latido':datetime.datetime.now(TZ).isoformat(timespec='seconds')}
  try:s['mando']=iso(os.path.getmtime(f'{ML}/mando.enc'))
  except Exception:s['mando']=None
  try:n=json.load(open(f'{B}/.ntfy-salud.json'));s['avisos_ok']=n.get('ok');s['avisos_error']=n.get('error')
  except Exception:s['avisos_ok']=s['avisos_error']=None
  s['avisos_config']=os.path.exists(TEMA)
  return s
def corrida():
  ahora=int(time.time()*1000)
  db=sqlite3.connect(DB,uri=True)
  act={MAP[a[:8]]:t for a,t in db.execute('select agent_id,max(timestamp_ms) from messages group by agent_id') if a[:8] in MAP}
  # v16.8: solo horas y rol (nunca body). Rob = role 'user' en el chat principal (in_main_chat=1).
  rob={MAP[a[:8]]:t for a,t in db.execute("select agent_id,max(timestamp_ms) from messages where role='user' and in_main_chat=1 group by agent_id") if a[:8] in MAP}
  # v16.12: último mensaje del bot EN EL CHAT PRINCIPAL (ms exactos)
  bot={MAP[a[:8]]:t for a,t in db.execute("select agent_id,max(timestamp_ms) from messages where role='assistant' and in_main_chat=1 group by agent_id") if a[:8] in MAP}
  maxidx=db.execute('select max(timestamp_ms) from messages').fetchone()[0] or 0
  ulr={};ultt={}
  for a,r,t in db.execute("select m.agent_id,m.role,m.timestamp_ms from messages m join (select agent_id,max(timestamp_ms) t from messages where in_main_chat=1 group by agent_id) x on m.agent_id=x.agent_id and m.timestamp_ms=x.t where m.in_main_chat=1"):
    if a[:8] in MAP:ulr[MAP[a[:8]]]=r;ultt[MAP[a[:8]]]=t
  db.close()
  with open(LOCK,'w') as lk:
    fcntl.flock(lk,fcntl.LOCK_EX)
    raw=open(F,'rb').read();cur=json.loads(raw)
    ult=open(ULT).read().strip() if os.path.exists(ULT) else ''
    if h(raw)!=ult or not os.path.exists(BASE):open(BASE,'wb').write(raw);log('base nueva (escribió otra rutina)')
    bj=json.load(open(BASE));base={b['id']:b for b in bj['bots']}
    try:tgen=int(datetime.datetime.fromisoformat(bj.get('actualizado')).timestamp()*1000)
    except Exception:tgen=int(os.path.getmtime(BASE)*1000)
    bots=[dict(b) for b in cur['bots']]
    ids={b['id'] for b in bots}
    for k,v in NUEVOS.items():
      if k not in ids:bots.append(dict(v))
    for b in bots:
      bb=base.get(b['id'],{});b.pop('esperando_desde',None)
      if bb.get('estado')=='esperando':
        tm=tgen
        for k in ('esperando_desde','desde','marcado'):
          try:tm=int(datetime.datetime.fromisoformat(bb[k]).timestamp()*1000);break
          except Exception:pass
        # v16.12: resuelto SOLO si Rob escribió (chat principal) después del último mensaje del bot.
        # Antes: esperando_desde se guardaba truncado a minutos y el propio mensaje del bot (segundos después) lo "resolvía".
        ref=max(tm,bot.get(b['id'],0))
        resuelto=rob.get(b['id'],0)>ref
        if not resuelto and ulr.get(b['id'])=='assistant':
          b['estado']='esperando';b['frase']=bb.get('frase') or 'Esperando OK';b['esperando_desde']=datetime.datetime.fromtimestamp(ultt[b['id']]/1000,TZ).isoformat(timespec='milliseconds');continue
      viva=ahora-act.get(b['id'],0)<VENT
      fb=base.get(b['id'],{}).get('frase')
      b['estado']='trabajando' if viva else 'pausa'
      b['frase']=(fb if generica(fb) else 'Trabajando') if viva else 'Descansando'
    # v16.13: Jurídico, salud y finanzas: en público SOLO estado/punto (frase genérica, sin tareas ni textos)
    for b in bots:
      for k in [k for k in b if k not in ('id','nombre','area','estado','frase','esperando_desde')]:b.pop(k)
      if b['id'] in PRIV:b['frase']=GEN.get(b['estado'],'')
    nuevo=dict(cur);nuevo['bots']=bots
    avisos(bots)
    nuevo['racha']=racha(sum(b['estado']=='esperando' for b in bots));sv=salud()
    try:viejo=time.time()-datetime.datetime.fromisoformat(cur.get('salud',{}).get('latido')).timestamp()>LATIDO
    except Exception:viejo=True
    cambio_s=viejo or nuevo['racha']!=cur.get('racha') or {k:v for k,v in sv.items() if k!='latido'}!={k:v for k,v in cur.get('salud',{}).items() if k!='latido'}
    nuevo['salud']=sv if cambio_s else cur.get('salud')
    if not cambio_s and [ (b['id'],b['estado'],b['frase'],b.get('esperando_desde')) for b in bots]==[(b['id'],b['estado'],b.get('frase'),b.get('esperando_desde')) for b in cur['bots']]:
      log(f"sin cambios ({sum(b['estado']=='trabajando' for b in bots)} trabajando · índice al {datetime.datetime.fromtimestamp(maxidx/1000,TZ).strftime('%d %H:%M')})");return
    if [(b['id'],b['estado'],b['frase'],b.get('esperando_desde')) for b in bots]!=[(b['id'],b['estado'],b.get('frase'),b.get('esperando_desde')) for b in cur['bots']] or 'actualizado' not in cur:
      nuevo['actualizado']=datetime.datetime.now(TZ).isoformat(timespec='seconds')
    out=json.dumps(nuevo,ensure_ascii=False,indent=1).encode()
    open(F+'.tmp','wb').write(out);os.replace(F+'.tmp',F);open(ULT,'w').write(h(out))
  n=sum(b['estado']=='trabajando' for b in bots)
  r=subprocess.run(['bash',f'{B}/publicar-estado.sh'],capture_output=True,text=True)
  log(f"cambió: {n} trabajando · publicar rc={r.returncode} {r.stdout.strip()[-60:]} {r.stderr.strip()[-120:]}")
if __name__=='__main__':
  while True:
    try:corrida();ntfy_oficina.ok('estado-vivo.py')
    except Exception as e:log('ERROR '+type(e).__name__+': '+str(e)[:200]);ntfy_oficina.fallo('estado-vivo.py',type(e).__name__)
    if '--una' in sys.argv:break
    time.sleep(300)
