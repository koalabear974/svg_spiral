# Viewer Mobile UX — Design Spec
Date: 2026-06-02

## Summary

Improve the cross-stitch viewer and motif browser for mobile use: larger touch targets, long-press selection, zoom buttons, and sort generated motifs first in the browser grid.

---

## 1. Toolbar improvements (viewer, mobile)

On screens ≤600px (CSS media query):
- Toolbar height: `56px` (was 44px)
- `.xs-btn` padding: `10px 14px` (produces ≥44px tap targets)
- `#xsZoomPct` hidden on screens ≤400px (`display: none`)

Two zoom buttons `+` and `−` added to the toolbar, visible only on mobile (≤600px). Each tap calls `zoomAt(1.5, midX, midY)` or `zoomAt(1/1.5, midX, midY)` where `midX/midY` is the canvas center. IDs: `xsZoomIn`, `xsZoomOut`.

---

## 2. Long-press selection (viewer, touch)

Replaces the need to tap the "Select" mode toggle on mobile. The existing "Select" button stays in the toolbar for discoverability.

**Behaviour:**
- On `touchstart` (single finger): start a 400ms timer storing the initial touch position
- If the finger moves >8px before the timer fires: cancel the timer, treat as a normal pan (existing behaviour)
- If 400ms elapses without >8px movement: activate select mode, start selection rectangle at the original touch position, let subsequent `touchmove` extend the rectangle
- On timer activation: call `navigator.vibrate(30)` if available; briefly flash the canvas border with `rgba(180,40,40,0.3)` for 200ms as visual feedback
- On `touchend` after a long-press selection: finalize selection and call `updateInfoBar()` (same as existing select drag end)
- Tapping canvas (touchstart → touchend, no drag, no long-press) while selection is active clears selection and hides info bar

**Implementation:** A `longPressTimer` variable and `longPressMoved` flag added to the IIFE state. Logic wired into existing `onTouchStart`, `onTouchMove`, `onTouchEnd`.

---

## 3. "Open in viewer" button (modal, mobile)

On screens ≤600px: `#mOpenViewer` gets `display: block; width: 100%` to span the modal details width.

---

## 4. Generated motifs first (browser grid)

In `buildCards()` in `motif_browser.html`:
- Render `window.IMPORTED_MOTIFS` (reversed, so newest/last entry appears first) **before** the hardcoded `MOTIFS` array
- The "generated" filter pill still works because `card.dataset.tradition = 'generated'` is set on JSON motif cards

---

## File changes

- Modify: `p5stuff/motif_browser.html`
  - Add mobile CSS to existing `<style>` block
  - Add `xsZoomIn` / `xsZoomOut` buttons to `#xsToolbar` HTML
  - Add `longPressTimer`, `longPressOrigin`, `longPressMoved` state vars to IIFE
  - Modify `onTouchStart`, `onTouchMove`, `onTouchEnd` for long-press logic
  - Wire `xsZoomIn` / `xsZoomOut` in `initViewer()`
  - Modify `buildCards()` to render IMPORTED_MOTIFS first (reversed)

---

## Out of scope

- Changing ruler label size (already readable enough)
- Changing info bar layout (already works on mobile)
- Adding swipe-to-close gesture
