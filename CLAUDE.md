# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `app/`:

```bash
npm run dev    # Start dev server with auto-restart (node --watch app.js), port 8765
npm start      # Start without auto-restart
```

No test suite. No build step.

## Architecture

This is **Motif Studio** — a creative coding app for Balkan embroidery motifs and cross-stitch patterns. The entire app lives under `app/`.

### Server (`app/app.js`)
Express server on port 8765. Key responsibilities:
- Serves all HTML pages as static files; root (`/`) redirects to `dashboard.html`
- Live-reload via socket.io: watches `sketch.js`, `sketch.html`, and `app/motifs/` and emits `reload` events
- REST API for motif CRUD

**Dual storage model**: in dev, motifs are stored in `app/motifs/*.json` (local FS). In Vercel production, the local FS is read-only, so saves fall back to Vercel Blob (`BLOB_READ_WRITE_TOKEN` env var). Both paths are tried transparently. `app/api/*.js` files are Vercel serverless handlers reused locally by `server.js`.

### Pages (navigation defined in `app/sidebar.js`)

| Page | File | Purpose |
|------|------|---------|
| Dashboard | `dashboard.html` | Overview, stats, motif count |
| Sketch | `sketch.html` + `sketch.js` | p5.js generative art canvas; press Space to redraw, S to save SVG |
| Motif Browser | `motif_browser.html` | Grid catalog of all saved motifs with filter/palette controls |
| Motif Studio | `motif_studio.html` | Image-to-cross-stitch converter: load image → pixel grid → extract motif → save |
| Cross-Stitch Viewer | `motif_viewer.html` | Interactive viewer with rulers, pinch-zoom, pan, color-toggle legend, and Print/PDF export (tiled multi-page chart — colored-symbol and/or color-blocks-plus-symbols styles, adjustable mm-per-square, cover page with full color+symbol preview, thread list) |

### Motif Data Format
Motifs are JSON objects saved to `app/motifs/<name>.json` (local) or Vercel Blob at `motifs/<name>.json`. `app/motifs/motifs.js` is an auto-generated manifest (`window.IMPORTED_MOTIFS`) rebuilt on every local save/delete.

Save filenames follow the pattern: `save_YYYYMMDD_HHMM_name.js` in `app/saves/`.

### Key Files
- `app/app.js` — main server, all API routes, storage logic
- `app/sidebar.js` — shared collapsible sidebar injected into every page
- `app/motif_studio.html` — self-contained image processing + motif extraction (no separate JS file)
- `app/motif_viewer.html` — self-contained cross-stitch viewer
- `app/sketch.js` / `app/sketch.html` — p5.js creative canvas (live-reloaded)
- `app/helpers.js` — shared p5.js math utilities (geometry, color)
- `app/renderers.js` — abstract Renderer base class for p5/SVG drawing
- `app/libs/` — vendored: p5.js, p5-svg.js, p5.gui.js, quicksettings.js
- `app/dmc-palette.js` — DMC thread color database

### Vercel Deployment
Deployed as project `svg-spiral`. The `app/api/` directory contains serverless functions. `app/.vercel/project.json` holds project/org IDs. The `BLOB_READ_WRITE_TOKEN` env var must be set in Vercel for cloud storage.

### OSC / TouchDesigner (`app/server.js`)
Alternative server with OSC UDP bridge (port 12346) for real-time integration with TouchDesigner. Not the primary entry point — `app.js` is.
