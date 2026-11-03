# Oficina casi en vivo (v16.7)
- `estado-vivo.py`: cada 5 min lee SOLO `timestamp_ms`/`agent_id` de `search-index.db` (modo solo lectura, nunca el contenido). Actividad <10 min = `trabajando`, si no `pausa` con frase "Descansando". Si trabaja, usa la frase genérica que dejó la rutina de Ted (copia en `mando-local/estado-base.json`), si no "Trabajando". Publica con `publicar-estado.sh` solo si cambió algo.
- Coordinación con la rutina de Ted (9/14/20 h): si estado.json cambió por fuera (hash distinto al último que escribió el vivo), se toma como nueva base. Escritura atómica (tmp + rename) bajo `flock` en `mando-local/estado.lock`.
- Log: `mando-local/estado-vivo.log` (rota a .1 al pasar 100 KB).
- Watchdog: `estado-vivo-loop.sh` (relanza si cae; pidfile `mando-local/estado-vivo.pid` evita duplicados).
## Relanzar (p. ej. tras reiniciar el box; no hay crontab en el box)
    cd /workspace/oficina-bots && setsid nohup ./estado-vivo-loop.sh >/dev/null 2>&1 < /dev/null &
Requiere `GITHUB_TOKEN_OFICINA` en el entorno. Ver estado: `tail mando-local/estado-vivo.log`.
## Detener
    kill $(cat mando-local/estado-vivo.pid); pkill -f estado-vivo.py
