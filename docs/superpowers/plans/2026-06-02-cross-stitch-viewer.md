# Cross-Stitch Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fullscreen cross-stitch viewer (X-shaped stitches, pan/zoom, stitch counting rulers + batch selector) accessible from the motif browser modal.

**Architecture:** All changes are in a single file (`p5stuff/motif_browser.html`). A fullscreen overlay div is injected; a self-contained IIFE viewer module manages state and canvas rendering. Both function-based and JSON-based motif types are normalized into a common interface on open. Rulers are DOM-based; everything else is canvas 2D.

**Tech Stack:** Vanilla JS, Canvas 2D API, pointer events (mouse + touch), no build tools, no dependencies.

---

## File changes

- Modify: `p5stuff/motif_browser.html`
  - Add viewer CSS inside existing `<style>` block (before `</style>`, line 99)
  - Add `<button id="mOpenViewer">` inside `.modal-details` (after line 152, before `</div>`)
  - Add viewer overlay HTML before `</body>`
  - Add viewer `<script>` block before `<script src="/sidebar.js">`
  - Modify `openModal` (line 818) and `openJsonModal` (line 833) to wire the button

---

## Task 1: Viewer CSS

**Files:**
- Modify: `p5stuff/motif_browser.html` — add CSS inside `<style>` block before `</style>` (line 99)

- [ ] **Step 1: Add viewer CSS**

In `motif_browser.html`, find `</style>` and insert the following block just before it:

```css
/* ─── Cross-Stitch Viewer ──────────────────────────────────────── */
#xsViewer {
  display: none; position: fixed; inset: 0; z-index: 1000;
  flex-direction: column; background: #fff;
}
#xsViewer.open { display: flex; }
#xsToolbar {
  height: 44px; background: #2c1810; color: #f5f0e8;
  display: flex; align-items: center; padding: 0 16px; gap: 10px; flex-shrink: 0;
}
#xsMotifName {
  font-family: Georgia,serif; font-size: 0.95rem; flex: 1;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
#xsZoomPct {
  font-size: 0.75rem; opacity: 0.65; min-width: 46px;
  text-align: right; font-variant-numeric: tabular-nums;
}
.xs-btn {
  padding: 4px 12px; border: 1px solid rgba(255,255,255,0.3); border-radius: 4px;
  background: transparent; color: #f5f0e8; cursor: pointer; font-size: 0.78rem;
}
.xs-btn:hover { background: rgba(255,255,255,0.12); }
.xs-btn.active { background: #8b2020; border-color: #8b2020; }
#xsMain { position: relative; flex: 1; overflow: hidden; }
#xsCanvas { position: absolute; inset: 0; display: block; cursor: grab; }
#xsCanvas.xs-select { cursor: crosshair; }
#xsCanvas.xs-dragging { cursor: grabbing; }
#xsRulerCorner {
  position: absolute; top: 0; left: 0; width: 28px; height: 20px;
  background: rgba(248,248,248,0.94); border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd; z-index: 5; pointer-events: none;
}
#xsRulerH {
  position: absolute; top: 0; left: 28px; right: 0; height: 20px;
  background: rgba(248,248,248,0.94); border-bottom: 1px solid #ddd;
  overflow: hidden; z-index: 4; pointer-events: none;
}
#xsRulerV {
  position: absolute; top: 20px; left: 0; bottom: 0; width: 28px;
  background: rgba(248,248,248,0.94); border-right: 1px solid #ddd;
  overflow: hidden; z-index: 4; pointer-events: none;
}
.xs-rlbl {
  position: absolute; font-size: 9px; color: #aaa;
  font-family: monospace; user-select: none; line-height: 1;
}
#xsRulerH .xs-rlbl { top: 5px; transform: translateX(-50%); }
#xsRulerV .xs-rlbl { left: 2px; transform: translateY(-50%); }
#xsInfoBar {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(44,24,16,0.88); color: #f5f0e8;
  padding: 7px 16px; font-size: 0.78rem;
  display: none; align-items: center; gap: 14px; flex-wrap: wrap; z-index: 5;
}
#xsInfoBar.active { display: flex; }
.xs-chip { display: inline-flex; align-items: center; gap: 5px; }
.xs-chip-dot {
  width: 10px; height: 10px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.3); flex-shrink: 0;
}
/* "Open in viewer" modal button */
#mOpenViewer {
  margin-top: 14px; padding: 7px 16px; border-radius: 6px;
  background: #2c1810; color: #f5f0e8; border: none; cursor: pointer;
  font-size: 0.82rem; display: none;
}
#mOpenViewer.visible { display: inline-block; }
#mOpenViewer:hover { background: #4a2e1e; }
/* Collapse sidebar while viewer open */
body.viewer-open #sidebar,
body.viewer-open .sidebar,
body.viewer-open nav { display: none !important; }
```

- [ ] **Step 2: Verify**

Open `p5stuff/motif_browser.html` in a browser. In the DevTools console run:
```javascript
document.getElementById('xsViewer')
```
Expected: returns `null` (the overlay div doesn't exist yet — CSS is ready but HTML comes next).

- [ ] **Step 3: Commit**

```bash
git add p5stuff/motif_browser.html
git commit -m "feat(viewer): add cross-stitch viewer CSS"
```

---

## Task 2: Viewer HTML overlay + "Open in Viewer" button in modal

**Files:**
- Modify: `p5stuff/motif_browser.html` — add button to modal, add overlay HTML

- [ ] **Step 1: Add "Open in Viewer" button to modal HTML**

Find this block in `motif_browser.html` (around line 149–153):
```html
          <div class="modal-construction">
            <h4>Construction Notes</h4>
            <div id="mConstruct"></div>
          </div>
        </div>
```
Replace with:
```html
          <div class="modal-construction">
            <h4>Construction Notes</h4>
            <div id="mConstruct"></div>
          </div>
          <button id="mOpenViewer">Open in cross-stitch viewer</button>
        </div>
```

- [ ] **Step 2: Add viewer overlay HTML before `</body>`**

Find `<script src="/sidebar.js"></script>` near the end and insert this block immediately before it:

```html
<!-- ─── Cross-Stitch Viewer ──────────────────────────────── -->
<div id="xsViewer">
  <div id="xsToolbar">
    <span id="xsMotifName"></span>
    <span id="xsZoomPct">100%</span>
    <button class="xs-btn" id="xsModeBtn">Select</button>
    <button class="xs-btn" id="xsFitBtn">Fit</button>
    <button class="xs-btn" id="xsCloseBtn">✕ Close</button>
  </div>
  <div id="xsMain">
    <canvas id="xsCanvas"></canvas>
    <div id="xsRulerCorner"></div>
    <div id="xsRulerH"></div>
    <div id="xsRulerV"></div>
    <div id="xsInfoBar"></div>
  </div>
</div>
```

- [ ] **Step 3: Verify**

Reload the page. Run in console:
```javascript
document.getElementById('xsViewer').classList.add('open')
```
Expected: a dark toolbar appears at the top of the page filling the screen, with "Select", "Fit", "✕ Close" buttons visible. The motif browser cards disappear behind the overlay.

Run `document.getElementById('xsViewer').classList.remove('open')` to restore.

- [ ] **Step 4: Commit**

```bash
git add p5stuff/motif_browser.html
git commit -m "feat(viewer): add viewer overlay HTML and Open in Viewer button"
```

---

## Task 3: Viewer JS — core module (state, normalize, open/close, canvas fit, basic square rendering)

**Files:**
- Modify: `p5stuff/motif_browser.html` — add `<script>` block before `<script src="/sidebar.js">`

- [ ] **Step 1: Add the viewer script**

Find `<script src="/sidebar.js"></script>` and insert this full `<script>` block immediately before it:

```html
<script>
// ─── CROSS-STITCH VIEWER ─────────────────────────────────────────────────────
(function () {
  const RULER_W = 28, RULER_H = 20;
  const MIN_SCALE = 0.5, MAX_SCALE = 40;
  const GRID_THRESHOLD = 3;
  const X_THRESHOLD = 8;

  let xm = null;       // normalized motif
  let panX = 0, panY = 0, scale = 1;
  let mode = 'pan';    // 'pan' | 'select'
  let sel = null;      // { c1, r1, c2, r2 } stitch-space | null
  let dirty = false;
  let dragState = null;
  let pinchState = null;

  // ── Normalize ───────────────────────────────────────────────────────────────
  function normalize(motif, isJson) {
    if (isJson) {
      const colors = motif.colors.map(c => c.hexValue);
      return {
        name: motif.name.replace(/_/g, ' '),
        cols: motif.stitchWidth,
        rows: motif.stitchHeight,
        colors,
        bgColor: colors[0],
        cell(c, r) {
          return colors[Math.min(motif.grid[r][c], colors.length - 1)];
        }
      };
    }
    // function-based motif: capture current palette at open time
    const colors = pal.slice();
    return {
      name: motif.name,
      cols: motif.gridW,
      rows: motif.gridH,
      colors,
      bgColor: colors[0],
      cell(c, r) {
        return colors[Math.min(motif.fn(c, r, motif.gridW, motif.gridH), colors.length - 1)];
      }
    };
  }

  // ── Open / Close ─────────────────────────────────────────────────────────────
  function openXsViewer(motif, isJson) {
    xm = normalize(motif, isJson);
    mode = 'pan';
    sel = null;
    dirty = false;
    dragState = null;
    pinchState = null;
    document.getElementById('xsMotifName').textContent = xm.name;
    document.getElementById('xsModeBtn').classList.remove('active');
    document.getElementById('xsInfoBar').classList.remove('active');
    document.getElementById('xsCanvas').classList.remove('xs-select');
    document.getElementById('xsViewer').classList.add('open');
    document.body.classList.add('viewer-open');
    sizeCanvas();
    fit();
    markDirty();
  }
  window.openXsViewer = openXsViewer;

  function closeXsViewer() {
    document.getElementById('xsViewer').classList.remove('open');
    document.body.classList.remove('viewer-open');
    xm = null;
    sel = null;
  }

  // ── Canvas sizing ────────────────────────────────────────────────────────────
  function sizeCanvas() {
    const canvas = document.getElementById('xsCanvas');
    const main = document.getElementById('xsMain');
    canvas.width = main.offsetWidth;
    canvas.height = main.offsetHeight;
  }

  // ── Fit motif to viewport ────────────────────────────────────────────────────
  function fit() {
    const canvas = document.getElementById('xsCanvas');
    const W = canvas.width, H = canvas.height;
    const pad = 32;
    const availW = W - RULER_W - pad * 2;
    const availH = H - RULER_H - pad * 2;
    scale = Math.min(availW / xm.cols, availH / xm.rows);
    panX = RULER_W + pad + (availW - xm.cols * scale) / 2;
    panY = RULER_H + pad + (availH - xm.rows * scale) / 2;
  }

  // ── Render loop ──────────────────────────────────────────────────────────────
  function markDirty() {
    if (!dirty) { dirty = true; requestAnimationFrame(render); }
  }

  function render() {
    dirty = false;
    if (!xm) return;
    const canvas = document.getElementById('xsCanvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cp = scale;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Visible cell range (clamp to motif bounds)
    const c0 = Math.max(0, Math.floor((RULER_W - panX) / cp));
    const c1 = Math.min(xm.cols - 1, Math.ceil((W - panX) / cp));
    const r0 = Math.max(0, Math.floor((RULER_H - panY) / cp));
    const r1 = Math.min(xm.rows - 1, Math.ceil((H - panY) / cp));

    // Grid lines
    if (cp >= GRID_THRESHOLD) {
      ctx.strokeStyle = '#e8e8e8';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let c = c0; c <= c1 + 1; c++) {
        const x = Math.round(panX + c * cp);
        ctx.moveTo(x, panY + r0 * cp);
        ctx.lineTo(x, panY + (r1 + 1) * cp);
      }
      for (let r = r0; r <= r1 + 1; r++) {
        const y = Math.round(panY + r * cp);
        ctx.moveTo(panX + c0 * cp, y);
        ctx.lineTo(panX + (c1 + 1) * cp, y);
      }
      ctx.stroke();
    }

    // Cells
    const useX = cp >= X_THRESHOLD;
    if (useX) {
      ctx.lineCap = 'round';
      ctx.lineWidth = Math.max(1, cp * 0.15);
    }
    const inset = Math.max(1, cp * 0.12);

    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const hex = xm.cell(c, r);
        if (hex === xm.bgColor) continue;
        const x = panX + c * cp;
        const y = panY + r * cp;
        if (!useX) {
          ctx.fillStyle = hex;
          ctx.fillRect(x, y, cp, cp);
        } else {
          ctx.strokeStyle = hex;
          ctx.beginPath();
          ctx.moveTo(x + inset,      y + inset);
          ctx.lineTo(x + cp - inset, y + cp - inset);
          ctx.moveTo(x + cp - inset, y + inset);
          ctx.lineTo(x + inset,      y + cp - inset);
          ctx.stroke();
        }
      }
    }

    // Selection overlay
    if (sel) {
      const sc = Math.min(sel.c1, sel.c2), ec = Math.max(sel.c1, sel.c2);
      const sr = Math.min(sel.r1, sel.r2), er = Math.max(sel.r1, sel.r2);
      ctx.fillStyle = 'rgba(180,40,40,0.15)';
      ctx.fillRect(panX + sc * cp, panY + sr * cp, (ec - sc + 1) * cp, (er - sr + 1) * cp);
      ctx.strokeStyle = 'rgba(180,40,40,0.75)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(panX + sc * cp, panY + sr * cp, (ec - sc + 1) * cp, (er - sr + 1) * cp);
    }

    // Ruler background overdraw (hides cells that bleed under rulers)
    ctx.fillStyle = 'rgba(248,248,248,0.94)';
    ctx.fillRect(0, 0, W, RULER_H);
    ctx.fillRect(0, 0, RULER_W, H);

    // Update HUD
    document.getElementById('xsZoomPct').textContent = Math.round(scale * 100) + '%';
    updateRulers(c0, c1, r0, r1, cp);
  }

  // ── Rulers ───────────────────────────────────────────────────────────────────
  function rulerStep(cp) {
    const minGap = 40;
    const raw = Math.ceil(minGap / cp);
    return [1, 2, 5, 10, 20, 50, 100].find(s => s >= raw) || 100;
  }

  function updateRulers(c0, c1, r0, r1, cp) {
    const rh = document.getElementById('xsRulerH');
    const rv = document.getElementById('xsRulerV');
    const step = rulerStep(cp);

    rh.innerHTML = '';
    const cStart = Math.ceil(c0 / step) * step;
    for (let c = cStart; c <= c1; c += step) {
      const x = panX + c * cp - RULER_W;
      if (x < 0 || x > rh.offsetWidth) continue;
      const el = document.createElement('span');
      el.className = 'xs-rlbl';
      el.style.left = x + 'px';
      el.textContent = c;
      rh.appendChild(el);
    }

    rv.innerHTML = '';
    const rStart = Math.ceil(r0 / step) * step;
    for (let r = rStart; r <= r1; r += step) {
      const y = panY + r * cp - RULER_H;
      if (y < 0 || y > rv.offsetHeight) continue;
      const el = document.createElement('span');
      el.className = 'xs-rlbl';
      el.style.top = y + 'px';
      el.textContent = r;
      rv.appendChild(el);
    }
  }

  // ── Info bar ─────────────────────────────────────────────────────────────────
  function updateInfoBar() {
    if (!sel) return;
    const sc = Math.min(sel.c1, sel.c2), ec = Math.max(sel.c1, sel.c2);
    const sr = Math.min(sel.r1, sel.r2), er = Math.max(sel.r1, sel.r2);
    const W = ec - sc + 1, H = er - sr + 1;
    const counts = {};
    for (let r = sr; r <= er; r++) {
      for (let c = sc; c <= ec; c++) {
        const hex = xm.cell(c, r);
        if (hex === xm.bgColor) continue;
        counts[hex] = (counts[hex] || 0) + 1;
      }
    }
    const bar = document.getElementById('xsInfoBar');
    let html = `<span>Selected: <b>${W}×${H}</b></span>`;
    for (const [hex, cnt] of Object.entries(counts)) {
      html += `<span class="xs-chip"><span class="xs-chip-dot" style="background:${hex}"></span>${cnt}</span>`;
    }
    bar.innerHTML = html;
    bar.classList.add('active');
  }

  // ── Coord helpers ─────────────────────────────────────────────────────────────
  function screenToStitch(sx, sy) {
    return {
      c: Math.max(0, Math.min(xm.cols - 1, Math.floor((sx - panX) / scale))),
      r: Math.max(0, Math.min(xm.rows - 1, Math.floor((sy - panY) / scale)))
    };
  }

  function zoomAt(factor, cx, cy) {
    const sc = (cx - panX) / scale;
    const sr = (cy - panY) / scale;
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));
    panX = cx - sc * scale;
    panY = cy - sr * scale;
    markDirty();
  }

  // ── Mouse interactions ────────────────────────────────────────────────────────
  function onWheel(e) {
    if (!xm) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - rect.left, e.clientY - rect.top);
  }

  function onMouseDown(e) {
    if (!xm || e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    if (mode === 'select') {
      const { c, r } = screenToStitch(sx, sy);
      dragState = { type: 'select', startC: c, startR: r };
      sel = { c1: c, r1: r, c2: c, r2: r };
      document.getElementById('xsInfoBar').classList.remove('active');
    } else {
      dragState = { type: 'pan', startX: sx, startY: sy, px0: panX, py0: panY };
    }
    e.currentTarget.classList.add('xs-dragging');
  }

  function onMouseMove(e) {
    if (!dragState || !xm) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    if (dragState.type === 'pan') {
      panX = dragState.px0 + (sx - dragState.startX);
      panY = dragState.py0 + (sy - dragState.startY);
    } else {
      const { c, r } = screenToStitch(sx, sy);
      sel = { c1: dragState.startC, r1: dragState.startR, c2: c, r2: r };
    }
    markDirty();
  }

  function onMouseUp(e) {
    if (!dragState) return;
    const wasSel = dragState.type === 'select';
    dragState = null;
    e.currentTarget.classList.remove('xs-dragging');
    if (wasSel && sel) updateInfoBar();
  }

  // ── Touch interactions ────────────────────────────────────────────────────────
  function touchDist(t1, t2) {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  }

  function onTouchStart(e) {
    if (!xm) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.touches.length === 1) {
      pinchState = null;
      const sx = e.touches[0].clientX - rect.left;
      const sy = e.touches[0].clientY - rect.top;
      if (mode === 'select') {
        const { c, r } = screenToStitch(sx, sy);
        dragState = { type: 'select', startC: c, startR: r };
        sel = { c1: c, r1: r, c2: c, r2: r };
        document.getElementById('xsInfoBar').classList.remove('active');
      } else {
        dragState = { type: 'pan', startX: sx, startY: sy, px0: panX, py0: panY };
      }
    } else if (e.touches.length === 2) {
      dragState = null;
      const mx = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
      const my = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;
      pinchState = {
        dist: touchDist(e.touches[0], e.touches[1]),
        initScale: scale,
        stitchC: (mx - panX) / scale,
        stitchR: (my - panY) / scale
      };
    }
  }

  function onTouchMove(e) {
    if (!xm) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.touches.length === 2 && pinchState) {
      const dist = touchDist(e.touches[0], e.touches[1]);
      const mx = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
      const my = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;
      scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, pinchState.initScale * (dist / pinchState.dist)));
      panX = mx - pinchState.stitchC * scale;
      panY = my - pinchState.stitchR * scale;
      markDirty();
    } else if (e.touches.length === 1 && dragState) {
      const sx = e.touches[0].clientX - rect.left;
      const sy = e.touches[0].clientY - rect.top;
      if (dragState.type === 'pan') {
        panX = dragState.px0 + (sx - dragState.startX);
        panY = dragState.py0 + (sy - dragState.startY);
      } else {
        const { c, r } = screenToStitch(sx, sy);
        sel = { c1: dragState.startC, r1: dragState.startR, c2: c, r2: r };
      }
      markDirty();
    }
  }

  function onTouchEnd(e) {
    e.preventDefault();
    if (e.touches.length < 2) pinchState = null;
    if (e.touches.length === 0) {
      const wasSel = dragState && dragState.type === 'select';
      dragState = null;
      if (wasSel && sel) updateInfoBar();
    }
  }

  // ── Toolbar wiring ────────────────────────────────────────────────────────────
  function initViewer() {
    const canvas = document.getElementById('xsCanvas');

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });

    document.getElementById('xsCloseBtn').addEventListener('click', closeXsViewer);

    document.getElementById('xsFitBtn').addEventListener('click', () => {
      if (!xm) return;
      sizeCanvas();
      fit();
      markDirty();
    });

    document.getElementById('xsModeBtn').addEventListener('click', () => {
      mode = mode === 'pan' ? 'select' : 'pan';
      const btn = document.getElementById('xsModeBtn');
      btn.textContent = mode === 'select' ? 'Pan' : 'Select';
      btn.classList.toggle('active', mode === 'select');
      canvas.classList.toggle('xs-select', mode === 'select');
      if (mode === 'pan') {
        sel = null;
        document.getElementById('xsInfoBar').classList.remove('active');
        markDirty();
      }
    });

    document.addEventListener('keydown', e => {
      if (!document.getElementById('xsViewer').classList.contains('open')) return;
      if (e.key === 'Escape') closeXsViewer();
      if (e.key === '0') { sizeCanvas(); fit(); markDirty(); }
    });

    window.addEventListener('resize', () => {
      if (!document.getElementById('xsViewer').classList.contains('open')) return;
      sizeCanvas();
      fit();
      markDirty();
    });

    // Wire "Open in Viewer" modal button
    document.getElementById('mOpenViewer').addEventListener('click', () => {
      const m = window._activeModalMotif;
      if (!m) return;
      closeModal();
      openXsViewer(m.motif, m.isJson);
    });
  }

  // Run after DOM is parsed
  document.addEventListener('DOMContentLoaded', initViewer);
  // Also try immediately in case DOM is already ready
  if (document.readyState !== 'loading') initViewer();
})();
</script>
```

- [ ] **Step 2: Wire `_activeModalMotif` in `openModal` and `openJsonModal`**

Find the `openModal` function (around line 818) and add one line before `modalBg.classList.add('open')`:

```javascript
function openModal(m) {
  activeMotif = m;
  activeJsonMotif = null;
  document.getElementById('mTitle').textContent = m.name;
  document.getElementById('mTitleEn').textContent = m.nameEn;
  document.getElementById('mMeta').textContent = `${m.tradition.replace('-',' ')} · ${m.gridW}×${m.gridH} cells · ${m.tradition === 'bosnian' ? '1 color' : '3 colors'}`;
  document.getElementById('mDesc').textContent = m.desc;
  document.getElementById('mConstruct').textContent = m.notes;
  const mc = document.getElementById('mCanvas');
  renderMotif(mc, m, cellPxForModal(m));
  window._activeModalMotif = { motif: m, isJson: false };  // ADD THIS LINE
  document.getElementById('mOpenViewer').classList.add('visible');  // ADD THIS LINE
  modalBg.classList.add('open');
}
```

Find the `openJsonModal` function (around line 833) and add similarly:

```javascript
function openJsonModal(m) {
  activeJsonMotif = m;
  activeMotif = null;
  document.getElementById('mTitle').textContent = m.name.replace(/_/g, ' ');
  document.getElementById('mTitleEn').textContent = `${m.stitchWidth}×${m.stitchHeight} cells · cell ${m.cellSizePx}px · ${m.colors.length} colors`;
  document.getElementById('mMeta').textContent = 'generated · image_to_motif.py';
  document.getElementById('mDesc').textContent = `Source: ${m.source}`;
  const colorSwatches = m.colors.map((c, i) =>
    `#${i} ${c.hexValue}`
  ).join('  ·  ');
  document.getElementById('mConstruct').textContent = colorSwatches;
  const mc = document.getElementById('mCanvas');
  renderJsonMotif(mc, m, cellPxForJsonModal(m));
  window._activeModalMotif = { motif: m, isJson: true };  // ADD THIS LINE
  document.getElementById('mOpenViewer').classList.add('visible');  // ADD THIS LINE
  modalBg.classList.add('open');
}
```

Also add this line to `closeModal` to hide the button:

```javascript
function closeModal() {
  modalBg.classList.remove('open');
  activeMotif = null;
  activeJsonMotif = null;
  document.getElementById('mOpenViewer').classList.remove('visible');  // ADD THIS LINE
  window._activeModalMotif = null;  // ADD THIS LINE
}
```

- [ ] **Step 3: Verify full flow**

Reload the page. Click any motif card — the modal should show an "Open in cross-stitch viewer" button. Click it. Expected:
- Modal closes
- Viewer opens full-screen with the motif rendered as colored squares (at small default view)
- Dark toolbar shows motif name, zoom %, "Select", "Fit", "✕ Close" buttons
- Ruler labels visible along top and left edges
- Pressing Escape closes the viewer and returns to the motif browser

- [ ] **Step 4: Verify zoom and pan**

With the viewer open:
- Scroll the mouse wheel — motif should zoom centered on the cursor
- Click and drag — motif should pan
- Click "Fit" button — motif re-centers to fill the screen
- Zoom in until cells are large (scale > 800%) — cells should switch from solid squares to X shapes

- [ ] **Step 5: Verify select mode**

Click "Select" button (turns red/active). Click and drag across the motif — a red rectangle appears. On mouseup, the bottom info bar shows "Selected: W×H" plus per-color stitch counts. Click "Pan" to return to pan mode; selection and info bar disappear.

- [ ] **Step 6: Verify touch (if available)**

On a touch device or Chrome DevTools mobile emulation:
- Single-finger drag → pans
- Two-finger pinch → zooms (centered on pinch midpoint)
- In select mode, single-finger drag → draws selection rectangle

- [ ] **Step 7: Commit**

```bash
git add p5stuff/motif_browser.html
git commit -m "feat(viewer): add cross-stitch viewer with X rendering, pan/zoom, rulers, batch selector"
```

---

## Self-review checklist

- [x] **Spec coverage**
  - Fullscreen overlay: ✓ (`#xsViewer position:fixed`)
  - "Open in Viewer" button in both modal types: ✓ (Task 3, Step 2)
  - X-shape rendering: ✓ (`useX = cp >= X_THRESHOLD`)
  - LOD (solid squares when zoomed out): ✓ (`cp < X_THRESHOLD → fillRect`)
  - White background + subtle grid: ✓ (`#ffffff` fill + `#e8e8e8` grid lines)
  - Mouse wheel zoom centered on cursor: ✓ (`zoomAt` function)
  - Mouse drag pan: ✓ (`onMouseDown/Move/Up`)
  - Touch drag pan: ✓ (`onTouchStart/Move/End`)
  - Pinch zoom: ✓ (stitch-point-fixed zoom in `onTouchMove`)
  - Sidebar collapse: ✓ (`body.viewer-open` CSS)
  - Ruler labels every N stitches (auto-scaling): ✓ (`rulerStep`, `updateRulers`)
  - Batch selector with per-color counts: ✓ (`updateInfoBar`)
  - Escape to close, 0 to fit: ✓ (keydown listener)
  - Works for both function-based and JSON motifs: ✓ (`normalize`)

- [x] **No placeholders** — all steps contain full code

- [x] **Type/name consistency**
  - `openXsViewer` exposed on `window` and called from modal button: ✓
  - `closeModal` referenced in viewer `click` handler — defined earlier in the file: ✓
  - `pal` global referenced in `normalize` — defined earlier in the file: ✓
  - `dragState.px0 / py0` written in `onMouseDown`, read in `onMouseMove`: ✓
  - `pinchState.stitchC / stitchR / initScale / dist` set in `onTouchStart`, read in `onTouchMove`: ✓
