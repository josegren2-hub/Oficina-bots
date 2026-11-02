#!/usr/bin/env bash
# Sube SOLO public/estado.json a josegren2-hub/Oficina-bots, rama gh-pages, ruta estado.json (Pages lo sirve directo).
# Requiere GITHUB_TOKEN_OFICINA (fine-grained, Contents: Read and write, solo ese repo). No imprime el token.
set -euo pipefail
F=/workspace/oficina-bots/public/estado.json; R=josegren2-hub/Oficina-bots; P=estado.json
: "${GITHUB_TOKEN_OFICINA:?Falta GITHUB_TOKEN_OFICINA}"
python3 -c "import json;json.load(open('$F'))"   # valida JSON
API=https://api.github.com/repos/$R/contents/$P
SHA=$(curl -fsS -H "Authorization: Bearer $GITHUB_TOKEN_OFICINA" "$API?ref=gh-pages" | python3 -c "import sys,json;print(json.load(sys.stdin)['sha'])" || true)
python3 - "$F" "$SHA" > /tmp/estado-put.json <<'PY'
import sys,json,base64;d={"message":"estado.json","branch":"gh-pages","content":base64.b64encode(open(sys.argv[1],'rb').read()).decode()}
if sys.argv[2]:d["sha"]=sys.argv[2]
print(json.dumps(d))
PY
curl -fsS -X PUT -H "Authorization: Bearer $GITHUB_TOKEN_OFICINA" -d @/tmp/estado-put.json "$API" >/dev/null && echo "estado.json publicado"
