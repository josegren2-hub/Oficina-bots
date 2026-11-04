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

## v16.12 (3 nov 2026)
- Personajes caminan de verdad: cada bot tiene su escritorio (PUESTOS). trabajando → camina a SU silla y se sienta; esperando → de pie junto a su escritorio; pausa → cada 6–15 s elige otro lugar: café (máx. 3, 60 % de probabilidad si hay cupo), puntos del pasillo, sala de recepción o sillones (café y Proyectos). 45 % de las veces pasea por el pasillo antes de llegar. Nunca repite el mismo lugar seguido; los lugares se reservan (no se empalman).
- Rutas solo por puertas/pasillo (vía corredor z≈0 y waypoints por área), sin atravesar muros ni muebles.
- El avance al caminar usa dt real (hasta 1 s) para que se muevan aunque el FPS sea bajo; la animación Walking se ve al desplazarse.
- Prueba: `medir.mjs` (posiciones a t=0/10/20 s) y `captura-v1612.mjs` (capturas en capturas/v16-12/).
- SW: caché oficina-v16-12.
- estado-vivo.py: `esperando_desde` se guarda con milisegundos; el "esperando" se da por resuelto SOLO si hay mensaje de Rob (role user, in_main_chat=1) posterior al último mensaje del bot en el chat principal (antes se comparaba contra una hora truncada a minutos y el propio mensaje del bot lo resolvía). El log anota la marca más reciente del índice.
- Índice (search-index.db): no está congelado; se sincroniza de forma perezosa por agente (server_cursors). El 3 nov solo tenía mensajes nuevos de Ted, Mateo, Inés y Emiliano (último 14:38). No hay otra fuente fresca de metadatos: los store.db por agente (agents/*/store.db, tabla transcript_entries) tienen 2–3 entradas y mtime 09:14; /cursor/stores solo tiene canvases; /home/box/sand-data es el mismo directorio. Se sigue usando search-index.db.

## v16.13 (3 nov 2026)
- `src/v1613.js`: barra fija "Te esperan" (orden por `esperando_desde`, más antiguo primero), tarjeta ampliada (espera desde, tarea actual y "Abrir chat" → `grokbot://app/v1/agent?id=<id>` solo con clave), tablero "Resumen del día" y avisos locales (>24 h, Notification API vía SW, sin push de servidor; deduplicado en localStorage `v13avisos`).
- Áreas por departamento: Tinta Rosa, Personal, Jurídico y Finanzas, Proyectos. Muros v16.8 intactos; el escritorio de Rodrigo·Libro pasó a Proyectos (-13.3, 9).
- PWA: `manifest.webmanifest` (standalone + display_override fullscreen, íconos 192/512 + maskable, scope/start_url `/Oficina-bots/`), metas apple-mobile-web-app-*; SW `oficina-v16-13` con `notificationclick`.
- `estado-vivo.py`: el JSON público solo lleva id, nombre, area, estado, frase, esperando_desde. Para julian, ines, emiliano la frase es genérica (PRIV).
- `recolectar-mando.py`: `bots[].hoy` = {mensajes, de_rob, ultima}, solo de metadatos (timestamp_ms, role, in_main_chat). `audiencias` = sin_datos (no hay fuente confiable en el box); al conectar una, llenar `audiencias.items` [{hora, asunto, lugar}] y `estado:'ok'`.
- Verificación: `node captura-v1613.mjs` (URL=... opcional), capturas en `capturas/v16-13/`.
