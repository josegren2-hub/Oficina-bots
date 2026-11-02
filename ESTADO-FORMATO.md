# Formato de `public/estado.json`

La web lo vuelve a leer cada 60 s. Un bot puede reescribirlo cada hora (en el build ya publicado: `dist/estado.json`).

```json
{"actualizado":"2026-11-01T20:00:00-06:00",
 "bots":[{"id":"ted","nombre":"Ted","area":"Asistente personal","estado":"trabajando","frase":"Organizando agenda"}]}
```

- `actualizado`: fecha ISO 8601 con zona horaria.
- `id`: fijo, en minúsculas; coincide con `public/avatares/<id>.png` (si no hay imagen se usan iniciales). Ids actuales: ted, tadeo, mateo, julian, ines, vale, rulo, emiliano, luna, libro, apps, ceo, tr-editor, tr-cm, director.
- `estado`: solo `trabajando` (sentado tecleando), `esperando` (de pie junto al escritorio) o `pausa` (zona de café). Otro valor se toma como `esperando`.
- `frase`: 2–4 palabras, máximo ~25 caracteres.

## Privacidad (la URL será pública)
Solo frases GENÉRICAS: "Revisando diseño", "Escribiendo nota", "Programando", "Tomando un café".
Prohibido: pendientes concretos, nombres de casos o expedientes (PJF), salud, finanzas, montos, clientes, personas, correos, teléfonos y el nombre completo del dueño.
Si dudas, usa "Trabajando" o "Pensando ideas".

## v2: campo opcional `piso`
`"piso": 0|1|2` (0 Personal, 1 Creativos, 2 Tinta Rosa). Si se omite, se usa el reparto fijo del código. Máximo 6 bots por piso.
