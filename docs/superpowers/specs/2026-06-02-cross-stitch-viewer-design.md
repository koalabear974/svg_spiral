# Cross-Stitch Viewer — Design Spec
Date: 2026-06-02

## Summary

Add a fullscreen cross-stitch viewer accessible from the existing motif browser (`motif_browser.html`). The viewer renders each stitch cell as a proper X shape (two diagonal lines) on a white/grid background, with pan/zoom and a counting overlay (rulers + batch selector).

---

## Integration with motif browser

- Both `openModal` (function-based motifs) and `openJsonModal` (JSON-based motifs) get an **"Open in Viewer"** button added to the modal body.
- Clicking the button closes the modal and activates the viewer overlay without opening a new tab.
- The motif is passed to the viewer as a normalized object:
  - Function motif: `{ type: 'fn', fn, gridW, gridH, colors: pal }`
  - JSON motif: `{ type: 'json', grid, colors, stitchWidth, stitchHeight }`
- The existing `sidebar.js` sidebar receives a CSS class (`viewer-open`) that collapses it while the viewer is active.

---

## Viewer overlay structure

A `<div id="xsViewer">` is injected into `motif_browser.html` (hidden by default via `display:none`). It contains:

1. **`<canvas id="xsCanvas">`** — fills the entire screen, handles all rendering.
2. **Top toolbar** — fixed bar at top: motif name (left), zoom level percentage (center), Close button (right), and a mode toggle button (Pan / Select).
3. **Ruler DOM elements** — a horizontal ruler (`<div id="xsRulerH">`) across the top below the toolbar, and a vertical ruler (`<div id="xsRulerV">`) on the left. These are DOM-based (not canvas) and update on pan/zoom. Column/row numbers shown every 10 stitches.
4. **Bottom info bar** — appears when a selection is active; shows selected region dimensions and per-color stitch counts.

---

## Rendering

### Transform state

```
{ panX, panY, scale }
```

- `panX`, `panY`: canvas-space offset in pixels
- `scale`: zoom multiplier (clamped 0.3× – 40×)
- Initial state: motif is fitted to viewport with 32px padding on all sides.

### Per-frame draw loop (on `requestAnimationFrame` when dirty)

1. Fill canvas with `#ffffff`.
2. Draw grid lines in `#e0e0e0` at every cell boundary (only lines within viewport).
3. For each cell in the visible viewport:
   - Compute cell pixel position: `x = panX + col * cellPx`, `y = panY + row * cellPx`, where `cellPx = scale * baseCellPx` (base cell = 1px logical).
   - Determine stitch color from motif data.
   - **LOD**: if `cellPx < 8` → `fillRect` with stitch color (solid square).
   - **LOD**: if `cellPx >= 8` → draw white square background + two diagonal lines (`lineTo`) in stitch color with 1px inset.
   - Background color (colorId 0) cells: always solid white, no X drawn.
4. If selection active: draw semi-transparent red rectangle over selection region.

---

## Pan & zoom interactions

### Mouse
- **Wheel**: zoom centered on cursor. `scale *= factor` then adjust `panX/panY` to keep cursor-pointed stitch fixed.
- **Drag (pan mode)**: `mousedown` → track delta → update `panX/panY` on `mousemove`.
- **Drag (select mode)**: `mousedown` → track drag → update selection rectangle in stitch coordinates on `mousemove` → finalize on `mouseup`.

### Touch
- **Single finger drag**: pan (same as mouse drag in pan mode).
- **Two-finger pinch**: zoom centered on midpoint of the two touches.
- Mode toggle (pan vs select) applies to touch as well.

### Keyboard
- `Escape`: close viewer.
- `0`: reset to fit-in-viewport zoom.

---

## Counting overlays

### Ruler labels (DOM-based)
- Horizontal ruler: fixed below toolbar, full width. Shows column index labels every 10 stitches. Label positions computed from `panX + col * cellPx`; only labels in viewport are rendered. Updates on every pan/zoom via JS.
- Vertical ruler: fixed on left edge below toolbar. Shows row index labels every 10 stitches. Same update logic.
- Labels styled as small monospace text on a semi-transparent white background.

### Batch selector
- Activated by toolbar toggle: **Pan mode** (default) vs **Select mode**.
- In select mode, drag creates a rectangular selection stored as `{ c1, r1, c2, r2 }` in stitch coordinates (clamped to motif bounds).
- Selection rectangle rendered on canvas as `rgba(180,40,40,0.18)` fill + `rgba(180,40,40,0.7)` border.
- Bottom info bar shows:
  - `Selected: W×H stitches`
  - Per-color count: one chip per color with swatch dot + count (only colors with count > 0 shown).
- Clicking canvas in pan mode (or pressing Escape) clears selection.

---

## File changes

1. **`p5stuff/motif_browser.html`** — main file to modify:
   - Add viewer overlay HTML (canvas, toolbar, rulers, info bar) before `</body>`.
   - Add viewer CSS in `<style>`.
   - Add viewer JS (CrossStitchViewer class or module) in a `<script>` before `</body>`.
   - Add "Open in Viewer" button to `openModal` and `openJsonModal` functions.
   - Add sidebar collapse logic.

No new files required — everything lives in the existing single-file HTML.

---

## Out of scope

- Color highlight mode (all stitches of one color) — deferred.
- Additive multi-rectangle selections — single rectangle only.
- Exporting or printing the selection.
