# Motif Viewer — Mark Done Feature

**Date:** 2026-06-04  
**File:** `app/motif_viewer.html`

## Summary

Add a cross-stitch progress tracking system to the motif viewer. Users can paint stitches as "done" with a brush-drag gesture, see a live done/total count, and have their progress auto-saved per motif in localStorage.

---

## Data & Persistence

- Done-stitch state is a `Set<string>` of `"c,r"` coordinate strings (e.g. `"3,7"`).
- Stored in `localStorage` under the key `xs-progress-<motifName>` where `motifName` is `xm.name`.
- Auto-restored silently on motif load if a saved entry exists.
- Saved on every mark action, debounced ~300ms to avoid excessive writes.
- Clearing deletes the localStorage key and resets the Set.
- Motif rename edge case is acceptable — progress won't transfer to a new name.

---

## Mode System

A **"Mark" button** is added to the toolbar (positioned between the existing Select and Symbols buttons). It toggles `mode = 'mark'` using the same pattern as the existing Select/Pan toggle.

While in mark mode:
- The canvas cursor becomes crosshair.
- The Mark button shows as `.active` (red background, matching existing active button style).
- A **"Clear" button** appears in the toolbar (only visible in mark mode). Clicking it shows `confirm("Clear all progress?")` and resets on confirmation.

Exiting mark mode (clicking Mark again, or switching to another mode) hides the Clear button and returns to pan behaviour.

---

## Interaction

### Desktop (mouse)
- `mousedown` on a cell: marks or unmarks it. The **paint direction** (mark vs unmark) is set by the first cell touched and held for the entire drag.
- Cells whose color is in `hiddenColors` are skipped — they can't be marked (you wouldn't stitch a hidden color).
- `mousemove` while button held: continues painting in the same direction.
- `mouseup`: ends the stroke and saves to localStorage.

### Mobile (touch)
- `touchstart` on a cell: same as mousedown — sets paint direction.
- `touchmove`: paints cells as finger slides across them.
- Two-finger pinch-to-zoom cancels the paint stroke (existing pinch logic takes over).
- Long-press behaviour is disabled while in mark mode (no conflict).

---

## Rendering

Two-pass render in the existing `render()` function:

1. **First pass** — existing stitch drawing (color fill, X strokes, or symbols).
2. **Second pass** — for each done stitch in the visible range, draw `rgba(180, 180, 180, 0.55)` filled rect over the cell. Drawn after the grid lines, before the ruler overlay.

Hidden colors (from the legend hide/show system) are excluded from both the overlay rendering and the total stitch count.

---

## Progress Badge

A floating `<div id="xsProgress">` element:

- Position: `bottom: 16px; left: 16px` (mirrors the legend panel on the right).
- Content: `"42 / 180 stitched"` — updates live as stitches are marked.
- **Visibility**: shown whenever `doneSet.size > 0` OR when in mark mode; hidden otherwise.
- Total count = all cells whose color is not in `hiddenColors`.
- Styled to match the existing legend panel: dark background `rgba(30,18,10,0.92)`, light text `#f5f0e8`, rounded corners, backdrop blur.

---

## Toolbar Layout

Desktop order: `[Select] [Mark] [Clear*] [Symbols] [Fit] [Back]` — Clear only appears when in mark mode.

Mobile: same order, same `.xs-btn` class with existing mobile tap-target sizing (`padding: 10px 12px`). Clear uses the same conditional visibility. The zoom buttons (`xs-btn-zoom`) are already hidden on desktop and shown on mobile — no change to that logic. If the toolbar gets visually crowded on very small screens, Clear can be made slightly narrower (`padding: 4px 8px`) on mobile via the existing `@media (max-width: 600px)` block.

---

## What This Does Not Change

- The Select mode and its rectangle-selection behaviour are unaffected.
- The Symbols mode and color legend are unaffected.
- No server-side changes — purely client-side localStorage.
