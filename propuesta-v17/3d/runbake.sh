cd /workspace/oficina-bots/propuesta-v17/3d/bake
for f in PB P2 P3 P4 P5; do BAKE=$PWD RES=2048 SMP=96 nice -n 5 /opt/bl/blender-4.2.3-linux-x64/blender -b -noaudio -P ../escena_web.py -- $f 1 /tmp/x.png 2>&1 | grep -E "FACES|BAKED|Error" ; echo done $f $(date +%T); done; echo ALLDONE
