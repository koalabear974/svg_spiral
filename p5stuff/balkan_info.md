# Balkan Sketch Series — Working Notes

## Current State (2026-05-22)

| File | Role |
|------|------|
| `sketch.js` | **Active sketch** — Balkan Motif Stamps (was `sketch_balkan_2_stamps.js`) |
| `saves/save_20260522_1456_balkan_noise.js` | Archived — Cross-stitch noise (was `sketch.js` / "balkan_noise") |

The `sketch_balkan_*` series has been consolidated: `sketch_balkan_2_stamps` became the new `sketch.js`, and the noise variant was archived. `sketch_balkan_1_diamond` and `sketch_balkan_3_colors` were deleted (superseded).

---

## Architecture

The sketch system renders a **cross-stitch grid** on an A3 canvas. Every cell is either a filled square (`usePixel=true`) or a drawn X (`usePixel=false`). Cells are traversed in a `for(col) for(row)` loop with padding applied.

### Coordinate pipeline

1. **Canvas → cell center** `cx = offX + col*cellSize + cellSize*0.5`
2. **Kaleidoscope fold** (when `mirror > 0`): converts cartesian offset from canvas center into a polar angle, folds it into one sector (`PI/mirror`), returns folded point `(sx, sy)` — this makes radial symmetry without duplicating draw calls
3. **Motif or noise** decision is made in folded space

### Padding / grid offset

```js
let cols = floor((width - paddingX * 2) / cellSize);
let rows = floor((height - paddingY * 2) / cellSize);
let offX = floor((width - cols * cellSize) / 2);
let offY = floor((height - rows * cellSize) / 2);
```

`paddingX/Y` sets minimum margin; actual offset is re-centered so the grid sits flush.

---

## sketch.js — Balkan Stamps

Places one of three named motifs on a regular tiled grid in folded space. Optionally fills the background with noise.

### Key parameters

| Param | Default | Purpose |
|-------|---------|---------|
| `motifType` | 0 | 0=nested diamond, 1=tree of life, 2=8-pointed star |
| `motifSize` | 22 | Motif footprint in cells (must be even for symmetry) |
| `motifGap` | 4 | Gap between stamps in cells |
| `rotateStamps` | true | Rotates each stamp by a varied multiple of 90° based on its grid position |
| `noiseBackground` | true | Fills non-stamp cells with Perlin noise at `threshold` |
| `mirror` | 4 | Kaleidoscope sectors (0 = no fold) |
| `spacing` | computed | `(motifSize + motifGap) * cellSize` — repeat period |

### Stamp positioning in folded space

```js
let sCol = floor(sx / spacing);
let sRow = floor(sy / spacing);
let localX = sx - (sCol + 0.5) * spacing;  // local coord relative to stamp center
let localY = sy - (sRow + 0.5) * spacing;
let lc = round(localX / cellSize);
let lr = round(localY / cellSize);
```

Then optional rotation:
```js
let turns = (sCol * 3 + sRow * 7) % 4;  // varied but deterministic
for (let t = 0; t < turns; t++) { tmp = lc; lc = -lr; lr = tmp; }
```

### Motif functions

All return color index: `0` = background, `1/2/3` = palette layers (outer → center).

**Diamond** (`getDiamondMotif`): L1-norm concentric rings — `d = abs(lc)+abs(lr)`, three thresholds at `half`, `half*0.65`, `half*0.3`.

**Tree of life** (`getTreeMotif`): Crown diamond at top + vertical stem + 3 branch pairs. Crown radius = `floor(half*0.28)`. Branches step diagonally upward from stem.

**Star** (`getStarMotif`): Union of L1 diamond (cardinal points) and Chebyshev square (ordinal points) for an 8-pointed star. Ordinal reach slightly shorter at `floor(half*0.72)`.

### Color system

```js
colorMode(HSB, 360, 100, 100);
randomSeed(colorSeed);
let pal = Array.from({length: 8}, () => color(random(360), random(50,90), random(40,85)));
```

8-color palette, each motif layer uses `(motifIdx - 1) % pal.length`. Noise background uses a separate `colorNoiseScale` noise sample to pick from the same palette.

---

## saves/save_20260522_1456_balkan_noise.js — Cross-stitch Noise

Pure Perlin noise mask over the grid — no stamps. Simpler predecessor.

| Param | Default | Notes |
|-------|---------|-------|
| `noiseScale` | 0.01 | Controls feature size |
| `threshold` | 0.5 | Noise cutoff — higher = sparser |
| `mirror` | 4 | Same kaleidoscope fold |
| `usePixel` | true | Square fill or X stitch |
| `crossStrokeWeight` | 6 | X thickness when not pixel mode |

---

## Ideas / Next Patches

- **Motif color per layer from a specific Balkan palette** (red/black/white traditional embroidery) instead of random HSB
- **Asymmetric stamps**: different motif per `sCol/sRow` parity (checker of diamonds + trees)
- **Density gradient**: scale `threshold` radially so stamps stand out from a denser noise field at edges
- **Outline-only mode**: draw only the border cells of each motif ring instead of filling (uses `usePixel=false` per ring)
- **Save naming schema**: `save_YYYYMMDD_HHMM_name.js` — next balkan saves should use prefix `balkan_stamps_` or `balkan_noise_` to group them in the dashboard
