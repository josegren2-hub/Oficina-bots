BL=/opt/bl/blender-4.2.3-linux-x64/blender
cd /workspace/oficina-bots/propuesta-v17/3d; mkdir -p raw2
for j in "stack 0 01-corte-dia" "stack 1 02-corte-noche" "grid 0 03-pisos-lado-a-lado" "PB 0 04-PB-cafeteria-personal" "P2 0 05-P1-juridico-finanzas" "P3 0 06-P2-proyectos-podcast" "P4 0 07-P3-tinta-rosa" "P5 0 08-P4-penthouse-ted" "P5ted 0 09-P4-oficina-ted-pizarron"; do set -- $j; $BL -b -noaudio -P escena_web.py -- $1 $2 raw2/$3.png 0 96 >/dev/null 2>&1; echo done $3; done
echo ALLDONE
