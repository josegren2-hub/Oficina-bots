#!/usr/bin/env python3
"""v16.8 · Oficina casi en vivo: estado por actividad reciente (solo marcas de tiempo). Sin IA, stdlib."""
import json,os,sqlite3,time,hashlib,fcntl,subprocess,datetime,sys
B='/workspace/oficina-bots';F=f'{B}/public/estado.json';ML=f'{B}/mando-local'
BASE=f'{ML}/estado-base.json';ULT=f'{ML}/estado-vivo.ultimo';LOG=f'{ML}/estado-vivo.log';LOCK=f'{ML}/estado.lock'
DB='file:/home/box/agent-data/search-index.db?mode=ro';VENT=10*60*1000
TZ=datetime.timezone(datetime.timedelta(hours=-6))
MAP={'e2903041':'ted','60f97de3':'tadeo','83adc556':'mateo','276c99d2':'julian','2927051e':'ines','fb47c498':'vale','d53bedc7':'rulo','a87312c5':'emiliano','4c6a2028':'luna','5b967cf9':'libro','725791b6':'apps','7abdf69b':'ceo','6cb78d87':'tr-editor','c945be0f':'tr-cm','dd3a26cf':'director','b3eb69a1':'luca'}
NUEVOS={'luca':{'id':'luca','nombre':'Luca','area':'Técnico digital','estado':'pausa','frase':'Descansando'}}
NO_GEN=('café','sillón','descans','pausa','esperando')  # frases de pausa: no sirven para "trabajando"
def log(m):
  if os.path.exists(LOG) and os.path.getsize(LOG)>100_000:os.replace(LOG,LOG+'.1')
  with open(LOG,'a') as f:f.write(datetime.datetime.now(TZ).strftime('%Y-%m-%d %H:%M ')+m+'\n')
def generica(fr):return bool(fr) and len(fr)<=30 and len(fr.split())<=4 and not any(x in fr.lower() for x in NO_GEN) and not any(c.isdigit() for c in fr)
def h(b):return hashlib.sha256(b).hexdigest()
def corrida():
  ahora=int(time.time()*1000)
  db=sqlite3.connect(DB,uri=True)
  act={MAP[a[:8]]:t for a,t in db.execute('select agent_id,max(timestamp_ms) from messages group by agent_id') if a[:8] in MAP}
  # v16.8: solo horas y rol (nunca body). Rob = role 'user' en el chat principal (in_main_chat=1).
  rob={MAP[a[:8]]:t for a,t in db.execute("select agent_id,max(timestamp_ms) from messages where role='user' and in_main_chat=1 group by agent_id") if a[:8] in MAP}
  bot={MAP[a[:8]]:t for a,t in db.execute("select agent_id,max(timestamp_ms) from messages where role='assistant' group by agent_id") if a[:8] in MAP}
  ulr={}
  for a,r,t in db.execute("select m.agent_id,m.role,m.timestamp_ms from messages m join (select agent_id,max(timestamp_ms) t from messages where in_main_chat=1 group by agent_id) x on m.agent_id=x.agent_id and m.timestamp_ms=x.t where m.in_main_chat=1"):
    if a[:8] in MAP:ulr[MAP[a[:8]]]=r
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
      bb=base.get(b['id'],{})
      if bb.get('estado')=='esperando':
        tm=tgen
        for k in ('esperando_desde','desde','marcado'):
          try:tm=int(datetime.datetime.fromisoformat(bb[k]).timestamp()*1000);break
          except Exception:pass
        resuelto=rob.get(b['id'],0)>tm or bot.get(b['id'],0)>tm
        if not resuelto and ulr.get(b['id'])=='assistant':
          b['estado']='esperando';b['frase']=bb.get('frase') or 'Esperando OK';continue
      viva=ahora-act.get(b['id'],0)<VENT
      fb=base.get(b['id'],{}).get('frase')
      b['estado']='trabajando' if viva else 'pausa'
      b['frase']=(fb if generica(fb) else 'Trabajando') if viva else 'Descansando'
    nuevo=dict(cur);nuevo['bots']=bots
    if [ (b['id'],b['estado'],b['frase']) for b in bots]==[(b['id'],b['estado'],b.get('frase')) for b in cur['bots']]:
      log(f"sin cambios ({sum(b['estado']=='trabajando' for b in bots)} trabajando)");return
    nuevo['actualizado']=datetime.datetime.now(TZ).isoformat(timespec='seconds')
    out=json.dumps(nuevo,ensure_ascii=False,indent=1).encode()
    open(F+'.tmp','wb').write(out);os.replace(F+'.tmp',F);open(ULT,'w').write(h(out))
  n=sum(b['estado']=='trabajando' for b in bots)
  r=subprocess.run(['bash',f'{B}/publicar-estado.sh'],capture_output=True,text=True)
  log(f"cambió: {n} trabajando · publicar rc={r.returncode} {r.stdout.strip()[-60:]} {r.stderr.strip()[-120:]}")
if __name__=='__main__':
  while True:
    try:corrida()
    except Exception as e:log('ERROR '+type(e).__name__+': '+str(e)[:200])
    if '--una' in sys.argv:break
    time.sleep(300)
