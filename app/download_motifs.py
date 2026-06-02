#!/usr/local/bin/python3
"""
Bulk download Balkan embroidery pattern images organised by category.
Images are saved to motif_images/<category>/ — each folder corresponds
to one search query, making it easy to process by tradition later.

Usage:  python3 download_motifs.py
        python3 download_motifs.py --limit 30   (default: 20 per query)
"""

import argparse
import os
from icrawler.builtin import BingImageCrawler

QUERIES = [
    # --- Pirot kilim (Serbia) ---
    ("pirot_kilim_sofra",        "Pirot kilim sofra motif pattern chart"),
    ("pirot_kilim_turtle",       "Pirot kilim kornjaca turtle motif pattern"),
    ("pirot_kilim_frog",         "Pirot kilim zaba frog motif pattern"),
    ("pirot_kilim_octopus",      "Pirot kilim hobotnica octopus motif pattern"),
    ("pirot_kilim_devils_knees", "Pirot kilim Đavolja Kolena devil's knees motif"),
    ("pirot_kilim_general",      "Pirot kilim motif chart pattern cross stitch"),
    # --- Serbian embroidery ---
    ("serbian_tree_of_life",     "Serbian embroidery stablo zivota tree of life pattern chart"),
    ("serbian_djerdjev",         "đerđef Serbian embroidery pattern chart motif"),
    ("serbian_cross_stitch",     "Serbian folk embroidery cross stitch pattern chart grid"),
    # --- Bulgarian shevitsa ---
    ("bulgarian_elbetitsa",      "Bulgarian embroidery elbetitsa pattern chart"),
    ("bulgarian_makaz",          "Bulgarian shevitsa makaz scissors motif"),
    ("bulgarian_kanatitsa",      "Bulgarian embroidery kanatitsa motif pattern"),
    ("bulgarian_shevitsa",       "Bulgarian shevitsa embroidery pattern chart cross stitch"),
    ("bulgarian_folk",           "Bulgarian folk embroidery motif chart grid pattern"),
    # --- Romanian ie ---
    ("romanian_ie_sleeve",       "Romanian ie blouse sleeve embroidery pattern chart"),
    ("romanian_altita",          "Romanian altita embroidery pattern motif"),
    ("romanian_coloana",         "Romanian coloana column motif embroidery pattern"),
    ("romanian_rams_horn",       "Romanian coarne de berbec ram horn embroidery pattern"),
    ("romanian_folk",            "Romanian folk embroidery motif chart grid cross stitch"),
    # --- Macedonian ---
    ("macedonian_embroidery",    "Macedonian embroidery sonce motif pattern chart"),
    ("macedonian_folk",          "Macedonian folk embroidery pattern chart grid motif"),
    # --- Bosnian Zmijanje ---
    ("zmijanje_embroidery",      "Zmijanje embroidery Bosnia pattern motif chart"),
    ("bosnian_folk",             "Bosnian folk embroidery pattern motif chart"),
    # --- Albanian kilim ---
    ("albanian_kilim",           "Albanian kilim carpet motif pattern chart"),
    ("albanian_embroidery",      "Albanian folk embroidery pattern motif chart"),
    # --- Pan-Balkan charts ---
    ("balkan_cross_stitch",      "Balkan folk embroidery cross stitch pattern chart PDF"),
    ("balkan_diamond_pattern",   "Balkan diamond lozenge cross stitch pattern chart"),
    ("balkan_geometric",         "Balkan geometric folk embroidery motif chart grid"),
]

BASE_DIR = os.path.join(os.path.dirname(__file__), "motif_images")

def download(limit):
    os.makedirs(BASE_DIR, exist_ok=True)
    total = 0
    for folder, query in QUERIES:
        out = os.path.join(BASE_DIR, folder)
        os.makedirs(out, exist_ok=True)
        existing = len([f for f in os.listdir(out) if not f.startswith('.')])
        if existing >= limit:
            print(f"  skip  {folder}  ({existing} images already)")
            continue
        print(f"  → {folder}")
        print(f"    \"{query}\"")
        crawler = BingImageCrawler(
            storage={"root_dir": out},
            feeder_threads=2,
            parser_threads=2,
            downloader_threads=4,
        )
        crawler.crawl(keyword=query, max_num=limit, min_size=(100, 100))
        n = len([f for f in os.listdir(out) if not f.startswith('.')])
        print(f"    {n} images saved")
        total += n
    print(f"\nDone — {total} images across {len(QUERIES)} categories → {BASE_DIR}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=20,
                        help="Max images per search query (default: 20)")
    args = parser.parse_args()
    print(f"Downloading up to {args.limit} images per query ({len(QUERIES)} queries)...\n")
    download(args.limit)
