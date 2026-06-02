#!/usr/local/bin/python3
"""
motif_studio.py — Interactive web UI for image-to-motif extraction.

Usage: python3 motif_studio.py [--port N] [--no-browser]
Opens http://localhost:8765 in your browser automatically.
"""

import base64, io, json, os, sys, threading, webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

try:
    from PIL import Image
    import numpy as np
except ImportError:
    print("Missing deps — run: pip install Pillow numpy")
    sys.exit(1)

sys.path.insert(0, str(Path(__file__).parent))
import image_to_motif as m2m

PORT = 8765
BASE_DIR = Path(__file__).parent
MOTIFS_DIR = BASE_DIR / "motifs"


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args): pass  # silence access log

    def reply(self, body: bytes, ct: str, status: int = 200):
        self.send_response(status)
        self.send_header("Content-Type", ct)
        self.send_header("Content-Length", len(body))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def reply_json(self, obj, status: int = 200):
        self.reply(json.dumps(obj).encode(), "application/json", status)

    def read_body(self) -> bytes:
        n = int(self.headers.get("Content-Length", 0))
        return self.rfile.read(n)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]
        if path in ("/", "/motif_studio.html"):
            f = BASE_DIR / "motif_studio.html"
            self.reply(f.read_bytes(), "text/html; charset=utf-8")
        elif path == "/motif_browser.html":
            f = BASE_DIR / "motif_browser.html"
            self.reply(f.read_bytes(), "text/html; charset=utf-8")
        elif path.startswith("/motifs/"):
            f = BASE_DIR / path.lstrip("/")
            if f.exists():
                ct = {"json": "application/json", "js": "application/javascript"}.get(
                    f.suffix.lstrip("."), "text/plain"
                )
                self.reply(f.read_bytes(), ct)
            else:
                self.send_response(404); self.end_headers()
        else:
            self.send_response(404); self.end_headers()

    def do_POST(self):
        path = self.path.split("?")[0]
        body = self.read_body()
        try:
            data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            self.reply_json({"error": "invalid JSON"}, 400)
            return

        try:
            if path == "/proxy":
                self._proxy(data)
            elif path == "/save":
                self._save(data)
            else:
                self.reply_json({"error": f"unknown path: {path}"}, 404)
        except Exception as e:
            self.reply_json({"error": str(e)}, 500)

    def _proxy(self, data):
        url = data.get("url", "").strip()
        if not url:
            self.reply_json({"error": "url required"}, 400)
            return
        img = m2m.load_image(url)
        # Downscale large images so JS stays fast
        MAX = 1200
        if img.width > MAX or img.height > MAX:
            img.thumbnail((MAX, MAX), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode()
        self.reply_json({
            "dataUrl": f"data:image/png;base64,{b64}",
            "width": img.width,
            "height": img.height,
        })

    def _save(self, data):
        name = (data.get("name") or "motif").strip()
        motif = data.get("motif")
        if not motif:
            self.reply_json({"error": "motif required"}, 400)
            return
        MOTIFS_DIR.mkdir(exist_ok=True)
        json_path = MOTIFS_DIR / f"{name}.json"
        with open(json_path, "w") as f:
            json.dump(motif, f, indent=2)
        m2m.update_motifs_js(MOTIFS_DIR)
        count = len(list(MOTIFS_DIR.glob("*.json")))
        self.reply_json({"saved": f"motifs/{name}.json", "count": count})


def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=PORT)
    ap.add_argument("--no-browser", action="store_true")
    args = ap.parse_args()

    server = HTTPServer(("localhost", args.port), Handler)
    url = f"http://localhost:{args.port}/"
    print(f"Motif Studio  →  {url}")
    print("Press Ctrl+C to stop.\n")
    if not args.no_browser:
        threading.Timer(0.4, webbrowser.open, args=(url,)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
