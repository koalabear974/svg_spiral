# Motif Viewer Mark-Done Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a paint-brush mark-done mode to `app/motif_viewer.html` that lets users sweep their finger/cursor across stitches to mark them done with a grey overlay, persisting progress per motif in localStorage.

**Architecture:** All changes are self-contained in `app/motif_viewer.html` (single HTML file with inline JS/CSS). A new `mode = 'mark'` joins the existing pan/select modes. Done state is a `Set<"c,r">` stored in localStorage. Rendering adds a second pass that overlays grey on done cells.

**Tech Stack:** Vanilla JS, Canvas 2D API, localStorage. No build step. No test framework — verify manually in browser at `http://localhost:3000/motif_viewer.html`.

**Spec:** `docs/superpowers/specs/2026-06-04-motif-viewer-mark-done-design.md`

---

### Task 1: HTML & CSS — toolbar buttons and progress badge

**Files:**
- Modify: `app/motif_viewer.html` (HTML section ~line 216–249, CSS section ~line 7–212)

- [ ] **Step 1: Add Mark and Clear buttons to the toolbar HTML**

Find this block in the toolbar (around line 221):
```html
  <button class="xs-btn" id="xsModeBtn">Select</button>
  <button class="xs-btn" id="xsSymBtn">Symbols</button>
```

Replace with:
```html
  <button class="xs-btn" id="xsModeBtn">Select</button>
  <button class="xs-btn" id="xsMarkBtn">Mark</button>
  <button class="xs-btn xs-btn-clear" id="xsClearBtn">Clear</button>
  <button class="xs-btn" id="xsSymBtn">Symbols</button>
```

- [ ] **Step 2: Add the progress badge div inside `#xsMain`**

After the `#xsColorModal` div (around line 240):
```html
  <div id="xsColorModal">
    <div id="xsColorModalSwatch"></div>
    <div id="xsColorModalHex"></div>
    <div id="xsColorModalHint">tap anywhere to close</div>
  </div>
```

Add immediately after it:
```html
  <div id="xsProgress"></div>
```

- [ ] **Step 3: Add CSS for Clear button and progress badge**

Add after the existing `.xs-btn.active` rule (around line 28):
```css
#xsClearBtn { display: none; }
#xsClearBtn.visible { display: inline-block; }

#xsProgress {
  position: absolute; bottom: 16px; left: 16px;
  background: rgba(30,18,10,0.92); color: #f5f0e8;
  border-radius: 10px; padding: 10px 12px;
  display: none; z-index: 20;
  box-shadow: 0 4px 24px rgba(0,0,0,0.35);
  backdrop-filter: blur(4px);
  font-size: 0.78rem; white-space: nowrap;
}
#xsProgress.visible { display: block; }
```

- [ ] **Step 4: Add mobile tweak for Clear button inside `@media (max-width: 600px)`**

Inside the existing `@media (max-width: 600px)` block (around line 193), add:
```css
  #xsClearBtn.visible { display: inline-block; padding: 10px 8px; }
  #xsProgress { bottom: 8px; left: 8px; }
```

- [ ] **Step 5: Commit**

```bash
git add app/motif_viewer.html
git commit -m "feat(viewer): add Mark/Clear buttons and progress badge HTML+CSS"
```

---

### Task 2: State variables and persistence functions

**Files:**
- Modify: `app/motif_viewer.html` (JS section, ~line 258–270 for state vars, anywhere before `loadMotif`)

- [ ] **Step 1: Add state variables after the existing `let longPressOrigin = null;` line (~line 266)**

```js
  let doneSet = new Set();
  let saveTimer = null;
  let paintDir = null; // true = marking done, false = unmarking
```

- [ ] **Step 2: Add persistence functions after the `buildColorSymbols()` function (~line 293)**

```js
  function progressKey() {
    return 'xs-progress-' + xm.name;
  }

  function saveProgress() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (doneSet.size === 0) {
        localStorage.removeItem(progressKey());
      } else {
        localStorage.setItem(progressKey(), JSON.stringify([...doneSet]));
      }
    }, 300);
  }

  function loadProgress() {
    doneSet = new Set();
    const raw = localStorage.getItem(progressKey());
    if (raw) {
      try { doneSet = new Set(JSON.parse(raw)); } catch (e) {}
    }
  }

  function clearProgress() {
    if (!confirm('Clear all progress?')) return;
    doneSet = new Set();
    if (saveTimer) clearTimeout(saveTimer);
    localStorage.removeItem(progressKey());
    updateProgressBadge();
    markDirty();
  }
```

- [ ] **Step 3: Add `updateProgressBadge()` after `clearProgress()`**

```js
  function updateProgressBadge() {
    if (!xm) return;
    const badge = document.getElementById('xsProgress');
    let total = 0, done = 0;
    for (let r = 0; r < xm.rows; r++) {
      for (let c = 0; c < xm.cols; c++) {
        const hex = xm.cell(c, r);
        if (hiddenColors.has(hex)) continue;
        total++;
        if (doneSet.has(c + ',' + r)) done++;
      }
    }
    badge.textContent = done + ' / ' + total + ' stitched';
    badge.classList.toggle('visible', doneSet.size > 0 || mode === 'mark');
  }
```

- [ ] **Step 4: Commit**

```bash
git add app/motif_viewer.html
git commit -m "feat(viewer): add mark-done state variables and localStorage persistence"
```

---

### Task 3: Mode toggle, Clear button, and Select mode deactivation

**Files:**
- Modify: `app/motif_viewer.html` (JS `init()` function, ~line 764+)

- [ ] **Step 1: Add a helper to deactivate mark mode appearance**

Add this function just before the `init()` function:
```js
  function deactivateMarkMode() {
    document.getElementById('xsMarkBtn').classList.remove('active');
    document.getElementById('xsClearBtn').classList.remove('visible');
    document.getElementById('xsCanvas').classList.remove('xs-select');
  }
```

- [ ] **Step 2: Wire up the Mark button in `init()`**

Add this block after the `xsModeBtn` click listener in `init()` (around line 798):
```js
    document.getElementById('xsMarkBtn').addEventListener('click', () => {
      if (mode === 'mark') {
        mode = 'pan';
        deactivateMarkMode();
      } else {
        mode = 'mark';
        // exit select if active
        sel = null;
        document.getElementById('xsInfoBar').classList.remove('active');
        document.getElementById('xsMarkBtn').classList.add('active');
        document.getElementById('xsClearBtn').classList.add('visible');
        document.getElementById('xsCanvas').classList.add('xs-select');
      }
      updateProgressBadge();
      markDirty();
    });

    document.getElementById('xsClearBtn').addEventListener('click', clearProgress);
```

- [ ] **Step 3: Update the existing `xsModeBtn` handler to deactivate mark mode**

Find the existing xsModeBtn listener (around line 798):
```js
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
```

Replace with:
```js
    document.getElementById('xsModeBtn').addEventListener('click', () => {
      const wasInMark = mode === 'mark';
      mode = (mode === 'select') ? 'pan' : 'select';
      if (wasInMark) deactivateMarkMode();
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
```

- [ ] **Step 4: Verify manually**

Open `http://localhost:3000/motif_viewer.html` (first navigate to motif browser, open a motif). Click "Mark" — button turns red, cursor changes to crosshair. Click "Mark" again — button un-highlights. Click "Select" while in Mark mode — mark deactivates, Select activates. Confirm "Clear" button only visible when in Mark mode.

- [ ] **Step 5: Commit**

```bash
git add app/motif_viewer.html
git commit -m "feat(viewer): wire up mark mode toggle and clear button"
```

---

### Task 4: Mouse interaction for mark mode

**Files:**
- Modify: `app/motif_viewer.html` (functions `onMouseDown`, `onMouseMove`, `onMouseUp`, ~lines 626–661)

- [ ] **Step 1: Replace `onMouseDown` to handle mark mode**

Find `function onMouseDown(e) {` (~line 626) and replace the entire function:
```js
  function onMouseDown(e) {
    if (!xm || e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    if (mode === 'select') {
      const { c, r } = screenToStitch(sx, sy);
      dragState = { type: 'select', startC: c, startR: r };
      sel = { c1: c, r1: r, c2: c, r2: r };
      document.getElementById('xsInfoBar').classList.remove('active');
    } else if (mode === 'mark') {
      const { c, r } = screenToStitch(sx, sy);
      const key = c + ',' + r;
      const hex = xm.cell(c, r);
      if (!hiddenColors.has(hex)) {
        paintDir = !doneSet.has(key);
        if (paintDir) doneSet.add(key); else doneSet.delete(key);
        updateProgressBadge();
        markDirty();
      }
      dragState = { type: 'mark' };
    } else {
      dragState = { type: 'pan', startX: sx, startY: sy, px0: panX, py0: panY };
    }
    e.currentTarget.classList.add('xs-dragging');
  }
```

- [ ] **Step 2: Replace `onMouseMove` to handle mark mode painting**

Find `function onMouseMove(e) {` (~line 641) and replace the entire function:
```js
  function onMouseMove(e) {
    if (!dragState || !xm) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    if (dragState.type === 'pan') {
      panX = dragState.px0 + (sx - dragState.startX);
      panY = dragState.py0 + (sy - dragState.startY);
    } else if (dragState.type === 'mark') {
      const { c, r } = screenToStitch(sx, sy);
      const key = c + ',' + r;
      const hex = xm.cell(c, r);
      if (!hiddenColors.has(hex) && paintDir !== null) {
        const changed = paintDir ? !doneSet.has(key) : doneSet.has(key);
        if (changed) {
          if (paintDir) doneSet.add(key); else doneSet.delete(key);
          updateProgressBadge();
        }
      }
    } else {
      const { c, r } = screenToStitch(sx, sy);
      sel = { c1: dragState.startC, r1: dragState.startR, c2: c, r2: r };
    }
    markDirty();
  }
```

- [ ] **Step 3: Replace `onMouseUp` to save after mark stroke**

Find `function onMouseUp(e) {` (~line 655) and replace the entire function:
```js
  function onMouseUp(e) {
    if (!dragState) return;
    const wasSel = dragState.type === 'select';
    const wasMark = dragState.type === 'mark';
    dragState = null;
    paintDir = null;
    e.currentTarget.classList.remove('xs-dragging');
    if (wasSel && sel) updateInfoBar();
    if (wasMark) saveProgress();
  }
```

- [ ] **Step 4: Verify manually**

Open a motif. Enter Mark mode. Click a cell — it turns grey. Drag across multiple cells — all turn grey. Click a done cell — it un-marks. Drag across done cells — all un-mark. Leave Mark mode and re-enter — grey overlay persists.

- [ ] **Step 5: Commit**

```bash
git add app/motif_viewer.html
git commit -m "feat(viewer): mouse paint interaction for mark-done mode"
```

---

### Task 5: Touch interaction for mark mode

**Files:**
- Modify: `app/motif_viewer.html` (functions `onTouchStart`, `onTouchMove`, `onTouchEnd`, ~lines 667–762)

- [ ] **Step 1: Replace `onTouchStart` to handle mark mode**

Find `function onTouchStart(e) {` (~line 667) and replace the entire function:
```js
  function onTouchStart(e) {
    if (!xm) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.touches.length === 1) {
      pinchState = null;
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
      const sx = e.touches[0].clientX - rect.left;
      const sy = e.touches[0].clientY - rect.top;
      if (mode === 'select') {
        const { c, r } = screenToStitch(sx, sy);
        dragState = { type: 'select', startC: c, startR: r };
        sel = { c1: c, r1: r, c2: c, r2: r };
        document.getElementById('xsInfoBar').classList.remove('active');
      } else if (mode === 'mark') {
        const { c, r } = screenToStitch(sx, sy);
        const key = c + ',' + r;
        const hex = xm.cell(c, r);
        if (!hiddenColors.has(hex)) {
          paintDir = !doneSet.has(key);
          if (paintDir) doneSet.add(key); else doneSet.delete(key);
          updateProgressBadge();
          markDirty();
        }
        dragState = { type: 'mark' };
      } else {
        dragState = { type: 'pan', startX: sx, startY: sy, px0: panX, py0: panY };
        longPressOrigin = { sx, sy };
        longPressTimer = setTimeout(() => {
          longPressTimer = null;
          const { c, r } = screenToStitch(longPressOrigin.sx, longPressOrigin.sy);
          dragState = { type: 'select', startC: c, startR: r };
          sel = { c1: c, r1: r, c2: c, r2: r };
          document.getElementById('xsInfoBar').classList.remove('active');
          const canvas = document.getElementById('xsCanvas');
          canvas.style.outline = '3px solid rgba(180,40,40,0.5)';
          setTimeout(() => { canvas.style.outline = ''; }, 200);
          if (navigator.vibrate) navigator.vibrate(30);
          markDirty();
        }, 400);
      }
    } else if (e.touches.length === 2) {
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
      dragState = null;
      paintDir = null;
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

- [ ] **Step 2: Replace `onTouchMove` to handle mark mode painting**

Find `function onTouchMove(e) {` (~line 711) and replace the entire function:
```js
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
      if (dragState.type === 'mark') {
        const { c, r } = screenToStitch(sx, sy);
        const key = c + ',' + r;
        const hex = xm.cell(c, r);
        if (!hiddenColors.has(hex) && paintDir !== null) {
          const changed = paintDir ? !doneSet.has(key) : doneSet.has(key);
          if (changed) {
            if (paintDir) doneSet.add(key); else doneSet.delete(key);
            updateProgressBadge();
          }
        }
        markDirty();
      } else {
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
  }
```

- [ ] **Step 3: Replace `onTouchEnd` to save after mark stroke**

Find `function onTouchEnd(e) {` (~line 744) and replace the entire function:
```js
  function onTouchEnd(e) {
    e.preventDefault();
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    if (e.touches.length < 2) pinchState = null;
    if (e.touches.length === 0) {
      const wasSel = dragState && dragState.type === 'select';
      const wasMark = dragState && dragState.type === 'mark';
      const wasTap = dragState && dragState.type === 'pan' &&
        panX === dragState.px0 && panY === dragState.py0;
      dragState = null;
      paintDir = null;
      longPressOrigin = null;
      if (wasSel && sel) {
        updateInfoBar();
      } else if (wasMark) {
        saveProgress();
      } else if (wasTap && sel && mode !== 'select') {
        sel = null;
        document.getElementById('xsInfoBar').classList.remove('active');
        markDirty();
      }
    }
  }
```

- [ ] **Step 4: Commit**

```bash
git add app/motif_viewer.html
git commit -m "feat(viewer): touch paint interaction for mark-done mode"
```

---

### Task 6: Rendering overlay + load progress on motif load

**Files:**
- Modify: `app/motif_viewer.html` (functions `render`, `loadMotif`, `toggleColorVisibility`)

- [ ] **Step 1: Add the grey overlay render pass in `render()`**

In the `render()` function, find the end of the stitch rendering loop (the closing `}` of the `for (let r = r0; r <= r1; r++)` loop, around line 508) and the `if (sel)` block right after it.

Add the done-stitch overlay pass between the end of the stitch loop and the `if (sel)` block:
```js
    // Done-stitch overlay
    if (doneSet.size > 0) {
      ctx.fillStyle = 'rgba(180, 180, 180, 0.55)';
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          if (doneSet.has(c + ',' + r)) {
            ctx.fillRect(panX + c * cp, panY + r * cp, cp, cp);
          }
        }
      }
    }
```

- [ ] **Step 2: Call `loadProgress()` and `updateProgressBadge()` in `loadMotif()`**

Find `loadMotif()` (~line 388). After `buildColorSymbols()` and `buildLegend()`, add:
```js
    loadProgress();
```

And after `markDirty()` at the end of `loadMotif()`, add:
```js
    updateProgressBadge();
```

So the end of `loadMotif()` looks like:
```js
    buildColorSymbols();
    loadProgress();
    buildLegend();
    sizeCanvas();
    fit();
    markDirty();
    updateProgressBadge();
```

- [ ] **Step 3: Call `updateProgressBadge()` when hidden colors change**

In `toggleColorVisibility()` (~line 336), add a call to `updateProgressBadge()` at the end:
```js
  function toggleColorVisibility(hex, item) {
    const btn = item.querySelector('.xs-leg-vis');
    if (hiddenColors.has(hex)) {
      hiddenColors.delete(hex);
      item.classList.remove('hidden-color');
      if (btn) btn.textContent = 'hide';
    } else {
      hiddenColors.add(hex);
      item.classList.add('hidden-color');
      if (btn) btn.textContent = 'show';
    }
    updateToggleAllBtn();
    updateProgressBadge();
    markDirty();
  }
```

Also add `updateProgressBadge()` in the `xsLegToggleAll` handler (~line 834), after the `updateToggleAllBtn()` call:
```js
      updateToggleAllBtn();
      updateProgressBadge();
      markDirty();
```

- [ ] **Step 4: Verify the full feature end-to-end**

1. Open a motif in the viewer.
2. Click "Mark" — mode activates, badge shows "0 / N stitched".
3. Paint several stitches — they grey out, badge count increments.
4. Reload the page and reopen the same motif — progress is restored automatically, badge shows correct count.
5. Enter Mark mode, click "Clear", confirm — all grey disappears, localStorage entry is gone.
6. Hide a color from the legend — total count updates to exclude that color.
7. Test on mobile: touch-and-drag marks stitches; pinch-to-zoom works without marking.

- [ ] **Step 5: Commit**

```bash
git add app/motif_viewer.html
git commit -m "feat(viewer): grey overlay render pass, auto-restore progress, hidden color sync"
```

---

## Spec Coverage Check

| Spec requirement | Task |
|---|---|
| Set of "c,r" strings in localStorage | Task 2 |
| Key `xs-progress-<motifName>` | Task 2 |
| Auto-restore on load | Task 6 |
| Debounced save ~300ms | Task 2 |
| Clear deletes key | Task 2 |
| Mark button in toolbar | Task 1 |
| Mark mode cursor crosshair | Task 3 (adds `xs-select` class) |
| Clear button visible only in mark mode | Task 1 (CSS) + Task 3 (JS) |
| confirm() on clear | Task 2 |
| Mouse paint direction from first cell | Task 4 |
| Hidden cells not markable | Task 4 + Task 5 |
| Touch paint (touchstart + touchmove) | Task 5 |
| 2-finger pinch cancels paint | Task 5 (sets `paintDir = null` on 2-touch) |
| Long-press disabled in mark mode | Task 5 (no longPressTimer set in mark branch) |
| `rgba(180,180,180,0.55)` grey overlay | Task 6 |
| Progress badge bottom-left | Task 1 |
| Badge shows done/total | Task 2 |
| Badge visible when `doneSet.size > 0` or in mark mode | Task 2 |
| Hidden colors excluded from total | Task 2 + Task 6 |
| Badge updates on hide/show color | Task 6 |
