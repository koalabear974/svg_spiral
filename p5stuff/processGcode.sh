#!/bin/bash

if [ $# -eq 0 ]; then
  suffix=""
  colorBool=false
elif [ $# -eq 1 ]; then
  suffix="$1"
  colorBool=false
elif [ $# -eq 2 ]; then
  suffix="$1"
  colorBool=true
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
    echo "Processing $f file to $DEST_DIR/$name$subFileName.gcode..."
    vpype read $f gwrite -p plotter_a3 $DEST_DIR/$name$subFileName.gcode
  done
  rm $FILES
  exit 0
else
 vpype read $1 gwrite -p plotter_a3 $DEST_DIR/$name.gcode
  exit 0
fi

