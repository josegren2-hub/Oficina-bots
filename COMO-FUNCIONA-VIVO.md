# Oficina casi en vivo (v16.8)
- `estado-vivo.py`: cada 5 min lee SOLO `timestamp_ms`/`agent_id` de `search-index.db` (modo solo lectura, nunca el contenido). Actividad <10 min = `trabajando`, si no `pausa` con frase "Descansando". Si trabaja, usa la frase genérica que dejó la rutina de Ted (copia en `mando-local/estado-base.json`), si no "Trabajando". Publica con `publicar-estado.sh` solo si cambió algo.
- Coordinación con la rutina de Ted (9/14/20 h): si estado.json cambió por fuera (hash distinto al último que escribió el vivo), se toma como nueva base. Escritura atómica (tmp + rename) bajo `flock` en `mando-local/estado.lock`.
- Log: `mando-local/estado-vivo.log` (rota a .1 al pasar 100 KB).
- Watchdog: `estado-vivo-loop.sh` (relanza si cae; pidfile `mando-local/estado-vivo.pid` evita duplicados).
## Relanzar (p. ej. tras reiniciar el box; no hay crontab en el box)
    cd /workspace/oficina-bots && setsid nohup ./estado-vivo-loop.sh >/dev/null 2>&1 < /dev/null &
Requiere `GITHUB_TOKEN_OFICINA` en el entorno. Ver estado: `tail mando-local/estado-vivo.log`.
## Detener
    kill $(cat mando-local/estado-vivo.pid); pkill -f estado-vivo.py
## v16.8: limpieza de `esperando`
Para cada bot que la base (rutina de Ted) marcó `esperando`, se toma la hora de marca (`esperando_desde`/`desde` por bot si existe; si no, `actualizado` de la base). Si después de esa hora hay mensaje de Rob (`role='user'`, `in_main_chat=1`) o actividad del bot (`role='assistant'`), se recalcula como cualquier otro: `trabajando` (actividad <10 min) o `pausa` "Descansando". `esperando` solo se conserva si nada pasó después y el último mensaje del chat principal es del bot. Solo se leen `agent_id`, `role`, `in_main_chat`, `timestamp_ms`; nunca `body`.

## v16.9 (2 nov 2026)
- Ficha, listas y contadores: el punto/etiqueta "Te espera" sale SOLO de `estado.json` en vivo (`estado: esperando`). El mando cifrado ya no marca "Te espera" por su cuenta; si el vivo no marca esperando, el bloque Pendiente muestra "✅ Resuelto" y no se ofrecen botones de autorizar.
- `estado-vivo.py` escribe `esperando_desde` (hora del último mensaje del bot en el chat principal) por cada bot en espera.
- `recolectar-mando.py`: aplica la misma regla (solo horas/rol, nunca body). Si el bot no está esperando, vacía `ok` y marca `resuelto`; si Rob escribió después del reporte del supervisor, descarta pendientes viejos (`pendientes_descartados`). Se corrigió `NR` no definido (el script fallaba).
- Planta abierta (mismo tamaño): mamparas bajas (1.1 m) con pasos amplios en lugar de muros; sin recepción (pasillo abierto entre Personal y Proyectos). Personajes: máx. 3 en el café, el resto va a puntos libres del pasillo; evasión de 0.6 m al caminar.

## v16.10
- Se quitaron todas las mamparas/divisiones interiores; solo quedan paredes exteriores y el despacho de cristal de Mateo. Áreas por color de piso, tapetes grandes por área y letreros en el piso.

## v16.11
- Se restauró la distribución, las paredes, la recepción, los letreros y la escenografía de v16.8.
- Se conserva el estado en vivo con ✅ Resuelto. El café admite un máximo de 3; el resto va a lugares únicos del pasillo y a la sala de recepción.
- Separación lateral solo entre bots que caminan; no se aplica cerca del punto de paso, así que nadie se traba.
- dt limitado a 0.2 en lugar de 0.05 para que caminen aunque el FPS sea bajo.
- Aviso "Hay versión nueva · Actualizar" y botón ↻ Actualizar. sw.js usa la caché oficina-v16-11 con navegación en modo network-first / no-store.
