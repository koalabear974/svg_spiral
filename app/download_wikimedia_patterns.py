#!/usr/local/bin/python3
"""
Download embroidery pattern images from Wikimedia Commons.
Fetches all files from the specified categories via the MediaWiki API,
then downloads each file through Special:FilePath (which resolves the CDN URL).

Categories pulled:
  Category:Embroidery_patterns        (~51 files)
  Category:Cross-stitched_patterns    (~17 files)

Output: motif_wikimedia/<category_slug>/filename.jpg|png

Usage:  python3 download_wikimedia_patterns.py
"""

import os
import ssl
import time
import urllib.parse
import urllib.request
import json

_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE

BASE_DIR = os.path.join(os.path.dirname(__file__), "motif_wikimedia")

CATEGORIES = [
    ("Embroidery_patterns",     "embroidery_patterns"),
    ("Cross-stitched_patterns", "cross_stitched_patterns"),
]

def api_get_files(category):
    """Return list of filenames in a Commons category (follows continuation)."""
    files = []
    params = {
        "action": "query",
        "list": "categorymembers",
        "cmtitle": f"Category:{category}",
        "cmtype": "file",
        "cmlimit": "500",
        "format": "json",
    }
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    while True:
        req = urllib.request.Request(url, headers={"User-Agent": "PatternDownloader/1.0 (educational use)"})
        with urllib.request.urlopen(req, context=_ssl_ctx) as r:
            data = json.loads(r.read())
        for m in data["query"]["categorymembers"]:
            files.append(m["title"].removeprefix("File:"))
        if "continue" not in data:
            break
        params.update(data["continue"])
        url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    return files

def api_get_image_urls(filenames):
    """Batch-fetch direct CDN URLs for a list of filenames via imageinfo API."""
    urls = {}
    chunk_size = 50
    for i in range(0, len(filenames), chunk_size):
        chunk = filenames[i:i+chunk_size]
        titles = "|".join(f"File:{f}" for f in chunk)
        params = {
            "action": "query",
            "titles": titles,
            "prop": "imageinfo",
            "iiprop": "url",
            "format": "json",
        }
        url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers={"User-Agent": "PatternDownloader/1.0 (educational use)"})
        with urllib.request.urlopen(req, context=_ssl_ctx) as r:
            data = json.loads(r.read())
        for page in data["query"]["pages"].values():
            if "imageinfo" in page:
                name = page["title"].removeprefix("File:")
                urls[name] = page["imageinfo"][0]["url"]
        time.sleep(1)
    return urls

def download_file(url, dest):
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "PatternDownloader/1.0 (educational use)"})
            with urllib.request.urlopen(req, context=_ssl_ctx) as r:
                data = r.read()
            with open(dest, "wb") as f:
                f.write(data)
            return len(data)
        except Exception as e:
            if "429" in str(e) and attempt < 3:
                wait = 10 * (2 ** attempt)
                print(f"    rate limited, waiting {wait}s...")
                time.sleep(wait)
            else:
                raise

def run():
    os.makedirs(BASE_DIR, exist_ok=True)
    for category, slug in CATEGORIES:
        out = os.path.join(BASE_DIR, slug)
        os.makedirs(out, exist_ok=True)
        print(f"\nCategory:{category}")
        files = api_get_files(category)
        print(f"  {len(files)} files — fetching CDN URLs...")
        url_map = api_get_image_urls(files)
        for fname in files:
            safe = fname.replace("/", "_").replace(":", "_")
            dest = os.path.join(out, safe)
            if os.path.exists(dest):
                print(f"  skip  {fname[:60]}")
                continue
            cdn_url = url_map.get(fname)
            if not cdn_url:
                print(f"  miss  {fname[:60]}  (no URL)")
                continue
            try:
                size = download_file(cdn_url, dest)
                print(f"  ok    {fname[:60]}  ({size//1024} KB)")
                time.sleep(2)
            except Exception as e:
                print(f"  err   {fname[:60]}  {e}")
    print("\nDone.")

if __name__ == "__main__":
    run()
