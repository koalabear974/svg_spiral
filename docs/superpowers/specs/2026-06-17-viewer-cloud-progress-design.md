# Viewer Cloud Progress Sync — Design Spec
_Date: 2026-06-17_

## Problem

Cross-stitch progress (which stitches are marked done) is currently stored only in `localStorage` under the key `xs-progress-{motifName}`. This means it is not accessible across devices. The goal is to also persist progress to cloud storage so the same person can resume on a different device, without losing any existing local saves.

---

## Storage Backend

**Vercel Blob** (already used for motif storage, `BLOB_READ_WRITE_TOKEN` is in env).

Progress for a motif is stored at `progress/{motifName}.json` in the Blob store, with the shape:

```json
{ "done": ["0,0", "1,2", "3,4"] }
```

---

## API Routes

Two new serverless functions added to `app/api/`:

### `GET /api/progress?name={motifName}`
- Reads `progress/{motifName}.json` from Vercel Blob.
- Returns `{ done: [...] }` on success, `{ done: null }` if no cloud save exists, or `{ error: "..." }` on failure.

### `PUT /api/progress`
- Body: `{ name: string, done: string[] }`
- Writes `progress/{motifName}.json` to Vercel Blob (overwrite allowed).
- Returns `{ saved: true }` on success, `{ error: "..." }` on failure.

Both routes live in `app/api/progress.js` (method-dispatch on `req.method`).

`vercel.json` gets two new rewrite entries:
```json
{ "source": "/api/progress", "destination": "/api/progress" }
```
(Vercel auto-routes `/api/*` files, so this may not be needed — confirm at implementation time.)

---

## Client Flow on Load

Called inside `loadMotif()`, after `xm` is populated:

1. Read `localStorage.getItem(progressKey())` → parse as `localDone` (Set or null).
2. `fetch('/api/progress?name=' + encodeURIComponent(xm.name))` → parse as `cloudDone` (Set or null).
3. Decision table:

| localDone | cloudDone | Action |
|-----------|-----------|--------|
| empty/absent | absent | Use empty set silently |
| present | absent | Use local silently |
| absent | present | Use cloud, write to localStorage |
| present | present | Show conflict modal |

Both fetches happen in parallel (Promise.all). The motif renders immediately with whatever was in localStorage; if conflict modal appears, it overlays the already-rendered canvas. Choosing an option updates `doneSet`, re-renders, and dismisses the modal.

---

## Conflict Modal

A new `#xsSyncModal` div, styled like the existing `#xsColorModal` (dark semi-transparent overlay, centered content). Shown only when both local and cloud saves are non-empty.

Content:
- Title: "Progress found on this device and in the cloud"
- Sub-line: shows stitch counts for each — "Local: 42 stitches · Cloud: 38 stitches"
- Three buttons:
  - **Use local** — sets `doneSet` from localStorage value, does not upload
  - **Use cloud** — sets `doneSet` from cloud value, writes to localStorage
  - **Push local → cloud** — sets `doneSet` from localStorage, triggers `uploadProgress()`

Modal is dismissed after any choice. No way to dismiss without choosing (no Escape / click-outside).

---

## Auto-Save Trigger

**On mark-mode exit only** (no periodic timer).

When the Mark button is clicked to deactivate mark mode, after the existing `saveProgress()` (localStorage write), call `uploadProgress()` asynchronously.

`uploadProgress()`:
1. Sets pill to "Saving…" state.
2. `PUT /api/progress` with current `doneSet`.
3. On success → pill shows "✓ Saved", fades out after 3 s.
4. On failure → pill shows "✗ Save failed", stays visible until next attempt.

If `doneSet` is empty, skip the upload (nothing to save to cloud).

---

## Status Pill

A `<span id="xsSyncPill">` injected into `#xsToolbar` (right side, before Back button).

Three visual states driven by a CSS class on the element:

| State | Class | Text | Behaviour |
|-------|-------|------|-----------|
| Idle | (no class / hidden) | — | `display:none` |
| Saving | `.saving` | `⟳ Saving…` | Muted opacity |
| Saved | `.saved` | `✓ Saved` | Green tint, auto-hides after 3 s |
| Failed | `.failed` | `✗ Save failed` | Red tint, stays until next attempt |

Styled as a small read-only pill (no border, `font-size: 0.72rem`, similar palette to `.xs-btn`).

---

## Error Handling

- Cloud fetch on load failing silently: fall back to local-only silently (no modal, no pill error). The upload path is the only place errors are shown to the user.
- If `BLOB_READ_WRITE_TOKEN` is absent server-side, the GET returns `{ done: null }` (treated as no cloud save) and the PUT returns a 500 (shown as "Save failed" in pill).

---

## Files Changed

| File | Change |
|------|--------|
| `app/api/progress.js` | New — GET + PUT handler |
| `app/vercel.json` | New rewrite if needed |
| `app/motif_viewer.html` | Add `#xsSyncModal`, `#xsSyncPill`, load/upload logic |
