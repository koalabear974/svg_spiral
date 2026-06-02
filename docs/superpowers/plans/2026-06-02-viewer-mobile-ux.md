# Viewer Mobile UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the cross-stitch viewer touch-friendly (bigger tap targets, zoom buttons, long-press selection) and sort generated motifs first in the browser grid.

**Architecture:** All changes in `p5stuff/motif_browser.html`. CSS media queries handle toolbar/button sizing. Two `+`/`−` zoom buttons are added to the toolbar HTML and wired in JS. Long-press logic uses a 400ms timer added to existing touch handlers. `buildCards()` loop order is reversed so IMPORTED_MOTIFS render first.

**Tech Stack:** Vanilla JS, CSS media queries, Canvas 2D, no dependencies.

---

## File changes

- Modify: `p5stuff/motif_browser.html`
  - Add mobile CSS inside `<style>` (after existing viewer CSS, before `</style>`)
  - Add zoom buttons to `#xsToolbar` HTML
  - Add `longPressTimer` / `longPressOrigin` state vars to IIFE
  - Replace `onTouchStart`, `onTouchMove`, `onTouchEnd` with long-press-aware versions
  - Wire `xsZoomIn` / `xsZoomOut` in `initViewer()`
  - Swap loop order in `buildCards()`

---

## Task 1: Mobile CSS

**Files:**
- Modify: `p5stuff/motif_browser.html` — add before `</style>`

- [ ] **Step 1: Add mobile CSS**

Find `</style>` (currently around line 173) and insert this block immediately before it:

```css
/* ─── Mobile / touch improvements ──────────────────────────── */
@media (max-width: 600px) {
  #xsToolbar { height: 56px; gap: 6px; padding: 0 10px; }
  .xs-btn { padding: 10px 12px; font-size: 0.82rem; }
  #mOpenViewer { display: none; width: 100%; text-align: center; }
  #mOpenViewer.visible { display: block; }
  .xs-btn-zoom { display: inline-block; }
}
@media (min-width: 601px) {
  .xs-btn-zoom { display: none; }
}
@media (max-width: 400px) {
  #xsZoomPct { display: none; }
}
```

- [ ] **Step 2: Verify**

Open `p5stuff/motif_browser.html` in Chrome DevTools with device emulation (e.g. iPhone 12, 390px wide). Inspect `#xsToolbar` — expected: `height: 56px`. Inspect `.xs-btn` — expected: `padding: 10px 12px`. Desktop view (>600px): `.xs-btn` should have original padding.

- [ ] **Step 3: Commit**

```bash
git add p5stuff/motif_browser.html
git commit -m "feat(mobile): add responsive CSS for viewer toolbar and buttons"
```

---

## Task 2: Zoom buttons HTML + JS wiring

**Files:**
- Modify: `p5stuff/motif_browser.html` — toolbar HTML + initViewer()

- [ ] **Step 1: Add zoom buttons to toolbar HTML**

Find this block in the HTML (around line 1386–1391):
```html
  <div id="xsToolbar">
    <span id="xsMotifName"></span>
    <span id="xsZoomPct">100%</span>
    <button class="xs-btn" id="xsModeBtn">Select</button>
    <button class="xs-btn" id="xsFitBtn">Fit</button>
    <button class="xs-btn" id="xsCloseBtn">✕ Close</button>
  </div>
```

Replace with:
```html
  <div id="xsToolbar">
    <span id="xsMotifName"></span>
    <span id="xsZoomPct">100%</span>
    <button class="xs-btn xs-btn-zoom" id="xsZoomOut">−</button>
    <button class="xs-btn xs-btn-zoom" id="xsZoomIn">+</button>
    <button class="xs-btn" id="xsModeBtn">Select</button>
    <button class="xs-btn" id="xsFitBtn">Fit</button>
    <button class="xs-btn" id="xsCloseBtn">✕ Close</button>
  </div>
```

- [ ] **Step 2: Wire zoom buttons in initViewer()**

Find the `initViewer()` function. After the line `document.getElementById('xsCloseBtn').addEventListener('click', closeXsViewer);`, add:

```javascript
    document.getElementById('xsZoomIn').addEventListener('click', () => {
      if (!xm) return;
      const canvas = document.getElementById('xsCanvas');
      zoomAt(1.5, canvas.width / 2, canvas.height / 2);
    });

    document.getElementById('xsZoomOut').addEventListener('click', () => {
      if (!xm) return;
      const canvas = document.getElementById('xsCanvas');
      zoomAt(1 / 1.5, canvas.width / 2, canvas.height / 2);
    });
```

- [ ] **Step 3: Verify**

Open in mobile emulation. The toolbar should show `−` and `+` buttons. Tap `+` — motif zooms in centered on canvas. Tap `−` — zooms out. On desktop (>600px) the buttons should be hidden.

- [ ] **Step 4: Commit**

```bash
git add p5stuff/motif_browser.html
git commit -m "feat(mobile): add zoom +/- buttons to viewer toolbar"
```

---

## Task 3: Long-press selection

**Files:**
- Modify: `p5stuff/motif_browser.html` — IIFE state vars + touch handlers

- [ ] **Step 1: Add long-press state variables**

Find this block in the IIFE (around line 956–958):
```javascript
  let dirty = false;
  let dragState = null;
  let pinchState = null;
```

Replace with:
```javascript
  let dirty = false;
  let dragState = null;
  let pinchState = null;
  let longPressTimer = null;
  let longPressOrigin = null;
```

- [ ] **Step 2: Replace onTouchStart**

Find the entire `onTouchStart` function and replace it:

```javascript
  function onTouchStart(e) {
    if (!xm) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.touches.length === 1) {
      pinchState = null;
      // Clear any running long-press timer
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
      const sx = e.touches[0].clientX - rect.left;
      const sy = e.touches[0].clientY - rect.top;
      if (mode === 'select') {
        const { c, r } = screenToStitch(sx, sy);
        dragState = { type: 'select', startC: c, startR: r };
        sel = { c1: c, r1: r, c2: c, r2: r };
        document.getElementById('xsInfoBar').classList.remove('active');
      } else {
        // Start pan immediately; also arm long-press timer for selection
        dragState = { type: 'pan', startX: sx, startY: sy, px0: panX, py0: panY };
        longPressOrigin = { sx, sy };
        longPressTimer = setTimeout(() => {
          longPressTimer = null;
          // Switch to select mode and start selection at the original touch point
          const { c, r } = screenToStitch(longPressOrigin.sx, longPressOrigin.sy);
          dragState = { type: 'select', startC: c, startR: r };
          sel = { c1: c, r1: r, c2: c, r2: r };
          document.getElementById('xsInfoBar').classList.remove('active');
          // Flash canvas border as visual feedback
          const canvas = document.getElementById('xsCanvas');
          canvas.style.outline = '3px solid rgba(180,40,40,0.5)';
          setTimeout(() => { canvas.style.outline = ''; }, 200);
          if (navigator.vibrate) navigator.vibrate(30);
          markDirty();
        }, 400);
      }
    } else if (e.touches.length === 2) {
      // Cancel long-press on second finger
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
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
```

- [ ] **Step 3: Replace onTouchMove**

Find the entire `onTouchMove` function and replace it:

```javascript
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
      // Cancel long-press if finger moved more than 8px
      if (longPressTimer && longPressOrigin) {
        const dx = sx - longPressOrigin.sx, dy = sy - longPressOrigin.sy;
        if (Math.hypot(dx, dy) > 8) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }
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
```

- [ ] **Step 4: Replace onTouchEnd**

Find the entire `onTouchEnd` function and replace it:

```javascript
  function onTouchEnd(e) {
    e.preventDefault();
    // Cancel any pending long-press
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    if (e.touches.length < 2) pinchState = null;
    if (e.touches.length === 0) {
      const wasSel = dragState && dragState.type === 'select';
      const wasTap = dragState && dragState.type === 'pan' &&
        panX === dragState.px0 && panY === dragState.py0;
      dragState = null;
      longPressOrigin = null;
      if (wasSel && sel) {
        updateInfoBar();
      } else if (wasTap && sel && mode !== 'select') {
        // Tap on canvas while selection visible → clear it
        sel = null;
        document.getElementById('xsInfoBar').classList.remove('active');
        markDirty();
      }
    }
  }
```

- [ ] **Step 5: Verify**

Open in mobile emulation. Long-press (hold ~500ms without moving) on the motif — expected: brief red outline flash, vibration if device supports it, selection mode activates, dragging now draws a selection rectangle. Normal tap-and-drag should still pan. Tap canvas while selection visible — selection clears.

- [ ] **Step 6: Commit**

```bash
git add p5stuff/motif_browser.html
git commit -m "feat(mobile): add long-press selection gesture to viewer"
```

---

## Task 4: Generated motifs first in browser grid

**Files:**
- Modify: `p5stuff/motif_browser.html` — `buildCards()` function (line 793)

- [ ] **Step 1: Swap loop order in buildCards()**

Find the entire `buildCards` function (lines 793–851) and replace it:

```javascript
function buildCards() {
  grid.innerHTML = '';

  for (const m of [...(window.IMPORTED_MOTIFS || [])].reverse()) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.tradition = 'generated';
    card._jsonMotif = m;

    const wrap = document.createElement('div');
    wrap.className = 'card-canvas-wrap';
    const canvas = document.createElement('canvas');
    renderJsonMotif(canvas, m, cellPxForJsonCard(m));
    wrap.appendChild(canvas);

    const info = document.createElement('div');
    info.className = 'card-info';
    const colorDots = m.colors.map(c =>
      `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c.hexValue};margin-right:2px;border:1px solid #ccc"></span>`
    ).join('');
    info.innerHTML = `
      <div class="card-name">${m.name.replace(/_/g,' ')}</div>
      <div class="card-name-en">${m.stitchWidth}×${m.stitchHeight} cells · ${m.colors.length} colors</div>
      <span class="badge t-generated">generated</span>
      <div style="margin-top:6px">${colorDots}</div>
    `;

    card.appendChild(wrap);
    card.appendChild(info);
    card.addEventListener('click', () => openJsonModal(m));
    grid.appendChild(card);
  }

  for (const m of MOTIFS) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.tradition = m.tradition;
    card._motif = m;

    const wrap = document.createElement('div');
    wrap.className = 'card-canvas-wrap';
    const canvas = document.createElement('canvas');
    renderMotif(canvas, m, cellPxForCard(m));
    wrap.appendChild(canvas);

    const info = document.createElement('div');
    info.className = 'card-info';
    info.innerHTML = `
      <div class="card-name">${m.name}</div>
      <div class="card-name-en">${m.nameEn}</div>
      <span class="badge t-${m.tradition}">${m.tradition.replace('-',' ')}</span>
    `;

    card.appendChild(wrap);
    card.appendChild(info);
    card.addEventListener('click', () => openModal(m));
    grid.appendChild(card);
  }
}
```

- [ ] **Step 2: Verify**

Reload the page. If `IMPORTED_MOTIFS` has any entries (from `motifs/motifs.js`), they should appear before the hardcoded motifs in the grid. The "Generated" filter pill should still show only generated cards. The "All" filter should show everything.

- [ ] **Step 3: Commit**

```bash
git add p5stuff/motif_browser.html
git commit -m "feat(browser): show latest generated motifs first in grid"
```

---

## Self-review

- [x] **Spec coverage**
  - Toolbar height 56px on mobile ≤600px: ✓ Task 1
  - Button padding ≥44px tap targets on mobile: ✓ Task 1 (`padding: 10px 12px`)
  - Zoom % hidden on ≤400px: ✓ Task 1
  - `+`/`−` zoom buttons visible on mobile only: ✓ Tasks 1 + 2
  - Zoom buttons zoom centered on canvas midpoint: ✓ Task 2 (`canvas.width/2, canvas.height/2`)
  - Long-press 400ms → select mode: ✓ Task 3
  - Long-press cancelled if moved >8px: ✓ Task 3 `onTouchMove`
  - Visual flash feedback on long-press: ✓ Task 3 (`canvas.style.outline`)
  - Vibration feedback: ✓ Task 3 (`navigator.vibrate(30)`)
  - Tap to clear selection: ✓ Task 3 `onTouchEnd` (`wasTap && sel`)
  - "Open in viewer" button full-width on mobile: ✓ Task 1
  - Generated motifs first (reversed): ✓ Task 4

- [x] **No placeholders** — all steps have complete code

- [x] **Name consistency**
  - `longPressTimer` declared in Task 3 Step 1, used in Steps 2/3/4: ✓
  - `longPressOrigin` declared in Task 3 Step 1, used in Steps 2/3/4: ✓
  - `zoomAt(factor, cx, cy)` called in Task 2 — defined in existing IIFE: ✓
  - `touchDist` called in Task 3 — defined in existing IIFE: ✓
  - `screenToStitch`, `markDirty`, `updateInfoBar` called in Task 3 — defined in existing IIFE: ✓
