#!/bin/bash

if [ $# -eq 0 ]; then
  suffix=""
elif [ $# -eq 1 ]; then
  suffix="_$1"
else
  echo "Usage: $0 [suffix]"
  exit 1
fi

current_date=$(date +%Y%m%d_%H%M)
new_file_name="save_${current_date}${suffix}"

cp sketch.js "saves/${new_file_name}.js"
cp template.js sketch.js

download_folder="$HOME/Downloads"
file_pattern="art_"

num_files=$(find "$download_folder" -maxdepth 1 -name "$file_pattern*" | wc -l)
mkdir "saves/${new_file_name}"
if [[ "$num_files" -gt 0 ]]; then
    mv "$download_folder/$file_pattern"* "saves/$new_file_name/" 2>/dev/null
    num_moved=$(ls -1 "saves/$new_file_name/"* | wc -l | awk '{print $1-1}')
    echo "Moved $num_moved files to $new_file_name"
else
    echo "No files found in $download_folder matching pattern $file_pattern"
fi
echo "New file path: $(realpath saves/${new_file_name}.js)"
