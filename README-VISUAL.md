# Oficina de los bots — guía para agentes de DISEÑO VISUAL

Esta rama (`fuente`) contiene el código fuente del sitio. **Solo se acepta trabajo de diseño visual.**
Las funciones (datos, estado, mando, tareas, publicación) son de **Tadeo** y no se modifican.

## Instalar, compilar y ver en local
```bash
npm i
npm run build              # genera dist/
npx vite preview --port 4317   # o: npx vite (modo desarrollo)
```
Abre http://localhost:4317/. Sin `estado.json` real el sitio se ve con datos vacíos o de ejemplo;
eso es normal (los datos vivos NO están en este repositorio).

## Qué es VISUAL (sí puedes cambiarlo)
- `src/estilo.css` y los bloques `<style>` de diseño en `index.html` (colores, tipografía, layout de paneles y botones).
- `src/v17b.js` — **solo** la parte visual: escena 3D, cámara, luces, materiales, fachada, avatares
  (`geoAv`, colores `COLB`, expresiones `CARAS`, animación `pasoAv`), etiquetas y pines.
- `src/v17d.js` — acomodo de botones/paneles (fila `#v17fila`, panel Equipo). No cambies el manejo del historial (botón Atrás) ni la regla "un panel a la vez" salvo para mejorarlas visualmente.
- `src/personitas.js`, `personitas.html` — figuras.
- `public/v17b/` (GLB por piso y lightmaps `*-dia.webp`/`*-noche.webp`), `public/tex/`, `public/hdri/`, `public/modelos/`, íconos.
- `propuesta-v17/3d/` — escena Blender (`escena.py`, `escena_web.py`), horneado (`runbake.sh`, `instalar-lm.sh`), texturas.

## Qué es FUNCIONAL (NO tocar)
- Lectura/sondeo de estado y su esquema (`estado.json`, ver `ESTADO-FORMATO.md`), `window.__datos`, `ek()` y la lógica de "Te espera".
- `src/mando.js` (cifrado del Centro de mando, clave, `mando.enc`), tareas (`tareas.enc`), `src/lista.js`, `src/entrada.js`, `src/v1613.js`, `src/v1615.js`, `src/v1616.js`.
- `public/sw.js` (lógica del service worker; solo Tadeo cambia el nombre de caché al publicar).
- Scripts de estado vivo y publicación (no están en esta rama).
- Esquemas de datos, rutas de archivos, `vite.config.js`, `package.json`.

Si un cambio visual necesita un dato nuevo, **pídelo a Tadeo**; no lo inventes ni lo leas por tu cuenta.

## Reglas
1. Trabaja en una rama propia y abre un **Pull Request hacia `fuente`**. **Nunca publiques en `gh-pages`.** Tadeo revisa, prueba y publica.
2. Reproduce **exactamente** las referencias de Rob (forma, colores, distribución, proporciones). Si algo no se puede igualar, dilo en el PR.
3. **Nunca muestres el nombre real ni la foto de Rob** en el sitio, capturas públicas o el repositorio.
4. No agregues datos privados, tokens, claves, `estado.json`, `mando.enc`, `tareas.enc`, `privado/`, `mando-local/`, `.ntfy*` ni videos pesados (ver `.gitignore`).
5. Incluye en el PR capturas en celular (360–430 px) y escritorio (1024–1440 px) de las vistas Apilada, Piso y Fachada.
