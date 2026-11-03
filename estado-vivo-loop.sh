#!/usr/bin/env bash
# Watchdog: relanza estado-vivo.py si cae. Pidfile evita duplicados.
cd /workspace/oficina-bots
PF=mando-local/estado-vivo.pid
if [ -f $PF ] && kill -0 "$(cat $PF)" 2>/dev/null; then echo "ya corre (PID $(cat $PF))"; exit 0; fi
echo $$ > $PF
while true; do python3 estado-vivo.py >>mando-local/estado-vivo.log 2>&1; echo "$(date '+%F %R') estado-vivo cayó, relanzo en 30s" >> mando-local/estado-vivo.log; sleep 30; done
