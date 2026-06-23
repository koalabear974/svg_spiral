// Spray.Bike color palette — scraped from https://de.spray.bike/en
// Colors extracted from the color swatch rectangle in each product's can image.
// Special effects (Keirin Flake, Awesome FX Cobweb) use representative colors.
// Source: /en/collections/alle-farben — 87 products total, 80 distinct paint colors included.

const SPRAYBIKE_COLORS = [
  // ── BLB London Collection ─────────────────────────────────────────────────
  { label: "Blackfriars (Jet Black)",          value: "#000000" },
  { label: "Whitechapel (Black & White Check)", value: "#ffffff" },
  { label: "Brick Lane (Dark Brown)",           value: "#43281c" },
  { label: "Humber (Dark Navy)",                value: "#162c5b" },
  { label: "Bayswater (Cobalt Blue)",           value: "#0d5197" },
  { label: "Bomber (Mid Blue)",                 value: "#2b82c5" },
  { label: "Coldharbour Lane (Sky Blue)",       value: "#acd3ed" },
  { label: "Milan Blue (Powder Blue)",          value: "#b7d2ef" },
  { label: "Fluro Light Blue",                  value: "#40b0fe" },
  { label: "Battersea (Teal Blue)",             value: "#0088a2" },
  { label: "Greenwich (Dark Teal)",             value: "#2d5c51" },
  { label: "Parsons Green (Olive Green)",       value: "#747651" },
  { label: "Bethnal Green (Bright Green)",      value: "#62ca0a" },
  { label: "Royal Oak (Sage Green)",            value: "#93b179" },
  { label: "Whetstone (Light Sage)",            value: "#c2d888" },
  { label: "Chalk Farm (Cream)",                value: "#f0dfb7" },
  { label: "Goldhawk Road (Amber)",             value: "#f6ba0a" },
  { label: "Primrose Hill (Pale Yellow)",       value: "#f1e180" },
  { label: "Limehouse (Yellow-Green)",          value: "#c6d402" },
  { label: "Sands End (Khaki Gold)",            value: "#c4b355" },
  { label: "Silvertown (Light Gray)",           value: "#afadab" },
  { label: "Gray's Inn (Medium Gray)",          value: "#69666a" },
  { label: "Clay Hill (Pale Gray-Pink)",        value: "#c7bab6" },
  { label: "Marylebone (Pale Mauve)",           value: "#e2dce2" },
  { label: "Plumstead (Deep Purple)",           value: "#710a6f" },
  { label: "Strawberry Hill (Hot Pink)",        value: "#e84362" },
  { label: "Salmon Lane (Salmon Pink)",         value: "#f08a6b" },
  { label: "Redbridge (Crimson)",               value: "#9e2331" },
  { label: "Coventry Red",                      value: "#d63832" },

  // ── Milan / Celadon ───────────────────────────────────────────────────────
  { label: "Milan Celadon 1 (Mint Green)",     value: "#5cb78f" },
  { label: "Milan Celadon 2 (Sea Green)",      value: "#69bfb4" },

  // ── Extended Solid Colors ─────────────────────────────────────────────────
  { label: "Chicago Yellow",                   value: "#fbd825" },
  { label: "Fluro Yellow",                     value: "#eaff02" },
  { label: "Fluro Green",                      value: "#4cdd53" },
  { label: "Fluro Orange",                     value: "#ff484a" },
  { label: "Fluro Magenta",                    value: "#e6028d" },
  { label: "Fluro Pink",                       value: "#fd2e5b" },
  { label: "Bradbury (Olive Yellow)",          value: "#aaa846" },
  { label: "Eagle (Dark Tan)",                 value: "#6e5d3a" },
  { label: "Calcott (Warm Tan)",               value: "#a38c62" },
  { label: "Hercules (Forest Green)",          value: "#2c521f" },
  { label: "Grifter (Emerald)",                value: "#1ea681" },
  { label: "Excelsior (Dark Burgundy)",        value: "#6d2f34" },
  { label: "Mustang (Burnt Orange)",           value: "#d55425" },
  { label: "Meise Orange",                     value: "#eb7202" },
  { label: "Carlton (Amber Orange)",           value: "#ea9b44" },
  { label: "Rudge (Rust Red)",                 value: "#b0493c" },
  { label: "Memphis (Soft Purple)",            value: "#9867a3" },
  { label: "Quasar (Magenta-Pink)",            value: "#c01b72" },
  { label: "Superb (Blush Pink)",              value: "#eac5d2" },

  // ── Pop / Nightshade Collections ─────────────────────────────────────────
  { label: "Misty (Pale Mint)",                value: "#dcf8f1" },
  { label: "Royale (Deep Purple)",             value: "#32125d" },
  { label: "Riviera (Pale Blush)",             value: "#fedede" },
  { label: "Mirage (Dark Magenta)",            value: "#85226c" },
  { label: "Winkie (Vivid Green)",             value: "#00a300" },

  // ── Historic / Vintage Collection ────────────────────────────────────────
  { label: "Elswick (Muted Sage)",             value: "#5f786b" },
  { label: "Ariel (Pale Mint)",                value: "#9eebc1" },
  { label: "Warrick (Blue-Gray)",              value: "#7d8a81" },
  { label: "Peacock (Dark Teal)",              value: "#004645" },
  { label: "Perry (Steel Blue)",               value: "#668eb2" },

  // ── Nightshade Collection ─────────────────────────────────────────────────
  { label: "Black Cherry (Dark Wine)",         value: "#4b0d22" },
  { label: "Storm (Slate Blue)",               value: "#546176" },
  { label: "Moorland (Dark Olive)",            value: "#302e06" },
  { label: "Elderberry (Dark Plum)",           value: "#503b57" },
  { label: "Raven Gray (Charcoal)",            value: "#2f2f2f" },

  // ── Keirin Collection — metallic flake effects ────────────────────────────
  { label: "Keirin Flake Blue (Metallic)",     value: "#1a3a7a" },
  { label: "Keirin Flake Green (Metallic)",    value: "#1a4a2a" },
  { label: "Keirin Flake Red (Metallic)",      value: "#7a1a1a" },
  { label: "Keirin Flake Gold (Metallic)",     value: "#8a6a0a" },
  { label: "Keirin Flake Silver (Metallic)",   value: "#909090" },
  { label: "Keirin Flake Multi (Holographic)", value: "#6040a0" },

  // ── Frame Builder's — specialty finishes ─────────────────────────────────
  { label: "Frame Builder Pewter Silver",      value: "#939094" },
  { label: "Frame Builder Brass Gold",         value: "#a28f5d" },
  { label: "Frame Builder Bronze Gold",        value: "#917049" },
  { label: "Frame Builder Copper",             value: "#a4664b" },
  { label: "Frame Builder Smoothing Putty (Gray)", value: "#cccbce" },
  { label: "Frame Builder Cold Zinc (Silver)", value: "#c0c0c0" },

  // ── Awesome FX Cobweb — effect paints ────────────────────────────────────
  { label: "Awesome FX Cobweb Black",          value: "#1a1a1a" },
  { label: "Awesome FX Cobweb Gold",           value: "#b8960c" },
  { label: "Awesome FX Cobweb Celadon (Mint)", value: "#7ab89a" },
  { label: "Awesome FX Cobweb Silver",         value: "#909090" },
  { label: "Awesome FX Cobweb White",          value: "#f0f0f0" },
];

const EFFECTS = [
  { label: 'Solid',               value: 'solid' },
  { label: 'Gradient Top→Bottom', value: 'gradient-tb' },
  { label: 'Gradient Left→Right', value: 'gradient-lr' },
  { label: 'Marble',              value: 'marble' },
  { label: 'Splatter',            value: 'splatter' },
  { label: 'Splatter 2',          value: 'splatter2' },
];

const EFFECTS2 = [
  { label: 'None',                value: 'none' },
  { label: 'Marble',              value: 'marble' },
  { label: 'Splatter',            value: 'splatter' },
  { label: 'Splatter 2',          value: 'splatter2' },
  { label: 'Gradient Top→Bottom', value: 'gradient-tb' },
  { label: 'Gradient Left→Right', value: 'gradient-lr' },
];

let splatterImg, splatterImg2;

const DEFAULT_COLOR1_LABEL = 'Fluro Yellow';
const DEFAULT_COLOR2_LABEL = 'Redbridge (Crimson)';

const MARBLE_SCALE    = 0.038;
const MARBLE_COVERAGE = 0.95;
const MARBLE_ROUGHNESS = 0.75;
const MARBLE_SEED     = 160;

function preload() {
  splatterImg  = loadImage('/assets/splatter-mask.jpg');
  splatterImg2 = loadImage('/assets/splatter-mask-2.jpg');
}

function colorByLabel(label) {
  return SPRAYBIKE_COLORS.find(c => c.label === label) || SPRAYBIKE_COLORS[0];
}

const _def1 = colorByLabel(DEFAULT_COLOR1_LABEL);
const _def2 = colorByLabel(DEFAULT_COLOR2_LABEL);

let selectedColor1 = _def1.value;  let selectedLabel1 = _def1.label;
let selectedColor2 = _def2.value;  let selectedLabel2 = _def2.label;
let selectedColor3 = SPRAYBIKE_COLORS[0].value; let selectedLabel3 = SPRAYBIKE_COLORS[0].label;
let selectedEffect  = 'solid';     let selectedEffectLabel  = 'Solid';
let selectedEffect2 = 'none';      let selectedEffect2Label = 'None';

let gui;

function setup() {
  pixelDensity(1);
  createCanvas(800, 800);
  background(30);
  noLoop();

  // Use QuickSettings directly — p5.gui.js's createGui() wrapper does not
  // expose addDropDown on the QSGui object, so we bypass it.
  gui = QuickSettings.create(20, 20, 'Bike Paint');
  gui.addDropDown('Effect 1', EFFECTS, function(val) {
    selectedEffect = val.value; selectedEffectLabel = val.label; redraw();
  });
  gui.addDropDown('Effect 2', EFFECTS2, function(val) {
    selectedEffect2 = val.value; selectedEffect2Label = val.label; redraw();
  });
  gui.addDropDown('Color 1', SPRAYBIKE_COLORS, function(val) {
    selectedColor1 = val.value; selectedLabel1 = val.label; redraw();
  });
  gui.addDropDown('Color 2', SPRAYBIKE_COLORS, function(val) {
    selectedColor2 = val.value; selectedLabel2 = val.label; redraw();
  });
  gui.addDropDown('Color 3', SPRAYBIKE_COLORS, function(val) {
    selectedColor3 = val.value; selectedLabel3 = val.label; redraw();
  });

  // Sync dropdown visuals to JS defaults
  gui._controls['Color 1'].control.selectedIndex = SPRAYBIKE_COLORS.indexOf(_def1);
  gui._controls['Color 2'].control.selectedIndex = SPRAYBIKE_COLORS.indexOf(_def2);

  redraw();
}

// Apply marble texture over whatever is already on the canvas at (x,y,sq)
function applyMarble(x, y, sq, hexColor) {
  noiseDetail(8, MARBLE_ROUGHNESS);
  noiseSeed(MARBLE_SEED);

  const c = color(hexColor);
  const r2 = red(c), g2 = green(c), b2 = blue(c);
  const wsc = MARBLE_SCALE * 0.4;

  const imgData = drawingContext.getImageData(x, y, sq, sq);
  const d = imgData.data;

  for (let py = 0; py < sq; py++) {
    for (let px = 0; px < sq; px++) {
      const wx = (noise(px * wsc + 500, py * wsc + 500) - 0.5) * 80;
      const wy = (noise(px * wsc + 600, py * wsc + 600) - 0.5) * 80;
      const n  = noise((px + wx) * MARBLE_SCALE, (py + wy) * MARBLE_SCALE);

      if (n > MARBLE_COVERAGE) {
        const alpha = min(255, (n - MARBLE_COVERAGE) * 10 * 255);
        const a = alpha / 255;
        const i = (py * sq + px) * 4;
        d[i]   = d[i]   * (1 - a) + r2 * a;
        d[i+1] = d[i+1] * (1 - a) + g2 * a;
        d[i+2] = d[i+2] * (1 - a) + b2 * a;
      }
    }
  }

  drawingContext.putImageData(imgData, x, y);
  noiseDetail(4, 0.5);
}

// Paint hexColor through a splatter mask (dark pixels = paint, white = transparent)
function applySplatter(x, y, sq, hexColor, img) {
  if (!img) return;

  const c = color(hexColor);
  const r2 = red(c), g2 = green(c), b2 = blue(c);

  img.loadPixels();
  const iw = img.width;
  const ih = img.height;

  const imgData = drawingContext.getImageData(x, y, sq, sq);
  const d = imgData.data;

  for (let py = 0; py < sq; py++) {
    for (let px = 0; px < sq; px++) {
      const mx = floor(px / sq * iw);
      const my = floor(py / sq * ih);
      const mi = (my * iw + mx) * 4;
      const lum = (img.pixels[mi] + img.pixels[mi+1] + img.pixels[mi+2]) / 3;
      const maskVal = 1 - lum / 255; // 0=white(skip), 1=black(full paint)

      if (maskVal > 0.25) {
        const a = min(1, (maskVal - 0.25) * 2.5);
        const i = (py * sq + px) * 4;
        d[i]   = d[i]   * (1 - a) + r2 * a;
        d[i+1] = d[i+1] * (1 - a) + g2 * a;
        d[i+2] = d[i+2] * (1 - a) + b2 * a;
      }
    }
  }

  drawingContext.putImageData(imgData, x, y);
}

function applyGradient(x, y, sq, hexA, hexB, direction) {
  const grad = direction === 'gradient-tb'
    ? drawingContext.createLinearGradient(x, y, x, y + sq)
    : drawingContext.createLinearGradient(x, y, x + sq, y);
  grad.addColorStop(0, hexA);
  grad.addColorStop(1, hexB);
  drawingContext.fillStyle = grad;
  drawingContext.fillRect(x, y, sq, sq);
}

function drawSquare(x, y, sq) {
  noStroke();

  // — Effect 1 (base layer) —
  if (selectedEffect === 'solid') {
    fill(selectedColor1);
    rect(x, y, sq, sq);
  } else if (selectedEffect === 'marble') {
    fill(selectedColor1); rect(x, y, sq, sq);
    applyMarble(x, y, sq, selectedColor2);
  } else if (selectedEffect === 'splatter') {
    fill(selectedColor1); rect(x, y, sq, sq);
    applySplatter(x, y, sq, selectedColor2, splatterImg);
  } else if (selectedEffect === 'splatter2') {
    fill(selectedColor1); rect(x, y, sq, sq);
    applySplatter(x, y, sq, selectedColor2, splatterImg2);
  } else {
    applyGradient(x, y, sq, selectedColor1, selectedColor2, selectedEffect);
  }

  // — Effect 2 (overlay) —
  if (selectedEffect2 === 'marble') {
    applyMarble(x, y, sq, selectedColor3);
  } else if (selectedEffect2 === 'splatter') {
    applySplatter(x, y, sq, selectedColor3, splatterImg);
  } else if (selectedEffect2 === 'splatter2') {
    applySplatter(x, y, sq, selectedColor3, splatterImg2);
  } else if (selectedEffect2 === 'gradient-tb' || selectedEffect2 === 'gradient-lr') {
    drawingContext.globalAlpha = 0.75;
    applyGradient(x, y, sq, selectedColor2, selectedColor3, selectedEffect2);
    drawingContext.globalAlpha = 1.0;
  }
}

function draw() {
  background(30);

  const sq = 700;
  const x = width / 2 - sq / 2;
  const y = height / 2 - sq / 2;

  drawSquare(x, y, sq);

  fill(255);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(14);
  const e1 = selectedEffectLabel + ': ' + selectedLabel1 + (selectedEffect !== 'solid' ? ' → ' + selectedLabel2 : '');
  const e2 = selectedEffect2 !== 'none' ? '  |  ' + selectedEffect2Label + ': ' + selectedLabel3 : '';
  text(e1 + e2, width / 2, y + sq + 16);
  fill(100);
  textSize(12);
  text(selectedColor1 + (selectedEffect !== 'solid' ? ' → ' + selectedColor2 : '') + (selectedEffect2 !== 'none' ? ' | ' + selectedColor3 : ''), width / 2, y + sq + 36);
}
