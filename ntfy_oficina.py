"""v16.15: avisos ntfy compartidos. Tema privado en .ntfy-tema. Sin datos confidenciales en el texto."""
import os,json,datetime,urllib.request
B='/workspace/oficina-bots';TEMA=f'{B}/.ntfy-tema';FALLOS=f'{B}/.ntfy-fallos.json'
SALUD=f'{B}/.ntfy-salud.json'  # v16.16: último envío ok / error (solo horas, sin tema)
def _salud(k):
  try:
    d=json.load(open(SALUD)) if os.path.exists(SALUD) else {}
    d[k]=datetime.datetime.now().astimezone().isoformat(timespec='seconds');t=SALUD+'.tmp';open(t,'w').write(json.dumps(d));os.chmod(t,0o600);os.replace(t,SALUD)
  except Exception:pass
def enviar(txt,tags='hourglass'):
  tema=open(TEMA).read().strip()
  r=urllib.request.Request('https://ntfy.sh/'+tema,data=txt.encode(),method='POST',headers={'Title':'Oficina de bots','Click':'https://josegren2-hub.github.io/Oficina-bots/','Tags':tags})
  try:
    with urllib.request.urlopen(r,timeout=15) as x:st=x.status
  except Exception:_salud('error');raise
  _salud('ok' if 200<=st<300 else 'error');return st
def _guarda(d):
  t=FALLOS+'.tmp';open(t,'w').write(json.dumps(d));os.chmod(t,0o600);os.replace(t,FALLOS)
def fallo(script,tipo):
  """Avisa UNA vez por script+tipo de fallo; se rearma cuando el script vuelve a correr bien (ok())."""
  try:
    d=json.load(open(FALLOS)) if os.path.exists(FALLOS) else {}
    k=f'{script}|{tipo}'
    if k in d:return None
    st=enviar(f'Falla en {script}: {tipo}',tags='warning')
    d[k]=datetime.datetime.now().isoformat(timespec='seconds');_guarda(d);return st
  except Exception:return None
def ok(script):
  try:
    if not os.path.exists(FALLOS):return
    d=json.load(open(FALLOS));n={k:v for k,v in d.items() if not k.startswith(script+'|')}
    if n!=d:_guarda(n)
  except Exception:pass
