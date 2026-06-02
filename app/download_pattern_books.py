#!/usr/local/bin/python3
"""
Download cross-stitch chart pages from Internet Archive embroidery pattern books.
Uses the IA IIIF image API to get individual pages as JPEGs.

Sources:
  1877 Russian & Ukrainian Embroidery Pattern Collection (59 pages)
  Album of Ukrainian Embroidery Patterns from 1886 (96 pages)

Output: motif_books/<book_id>/page_NNN.jpg

Usage:  python3 download_pattern_books.py
        python3 download_pattern_books.py --width 1600   (default: 1200px wide)
"""

import argparse
import os
import ssl
import time
import urllib.request

# macOS Python often lacks system CA certs; disable verification for image downloads
_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE

BOOKS = [
    {
        "id":    "1877-collected-patterns",
        "name":  "1877_russian_ukrainian",
        "pages": 59,
    },
    {
        "id":    "hough-2022-album-of-ukrainian-embroidery-patterns-from-1886",
        "name":  "1886_ukrainian_album",
        "pages": 96,
    },
]

BASE_DIR = os.path.join(os.path.dirname(__file__), "motif_books")

def iiif_url(book_id, page, width):
    return f"https://iiif.archive.org/iiif/{book_id}${page}/full/{width},/0/default.jpg"

def download(width):
    os.makedirs(BASE_DIR, exist_ok=True)
    for book in BOOKS:
        out = os.path.join(BASE_DIR, book["name"])
        os.makedirs(out, exist_ok=True)
        print(f"\n{book['name']}  ({book['pages']} pages)")
        for page in range(book["pages"]):
            dest = os.path.join(out, f"page_{page:03d}.jpg")
            if os.path.exists(dest):
                continue
            url = iiif_url(book["id"], page, width)
            try:
                with urllib.request.urlopen(url, context=_ssl_ctx) as resp:
                    with open(dest, 'wb') as f:
                        f.write(resp.read())
                size = os.path.getsize(dest)
                if size < 5000:          # blank / error page
                    os.remove(dest)
                    print(f"  skip  page {page:03d}  (blank)")
                else:
                    print(f"  ok    page {page:03d}  ({size//1024} KB)")
                time.sleep(0.3)          # be polite to IA servers
            except Exception as e:
                print(f"  err   page {page:03d}  {e}")
    print("\nDone.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--width", type=int, default=1200,
                        help="Image width in pixels (default: 1200)")
    args = parser.parse_args()
    download(args.width)
