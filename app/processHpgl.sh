#!/bin/bash

speed=10
paperSize="a3"
if [ $# -eq 0 ]; then
  suffix=""
  colorBool=false
elif [ $# -eq 1 ]; then
  suffix="$1"
  colorBool=false
elif [ $# -eq 2 ]; then
  suffix="$1"
  colorBool=true
elif [ $# -eq 3 ]; then
  suffix="$1"
  colorBool=true
  paperSize="a4 --landscape"
else
  echo "Usage: $0 [suffix]"
  exit 1
fi

file_name=$(basename ${1})
name=$(echo "$file_name" | cut -f 1 -d '.')

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
DEST_DIR="/Users/adrienrobert/gitrepo/ART/GCODE"


if [ "$colorBool" = true ]; then
  vpype read $1 forlayer write ${DEST_DIR}/subFiles/"_%_name%.svg" end

  FILES="${DEST_DIR}/subFiles/*"
  for f in $FILES
  do
    subFile=$(basename ${f})
    subFileName=$(echo "$subFile" | cut -f 1 -d '.')
    # take action on each file. $f store current file name
    echo "Processing $f file to $DEST_DIR/$name$subFileName.hpgl..."
    if [ "$paperSize" = "a4 --landscape" ]; then
      vpype read $f pagerotate write $f
    fi 
    # vpype read $f write --device hp7475a --page-size $paperSize $DEST_DIR/$name$subFileName.hpgl
    vpype read $f write --absolute --device vevor --page-size a1 $DEST_DIR/$name$subFileName.hpgl
    sed -i -e 's/SP1;/SP1;VS'"$speed"';/g' $DEST_DIR/$name$subFileName.hpgl
    sed -i -e 's/SP2;/SP2;VS'"$speed"';/g' $DEST_DIR/$name$subFileName.hpgl
    rm $DEST_DIR/$name$subFileName.hpgl-e
    # echo -e "VS8;\n$(cat $DEST_DIR/$name$subFileName.hpgl)" > $DEST_DIR/$name$subFileName.hpgl
  done
  rm $FILES
  exit 0
else
  # vpype read $1 write --device hp7475a --page-size $paperSize $DEST_DIR/$name.hpgl
  vpype read $1 write --absolute --device vevor --page-size a1 $DEST_DIR/$name.hpgl
  sed -i -e 's/SP1;/SP1;VS'"$speed"';/g' $DEST_DIR/$name.hpgl
  rm $DEST_DIR/$name.hpgl-e
  # echo -e "VS8;\n$(cat $DEST_DIR/$name.hpgl)" > $DEST_DIR/$name.hpgl
  exit 0
fi

