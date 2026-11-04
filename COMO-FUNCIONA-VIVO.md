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

## v16.14 (3 nov 2026)
- **Avisos ntfy**: tema privado en `.ntfy-tema` (chmod 600; en .gitignore; nunca en dist, estado.json ni repo). `estado-vivo.py` envía UN aviso por bot+`esperando_desde` cuando la espera pasa de 24 h: POST https://ntfy.sh/<tema>, texto "<Nombre> te espera desde hace N h", Title "Oficina de bots", Click a la oficina, Tags hourglass. Registro en `.ntfy-enviados.json` (600). Los errores de red solo se anotan en el log.
- **Audiencias de mañana**: Ted deja `privado/audiencias-manana.json` (carpeta 700, fuera de dist/repo) con {fecha, generado, audiencias:[{hora,titulo,lugar,notas}]}. `recolectar-mando.py` lo mete SOLO cifrado en mando.enc (`audiencias.items`, ordenado por hora). Si falta o la fecha no es mañana: "Sin datos de mañana". El tablero muestra hora, título, 📍lugar y notas. NO sobrescribir ese archivo en pruebas; usar otro.
- SW oficina-v16-14. Verificación: `captura-v1614-aud.mjs`.

## v16.15 (3 nov 2026)
- `ntfy_oficina.py`: enviar(), fallo(script,tipo) (un aviso por script+tipo de excepción; registro `.ntfy-fallos.json`, se rearma cuando el script vuelve a correr bien), ok(script). Lo usan estado-vivo.py (excepción en corrida) y recolectar-mando.py (excepthook).
- `recolectar-mando.py` (todo cifrado): `bots.ted.rutina` {ultima, fallo, no_corrio>26 h} desde supervisor/registro-rutinas.csv (ÚNICA fuente fiable de rutinas en el box; las demás rutinas no tienen bitácora); `bots[].callado` si ≥ DIAS_CALLADO=3 días sin actividad y con pendientes; `semanal` {esta, anterior: esperas_resueltas, respuesta_promedio_min, mas_atorado, mensajes} solo metadatos, historial en `mando-local/semanal.jsonl`.
- Frontend (`src/v1615.js` + cambios en v1613.js): punto rojo sobre el bot y entrada en "Te esperan" si la rutina falló o no corrió; punto morado + etiqueta "callado"; letrero ⚠️ si estado.json >30 min o mando >24 h; atajos del manifest `?abrir=esperan|resumen|mando` (y `buscar`); 🔎 Buscar con filtro por departamento (la cámara vuela al área); posponer espera 3 h / hasta mañana 8:00 (localStorage `v15pos`, también la quita de avisos locales); "▶ Siguiente pendiente"; nota privada por bot (localStorage `v15notas`, nunca sale del dispositivo); "📈 Resumen semanal" en el tablero.
- SW oficina-v16-15. Publicación: se suben a gh-pages los archivos de dist/ cuyo blob SHA difiere (estado.json lo maneja el loop). Verificación: `node captura-v1615.mjs` (URL=... opcional) → capturas/v16-15/.

## v16.16 (4 nov 2026)
- **Entrada** `src/entrada.js`: si `?abrir=lista` o localStorage `oficinaVista=lista` → `import('./lista.js')` (NO descarga Three.js ni modelos); si no → `import('./main.js')` (3D). `?abrir=3d` vuelve al 3D. Botón "☰ Lista" / "🏢 3D" en la barra superior guarda la preferencia. Atajo del manifest "Solo lista".
- **`src/lista.js`** (modo Solo lista): bots por departamento con estado, frase, contadores filtrables, tarjeta (extraFicha + fichaMando), Te esperan, Resumen, Buscar, Centro de mando, salud y racha. Lee estado.json cada 60 s.
- **`src/v1616.js`** (sin Three.js, sirve a ambos modos):
  - Respuestas rápidas OK / Luego / No (en "Te esperan", la tarjeta y la lista; solo con clave porque el id del chat viene cifrado en mando): copian "OK, adelante" / "Lo veo más tarde" / "No, gracias", aviso "Copiado, pégalo en el chat" y abren `grokbot://app/v1/agent?id=…` a los 2.5 s. No hay enlace confirmado que precargue texto, por eso se usa el portapapeles (mando.js acepta `data-toast`).
  - Línea de tiempo de hoy (Resumen): 24 cuadros por bot, verde según mensajes por hora. Dato `bots[].horas_hoy` (solo timestamp_ms) que añade `recolectar-mando.py`, SOLO cifrado.
  - Luz de salud (barra superior): verde/amarilla/roja con explicación al tocar. Estados: última señal (max de `actualizado` y `salud.latido`) <50 min verde, <2 h amarilla; mando (`salud.mando` = mtime de mando-local/mando.enc o `MANDO.generado`) <14 h verde, <26 h amarilla; avisos ntfy: amarilla si el último envío falló después del último ok.
  - Racha "🔥 N": días seguidos en que "Te esperan" llegó a cero al menos una vez.
- **estado-vivo.py**: publica en estado.json `racha` {dias, hoy_cero} (historial en `mando-local/racha.json`, sembrado desde historial.jsonl) y `salud` {latido, mando, avisos_ok, avisos_error, avisos_config} (solo horas; nunca el tema). Late (republica) cada 30 min aunque no cambien estados; `actualizado` solo cambia cuando cambian los bots. El letrero ⚠️ de v16.15 ahora usa también el latido (umbral 45 min).
- **ntfy_oficina.py**: cada envío anota hora de ok/error en `.ntfy-salud.json` (600, ignorado por git).
- **main.js**: en modo Auto la luz sigue la hora real de Chihuahua (7 h mañana cálida y clara → 11–15 h neutra → 17:30–19 h dorada → noche = modo noche existente), interpolada cada minuto, sin sombras nuevas; `window.__luz()` para pruebas. Objeto low-poly por bot en su escritorio (cámara de video, mazo, revista, pluma roja, cámara de fotos+paleta, laptop, portapapeles, bola de cristal, celular, mancuerna, calculadora, maletín, celular con apps, libro, micrófono, llave), combinados por material (sin draw calls extra).
- SW oficina-v16-16. Verificación: `node captura-v1616.mjs` (URL=… opcional; por defecto copia local en 127.0.0.1:4181 con mando.enc) → capturas/v16-16/.
