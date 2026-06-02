import argparse
import os
import ndjson
import svgwrite
import random
from pathlib import Path
import re

def parse_arguments():
    parser = argparse.ArgumentParser(description="Convert all QuickDraw .ndjson files in a folder to SVGs")
    parser.add_argument("--input_dir", required=True, help="Path to folder containing .ndjson files")
    parser.add_argument("--count", type=int, default=10, help="Number of drawings to export per category")
    parser.add_argument("--resolution", type=int, default=256, help="Width and height of SVG canvas in pixels")
    parser.add_argument("--output_dir", required=True, help="Folder to save SVG files into subfolders")
    return parser.parse_args()

def render_drawing_to_svg(drawing, filename, resolution=256):
    dwg = svgwrite.Drawing(filename, size=(resolution, resolution))
    for stroke in drawing:
        points = list(zip(stroke[0], stroke[1]))
        if len(points) > 1:
            path_data = "M " + " L ".join(f"{x},{y}" for x, y in points)
            dwg.add(dwg.path(d=path_data, stroke="white", fill="none", stroke_width=2))
    dwg.save()

def normalize_drawing(drawing, resolution):
    all_x = [x for stroke in drawing for x in stroke[0]]
    all_y = [y for stroke in drawing for y in stroke[1]]

    min_x, max_x = min(all_x), max(all_x)
    min_y, max_y = min(all_y), max(all_y)

    width = max_x - min_x
    height = max_y - min_y

    scale = min((resolution - 20) / width, (resolution - 20) / height)
    offset_x = (resolution - scale * width) / 2 - scale * min_x
    offset_y = (resolution - scale * height) / 2 - scale * min_y

    norm_drawing = []
    for stroke in drawing:
        norm_x = [(x * scale) + offset_x for x in stroke[0]]
        norm_y = [(y * scale) + offset_y for y in stroke[1]]
        norm_drawing.append([norm_x, norm_y])
    return norm_drawing

def extract_name_from_filename(filename):
    # Matches the last underscore-separated part before .ndjson
    match = re.search(r"full_simplified_(.+?)\.ndjson$", filename)
    if match:
        return match.group(1).strip()
    else:
        return None

def process_file(filepath, category_name, count, resolution, output_root):
    with open(filepath, "r") as f:
        data = ndjson.load(f)

    if count > len(data):
        count = len(data)

    sampled_items = random.sample(data, count)

    category_folder = Path(output_root) / category_name
    category_folder.mkdir(parents=True, exist_ok=True)

    for i, item in enumerate(sampled_items):
        drawing = normalize_drawing(item["drawing"], resolution)
        out_path = category_folder / f"{i+1}.svg"
        render_drawing_to_svg(drawing, out_path, resolution)

    print(f"✔ Saved {count} SVGs for '{category_name}' into {category_folder}")

def main():
    args = parse_arguments()

    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    ndjson_files = list(input_dir.glob("full_simplified_*.ndjson"))

    if not ndjson_files:
        print("❌ No matching .ndjson files found in input directory.")
        return

    for filepath in ndjson_files:
        category = extract_name_from_filename(filepath.name)
        if category:
            process_file(filepath, category, args.count, args.resolution, output_dir)
        else:
            print(f"⚠ Skipping file with unrecognized format: {filepath.name}")

if __name__ == "__main__":
    main()
