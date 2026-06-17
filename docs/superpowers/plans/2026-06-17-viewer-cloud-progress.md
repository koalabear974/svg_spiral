# Viewer Cloud Progress Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sync cross-stitch stitching progress to Vercel Blob so it's accessible across devices, with conflict resolution when both local and cloud saves exist.

**Architecture:** A new `app/api/progress.js` serverless function handles GET (read from Blob) and PUT (write to Blob) for progress data keyed by motif name. The viewer's `loadMotif()` is made async — it loads localStorage immediately, then fetches cloud in parallel, and shows a modal if both are non-empty. Uploading happens when exiting mark mode. A status pill in the toolbar shows save state.

**Tech Stack:** Vanilla JS, Vercel Blob (existing `BLOB_READ_WRITE_TOKEN`), Node.js serverless (same pattern as `app/api/save.js`)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `app/api/progress.js` | Create | GET + PUT handler for `progress/{name}.json` in Vercel Blob |
| `app/motif_viewer.html` | Modify | Add sync modal HTML+CSS, pill HTML+CSS, cloud load/upload JS |

`app/vercel.json` does NOT need changes — Vercel auto-routes files under `app/api/` at `/api/*`.

---

### Task 1: Create `/api/progress` endpoint

**Files:**
- Create: `app/api/progress.js`

- [ ] **Step 1: Create the file**

```javascript
'use strict';

function storeIdFromToken(token) {
  const parts = token.split('_');
  const raw = parts[3] || '';
  return raw.startsWith('store_') ? raw.slice(6) : raw;
}

module.exports = async (req, res) => {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not set' });
  const storeId = storeIdFromToken(token);

  if (req.method === 'GET') {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'name required' });
    const safe = name.replace(/[^a-z0-9_-]/gi, '_');
    try {
      const r = await fetch(
        `https://blob.vercel-storage.com/?prefix=${encodeURIComponent('progress/' + safe)}&limit=1`,
        { headers: { authorization: `Bearer ${token}`, 'x-vercel-blob-store-id': storeId, 'x-api-version': '12' } }
      );
      const { blobs = [] } = await r.json();
      if (!blobs.length) return res.json({ done: null });
      const data = await fetch(blobs[0].url, {
        headers: { authorization: `Bearer ${token}` },
      }).then(r => r.json());
      return res.json({ done: Array.isArray(data.done) ? data.done : null });
    } catch {
      return res.json({ done: null });
    }
  }

  if (req.method === 'PUT') {
    const { name, done } = req.body || {};
    if (!name || !Array.isArray(done)) return res.status(400).json({ error: 'name and done required' });
    const safe = name.replace(/[^a-z0-9_-]/gi, '_');
    try {
      const pathname = `progress/${safe}.json`;
      const r = await fetch(`https://blob.vercel-storage.com/?pathname=${encodeURIComponent(pathname)}`, {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${token}`,
          'x-vercel-blob-access': 'private',
          'x-content-type': 'application/json',
          'x-add-random-suffix': '0',
          'x-allow-overwrite': '1',
          'x-vercel-blob-store-id': storeId,
          'x-api-version': '12',
        },
        body: JSON.stringify({ done }),
      });
      if (!r.ok) throw new Error(`Blob API ${r.status}: ${await r.text()}`);
      return res.json({ saved: true });
    } catch (e) {
      return res.status(500).json({ error: `Save failed: ${e.message}` });
    }
  }

  return res.status(405).end();
};
```

- [ ] **Step 2: Verify the file exists and the server starts**

```bash
cd /Users/adrienrobert/gitrepo/svg_spiral/app
node -e "require('./api/progress.js'); console.log('ok')"
```
Expected: `ok` (no syntax errors).

- [ ] **Step 3: Commit**

```bash
git add app/api/progress.js
git commit -m "feat(api): add progress GET/PUT endpoint backed by Vercel Blob"
```

---

### Task 2: Add sync modal and status pill HTML + CSS to viewer

**Files:**
- Modify: `app/motif_viewer.html`

This task only touches HTML structure and CSS — no JS yet.

- [ ] **Step 1: Add `#xsSyncPill` to the toolbar**

In `app/motif_viewer.html`, find this line (around line 264):
```html
  <button class="xs-btn" id="xsFitBtn">Fit</button>
```
Replace with:
```html
  <button class="xs-btn" id="xsFitBtn">Fit</button>
  <span id="xsSyncPill"></span>
```

- [ ] **Step 2: Add `#xsSyncModal` to `#xsMain`**

Find (around line 282):
```html
  <div id="xsColorModal">
```
Add the following block immediately before that line:
```html
  <div id="xsSyncModal">
    <div id="xsSyncModalContent">
      <div id="xsSyncModalTitle">Progress found in two places</div>
      <div id="xsSyncModalCounts"></div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px">
        <button class="xs-btn" id="xsSyncUseLocal">Use local</button>
        <button class="xs-btn" id="xsSyncUseCloud">Use cloud</button>
        <button class="xs-btn" id="xsSyncPushCloud">Push local → cloud</button>
      </div>
    </div>
  </div>
```

- [ ] **Step 3: Add CSS for pill and modal**

In the `<style>` block, find this comment and rule (around line 94):
```css
/* ── Color legend ─────────────────────────────────────── */
```
Insert the following block immediately before that comment:
```css
/* ── Sync pill ────────────────────────────────────────── */
#xsSyncPill {
  font-size: 0.72rem; opacity: 0; transition: opacity 0.25s;
  font-family: system-ui, sans-serif; padding: 2px 8px;
  border-radius: 10px; white-space: nowrap; pointer-events: none;
}
#xsSyncPill.saving { opacity: 0.6; color: #f5f0e8; }
#xsSyncPill.saved  { opacity: 1;   color: #7dd285; }
#xsSyncPill.failed { opacity: 1;   color: #e07070; }

/* ── Sync conflict modal ──────────────────────────────── */
#xsSyncModal {
  position: absolute; inset: 0; z-index: 60;
  display: none; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.72);
}
#xsSyncModal.open { display: flex; }
#xsSyncModalContent {
  background: #2c1810; border-radius: 12px;
  padding: 24px 28px; display: flex; flex-direction: column;
  gap: 12px; max-width: 300px; width: 90%;
  box-shadow: 0 12px 60px rgba(0,0,0,0.5);
}
#xsSyncModalTitle {
  color: #f5f0e8; font-family: Georgia,serif; font-size: 0.95rem;
  text-align: center; line-height: 1.4;
}
#xsSyncModalCounts {
  color: rgba(245,240,232,0.55); font-size: 0.75rem;
  text-align: center;
}
```

- [ ] **Step 4: Verify HTML renders without errors**

Open `app/motif_viewer.html` in a browser (via the local dev server if running, or just check no JS console errors on load with no motif). The "No motif loaded" screen should show normally. The sync modal should be hidden.

- [ ] **Step 5: Commit**

```bash
git add app/motif_viewer.html
git commit -m "feat(viewer): add sync modal and save-pill HTML/CSS"
```

---

### Task 3: Add cloud load logic to viewer JS

**Files:**
- Modify: `app/motif_viewer.html` (JS section, inside the IIFE)

- [ ] **Step 1: Add `uploadProgress`, `setPillState`, `showSyncModal`, `hideSyncModal` functions**

In the JS IIFE, find the existing `saveProgress` function:
```javascript
  function saveProgress() {
```
Insert the following four new functions immediately before `saveProgress`:

```javascript
  let pillTimer = null;
  function setPillState(state) {
    const pill = document.getElementById('xsSyncPill');
    pill.className = state || '';
    if (state === 'saving') {
      pill.textContent = '⟳ Saving…';
    } else if (state === 'saved') {
      pill.textContent = '✓ Saved';
      if (pillTimer) clearTimeout(pillTimer);
      pillTimer = setTimeout(() => setPillState(null), 3000);
    } else if (state === 'failed') {
      pill.textContent = '✗ Save failed';
    } else {
      pill.textContent = '';
    }
  }

  async function uploadProgress() {
    if (!xm || doneSet.size === 0) return;
    setPillState('saving');
    try {
      const r = await fetch('/api/progress', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: xm.name, done: [...doneSet] }),
      });
      const data = await r.json();
      if (!r.ok || data.error) throw new Error(data.error || r.status);
      setPillState('saved');
    } catch {
      setPillState('failed');
    }
  }

  let _syncLocalArr = null, _syncCloudArr = null;

  function showSyncModal(localArr, cloudArr) {
    _syncLocalArr = localArr;
    _syncCloudArr = cloudArr;
    document.getElementById('xsSyncModalCounts').textContent =
      'Local: ' + localArr.length + ' stitches · Cloud: ' + cloudArr.length + ' stitches';
    document.getElementById('xsSyncModal').classList.add('open');
  }

  function hideSyncModal() {
    document.getElementById('xsSyncModal').classList.remove('open');
    _syncLocalArr = null;
    _syncCloudArr = null;
  }

```

- [ ] **Step 2: Make `loadMotif` async and add cloud fetch**

Find the existing `loadMotif` function. It currently starts with:
```javascript
  function loadMotif() {
    const raw = sessionStorage.getItem('xsViewerMotif');
    if (!raw) {
      document.getElementById('noMotif').classList.add('visible');
      return;
    }
    const data = JSON.parse(raw);
    xm = {
      name: data.name,
      cols: data.cols,
      rows: data.rows,
      colors: data.colors,
      bgColor: data.bgColor,
      cell(c, r) {
        return data.colors[Math.min(data.grid[r][c], data.colors.length - 1)];
      }
    };
    document.title = xm.name + ' — Cross-Stitch Viewer';
    document.getElementById('xsMotifName').textContent = xm.name;
    buildColorSymbols();
    loadProgress();
    buildLegend();
    sizeCanvas();
    fit();
    markDirty();
    updateProgressBadge();
  }
```

Replace the entire `loadMotif` function with:
```javascript
  async function loadMotif() {
    const raw = sessionStorage.getItem('xsViewerMotif');
    if (!raw) {
      document.getElementById('noMotif').classList.add('visible');
      return;
    }
    const data = JSON.parse(raw);
    xm = {
      name: data.name,
      cols: data.cols,
      rows: data.rows,
      colors: data.colors,
      bgColor: data.bgColor,
      cell(c, r) {
        return data.colors[Math.min(data.grid[r][c], data.colors.length - 1)];
      }
    };
    document.title = xm.name + ' — Cross-Stitch Viewer';
    document.getElementById('xsMotifName').textContent = xm.name;
    buildColorSymbols();

    // Read local immediately
    const localRaw = localStorage.getItem(progressKey());
    let localArr = null;
    if (localRaw) {
      try { localArr = JSON.parse(localRaw); } catch {}
    }

    // Start cloud fetch in parallel — don't block render
    const cloudPromise = fetch('/api/progress?name=' + encodeURIComponent(xm.name))
      .then(r => r.json())
      .then(d => (Array.isArray(d.done) && d.done.length > 0 ? d.done : null))
      .catch(() => null);

    // Apply local immediately so canvas renders without waiting for network
    doneSet = localArr && localArr.length > 0 ? new Set(localArr) : new Set();

    buildLegend();
    sizeCanvas();
    fit();
    markDirty();
    updateProgressBadge();

    // Resolve cloud
    const cloudArr = await cloudPromise;

    if (localArr && localArr.length > 0 && cloudArr && cloudArr.length > 0) {
      // Both exist — let user choose
      showSyncModal(localArr, cloudArr);
    } else if ((!localArr || localArr.length === 0) && cloudArr && cloudArr.length > 0) {
      // Only cloud — adopt it
      doneSet = new Set(cloudArr);
      localStorage.setItem(progressKey(), JSON.stringify(cloudArr));
      markDirty();
      updateProgressBadge();
    }
    // Only local (or neither) — already applied above, nothing more to do
  }
```

- [ ] **Step 3: Wire the sync modal buttons in `init()`**

In the `init()` function, find:
```javascript
    document.getElementById('xsBackBtn').addEventListener('click', () => {
```
Add the following block immediately before that line:
```javascript
    document.getElementById('xsSyncUseLocal').addEventListener('click', () => {
      hideSyncModal();
      // doneSet is already set from local; nothing more needed
    });
    document.getElementById('xsSyncUseCloud').addEventListener('click', () => {
      if (_syncCloudArr) {
        doneSet = new Set(_syncCloudArr);
        localStorage.setItem(progressKey(), JSON.stringify(_syncCloudArr));
        markDirty();
        updateProgressBadge();
      }
      hideSyncModal();
    });
    document.getElementById('xsSyncPushCloud').addEventListener('click', () => {
      // doneSet is already set from local — just upload it
      hideSyncModal();
      uploadProgress();
    });

```

- [ ] **Step 4: Commit**

```bash
git add app/motif_viewer.html
git commit -m "feat(viewer): add cloud load, sync modal wiring, upload function"
```

---

### Task 4: Trigger upload on mark-mode exit

**Files:**
- Modify: `app/motif_viewer.html` (JS section)

- [ ] **Step 1: Call `uploadProgress()` when leaving mark mode**

Find the `xsMarkBtn` click handler in `init()`:
```javascript
    document.getElementById('xsMarkBtn').addEventListener('click', () => {
      if (mode === 'mark') {
        mode = 'pan';
        deactivateMarkMode();
      } else {
```
Replace just the `if (mode === 'mark')` branch with:
```javascript
    document.getElementById('xsMarkBtn').addEventListener('click', () => {
      if (mode === 'mark') {
        mode = 'pan';
        deactivateMarkMode();
        uploadProgress();
      } else {
```

- [ ] **Step 2: Also upload when switching away from mark via the Select/Pan button**

Find the `xsModeBtn` click handler:
```javascript
    document.getElementById('xsModeBtn').addEventListener('click', () => {
      const wasInMark = mode === 'mark';
      mode = (mode === 'select') ? 'pan' : 'select';
      if (wasInMark) deactivateMarkMode();
```
Replace with:
```javascript
    document.getElementById('xsModeBtn').addEventListener('click', () => {
      const wasInMark = mode === 'mark';
      mode = (mode === 'select') ? 'pan' : 'select';
      if (wasInMark) { deactivateMarkMode(); uploadProgress(); }
```

- [ ] **Step 3: Commit**

```bash
git add app/motif_viewer.html
git commit -m "feat(viewer): upload progress to cloud on mark-mode exit"
```

---

### Task 5: Manual end-to-end verification

No automated tests exist for this app — verify manually.

- [ ] **Step 1: Start the dev server**

```bash
cd /Users/adrienrobert/gitrepo/svg_spiral/app && node server.js
```
(or however the local server is started — check `package.json` scripts)

- [ ] **Step 2: Verify cloud save + pill**

1. Open any motif in the viewer.
2. Enter Mark mode, tap a few stitches.
3. Exit Mark mode (click Mark button again).
4. Pill should briefly show "⟳ Saving…" then "✓ Saved" (green), then fade out after 3 s.
5. Check Vercel Blob dashboard or call `GET /api/progress?name={motifName}` directly — should return the stitches.

- [ ] **Step 3: Verify cloud-only load (no local)**

1. Open DevTools → Application → Local Storage, delete the `xs-progress-{name}` key.
2. Reload the motif viewer.
3. Progress should be restored from cloud silently (no modal).

- [ ] **Step 4: Verify conflict modal**

1. Manually set a different value in localStorage for the same key (DevTools → Application → Local Storage → edit the JSON to include some stitches not in cloud).
2. Reload the motif viewer.
3. Modal should appear showing "Local: N stitches · Cloud: M stitches" and three buttons.
4. Test each button: "Use local" keeps the local set; "Use cloud" switches to cloud set; "Push local → cloud" uploads local set and shows pill.

- [ ] **Step 5: Verify failed save pill**

1. Temporarily rename `app/api/progress.js` to break the endpoint, or set `BLOB_READ_WRITE_TOKEN` to an empty string.
2. Exit mark mode — pill should show "✗ Save failed" (red) and stay visible.
3. Restore the file/token.
