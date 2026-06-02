#!/usr/local/bin/python3
"""
image_to_motif.py — Extract a cross-stitch grid from an image and export it as JSON
                    plus a ready-to-paste p5.js stamp function.

The tool auto-detects the cell size by finding the pixel period that minimises
intra-cell color variance (works well for clean vector renders and scanned charts).

Usage:
  python3 image_to_motif.py <url_or_path> [options]

Options:
  --colors N      Colors to quantize to (default: 4)
  --cell N        Force cell size in pixels instead of auto-detecting
  --crop X Y W H  Crop before analysis (pixels)
  --name STR      Motif id/name (default: image filename stem)
  --out FILE      JSON output path (default: motifs/<name>.json)
  --preview       Print ASCII art to stdout
  --js            Also write a .js file with the stamp function

Examples:
  python3 image_to_motif.py pattern.png --colors 2 --name zmijanje_kolo
  python3 image_to_motif.py https://example.com/chart.jpg --cell 14 --js
"""

import argparse, io, json, math, os, ssl, sys, urllib.request
from pathlib import Path

try:
    from PIL import Image
    import numpy as np
except ImportError:
    print("Missing deps — run:  pip install Pillow numpy")
    sys.exit(1)

_ssl = ssl.create_default_context()
_ssl.check_hostname = False
_ssl.verify_mode = ssl.CERT_NONE


# ── image loading ─────────────────────────────────────────────────────────────

def load_image(src):
    if src.startswith("http://") or src.startswith("https://"):
        req = urllib.request.Request(src, headers={"User-Agent": "Mozilla/5.0"})
        data = urllib.request.urlopen(req, context=_ssl).read()
        return Image.open(io.BytesIO(data)).convert("RGB")
    return Image.open(src).convert("RGB")


# ── grid detection ────────────────────────────────────────────────────────────

def score_cell_size(arr, s):
    """Mean intra-cell std-dev for cell size s. Lower = more uniform cells."""
    h, w = arr.shape[:2]
    rows, cols = h // s, w // s
    if rows < 3 or cols < 3:
        return float("inf")
    # Reshape into grid of cells and compute std over spatial dims
    crop = arr[:rows*s, :cols*s]
    cells = crop.reshape(rows, s, cols, s, 3)
    # std over the s×s spatial block
    stds = cells.std(axis=(1, 3))          # shape (rows, cols, 3)
    return float(stds.mean())

def detect_cell_size(arr, lo=12, hi=64):
    """
    Find the grid period using two methods and combine:
    1. Variance minimisation (good for clean vector/scanned images)
    2. Autocorrelation of column-mean projection (good for JPEG images)
    Returns the size with the most evidence.
    """
    h, w = arr.shape[:2]

    # Method 1: variance minimisation
    scores = {}
    for s in range(lo, min(hi, min(h, w) // 4) + 1):
        sc = score_cell_size(arr, s)
        if sc < float("inf"):
            scores[s] = sc
    var_best = min(scores, key=scores.get) if scores else lo

    # Method 2: autocorrelation of horizontal projection (immune to JPEG blocks)
    proj = arr.mean(axis=(0, 2)).astype(float)   # mean per column
    proj -= proj.mean()
    ac = np.correlate(proj, proj, mode="full")
    ac = ac[len(ac)//2:]                          # positive lags only
    ac_best = lo
    for s in range(lo, min(hi, len(ac) - 1)):
        if ac[s] > ac[s-1] and ac[s] > ac[s+1]:
            ac_best = s
            break

    # Prefer the autocorrelation result unless variance strongly prefers something else
    var_at_ac = scores.get(ac_best, float("inf"))
    var_at_var = scores.get(var_best, float("inf"))
    return ac_best if var_at_ac < var_at_var * 1.5 else var_best


# ── grid sampling ─────────────────────────────────────────────────────────────

def sample_grid(arr, s):
    """Average color of each cell's inner 50% area."""
    h, w = arr.shape[:2]
    rows, cols = h // s, w // s
    m = max(1, s // 4)          # margin to avoid grid-line bleed
    grid = []
    for r in range(rows):
        row = []
        for c in range(cols):
            patch = arr[r*s+m:(r+1)*s-m, c*s+m:(c+1)*s-m]
            row.append(patch.reshape(-1, 3).mean(axis=0).tolist())
        grid.append(row)
    return grid, rows, cols


# ── color quantization ────────────────────────────────────────────────────────

def quantize(grid_colors, rows, cols, n):
    """
    K-means quantization. Falls back to PIL median-cut if sklearn missing.
    Returns (hex_palette, 2D index grid) with 0 = lightest color (background).
    """
    pixels = np.array(grid_colors, dtype=np.float32).reshape(-1, 3)
    try:
        from sklearn.cluster import KMeans
        km = KMeans(n_clusters=n, random_state=0, n_init=10).fit(pixels)
        centers = km.cluster_centers_
        labels  = km.labels_
    except ImportError:
        # PIL median-cut fallback
        tiny = Image.fromarray(
            np.array(grid_colors, dtype=np.uint8).reshape(rows, cols, 3), "RGB")
        q = tiny.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
        pal = q.getpalette()[:n*3]
        centers = np.array(pal, dtype=float).reshape(n, 3)
        labels  = np.array(list(q.getdata()), dtype=int)

    # Sort: brightest first (index 0 = background)
    lum = centers @ np.array([0.299, 0.587, 0.114])
    order = np.argsort(-lum)                        # descending luminance
    inv   = np.empty_like(order)
    inv[order] = np.arange(n)

    hex_pal = ["#%02x%02x%02x" % tuple(centers[i].astype(int)) for i in order]
    idx_grid = inv[labels].reshape(rows, cols).tolist()
    return hex_pal, idx_grid


# ── output builders ───────────────────────────────────────────────────────────

def build_json(name, source, grid, colors, cell_size):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    full_stitches = [
        {"colorId": v, "x": c, "y": r}
        for r, row in enumerate(grid)
        for c, v in enumerate(row)
        if v > 0
    ]
    return {
        "name":        name,
        "source":      source,
        "stitchWidth": cols,
        "stitchHeight":rows,
        "cellSizePx":  cell_size,
        "colors":      [{"colorId": i, "hexValue": h} for i, h in enumerate(colors)],
        "grid":        grid,
        "fullStitches":full_stitches,
    }

def build_js(name, grid, colors):
    """Return a stamp function compatible with motif_browser.html."""
    fn  = f"m{name[0].upper()}{name[1:]}"
    rows = len(grid)
    cols = len(grid[0]) if rows else 0

    rows_js = ",\n    ".join("[" + ",".join(str(v) for v in row) + "]" for row in grid)
    pal_js  = "[" + ",".join(f'"{h}"' for h in colors) + "]"

    return f"""\
// Auto-generated by image_to_motif.py
// Source colors: {pal_js}
function {fn}(col, row, w, h) {{
  const GRID = [
    {rows_js}
  ];
  if (row < 0 || row >= {rows} || col < 0 || col >= {cols}) return 0;
  return GRID[row][col];
}}
"""

def update_motifs_js(motifs_dir):
    """Rebuild motifs/motifs.js from all JSON files in motifs_dir."""
    motifs_dir = Path(motifs_dir)
    all_motifs = []
    for f in sorted(motifs_dir.glob("*.json")):
        with open(f) as fp:
            all_motifs.append(json.load(fp))
    js_path = motifs_dir / "motifs.js"
    with open(js_path, "w") as f:
        f.write("// Auto-generated by image_to_motif.py — do not edit manually\n")
        f.write("window.IMPORTED_MOTIFS = ")
        json.dump(all_motifs, f, indent=2)
        f.write(";\n")
    return js_path

def ascii_preview(grid):
    chars = " .:#XO@"
    for row in grid:
        print("".join(chars[min(v, len(chars)-1)] for v in row))


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("source")
    ap.add_argument("--colors", type=int, default=4)
    ap.add_argument("--cell",   type=int, default=None)
    ap.add_argument("--lo",    type=int, default=12, help="Min cell size for auto-detect (default 12)")
    ap.add_argument("--crop",   nargs=4, type=int, metavar=("X","Y","W","H"))
    ap.add_argument("--name",   default=None)
    ap.add_argument("--out",    default=None)
    ap.add_argument("--preview",action="store_true")
    ap.add_argument("--js",     action="store_true")
    args = ap.parse_args()

    print(f"Loading: {args.source}")
    img = load_image(args.source)

    if args.crop:
        x, y, w, h = args.crop
        img = img.crop((x, y, x+w, y+h))

    arr = np.array(img)
    print(f"  Size: {img.width}×{img.height}px")

    if args.cell:
        cell = args.cell
        print(f"  Cell: {cell}px (forced)")
    else:
        print("  Detecting cell size…", end=" ", flush=True)
        cell = detect_cell_size(arr)
        print(f"{cell}px")

    grid_colors, rows, cols = sample_grid(arr, cell)
    print(f"  Grid: {cols}×{rows} cells")

    print(f"  Quantizing → {args.colors} colors…", end=" ", flush=True)
    colors, grid = quantize(grid_colors, rows, cols, args.colors)
    print("  ".join(colors))

    # name / paths
    name = args.name
    if not name:
        raw = args.source.split("/")[-1].split("?")[0]
        name = Path(raw).stem.replace("-", "_").replace(" ", "_")[:30]

    os.makedirs("motifs", exist_ok=True)
    json_path = args.out or f"motifs/{name}.json"
    js_path   = json_path.replace(".json", ".js")

    data = build_json(name, args.source, grid, colors, cell)
    with open(json_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"\n✓ JSON  → {json_path}  ({rows}×{cols}, {len(colors)} colors)")

    js_manifest = update_motifs_js(Path(json_path).parent)
    print(f"✓ Index → {js_manifest}  ({len([*Path(json_path).parent.glob('*.json')])} motifs)")

    if args.js:
        js = build_js(name, grid, colors)
        with open(js_path, "w") as f:
            f.write(js)
        print(f"✓ JS    → {js_path}")

    if args.preview:
        print("\nASCII preview:")
        ascii_preview(grid)


if __name__ == "__main__":
    main()
