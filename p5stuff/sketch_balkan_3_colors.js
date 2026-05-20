// Balkan Color Grammar
// Same noise-based fill as the base sketch, but with region-specific color palettes
// drawn from Balkan embroidery traditions.
//
// balkColorMode:
//   0 = Random HSB (current behavior)
//   1 = Zmijanje — monochrome, one thread color on linen (UNESCO heritage, Bosnia)
//   2 = Bulgarian — red + black on white, high contrast
//   3 = Romanian — red, black, blue, forest green, gold

var seed = 0;
var seedMin = 0; var seedMax = 1000; var seedStep = 1;

var cellSize = 14;
var cellSizeMin = 4; var cellSizeMax = 40; var cellSizeStep = 1;

var noiseScale = 0.018;
var noiseScaleMin = 0.001; var noiseScaleMax = 0.12; var noiseScaleStep = 0.001;

var noiseOctaves = 4;
var noiseOctavesMin = 1; var noiseOctavesMax = 8; var noiseOctavesStep = 1;

var noiseFalloff = 0.5;
var noiseFalloffMin = 0.1; var noiseFalloffMax = 0.9; var noiseFalloffStep = 0.05;

var threshold = 0.42;
var thresholdMin = 0; var thresholdMax = 1; var thresholdStep = 0.01;

var colorNoiseScale = 0.5;
var colorNoiseScaleMin = 0.05; var colorNoiseScaleMax = 3; var colorNoiseScaleStep = 0.05;

var colorSeed = 0; // used in random mode and for zmijanje hue variation
var colorSeedMin = 0; var colorSeedMax = 100; var colorSeedStep = 1;

var balkColorMode = 1; // 0=random, 1=zmijanje, 2=bulgarian, 3=romanian
var balkColorModeMin = 0; var balkColorModeMax = 3; var balkColorModeStep = 1;

var zmijanjeHue = 220; // hue of single thread color (0-360)
var zmijanjeHueMin = 0; var zmijanjeHueMax = 360; var zmijanjeHueStep = 5;

var mirror = 4;
var mirrorMin = 0; var mirrorMax = 10; var mirrorStep = 1;

var usePixel = false; // cross mode looks great with the dense Balkan palettes

var crossStrokeWeight = 1.8;
var crossStrokeWeightMin = 0.3; var crossStrokeWeightMax = 6; var crossStrokeWeightStep = 0.1;

var paddingX = 70;
var paddingXMin = 0; var paddingXMax = 300; var paddingXStep = 5;

var paddingY = 100;
var paddingYMin = 0; var paddingYMax = 300; var paddingYStep = 5;

var blackAndWhite = false;
var showGrid = false;

var gui;

function setup() {
  if (typeof SVG === 'undefined') {
    createCanvas(...a3Format);
  } else {
    createCanvas(...a3Format, SVG);
  }
  pixelDensity(1);
  gui = createGui('Balkan Colors');
  gui.addGlobals(
    'seed', 'cellSize',
    'noiseScale', 'noiseOctaves', 'noiseFalloff', 'threshold',
    'colorNoiseScale', 'colorSeed',
    'balkColorMode', 'zmijanjeHue',
    'mirror', 'paddingX', 'paddingY',
    'usePixel', 'blackAndWhite', 'crossStrokeWeight', 'showGrid'
  );
  noLoop();
}

function keyPressed() {
  if (keyCode === 32) redraw();
  if (keyCode === 83) {
    const d = new Date();
    save('art_' + d.toISOString().split('.')[0].replaceAll(':', '-') + '.svg');
  }
}

function buildPalette() {
  colorMode(HSB, 360, 100, 100);
  randomSeed(colorSeed);
  let p;

  if (balkColorMode === 0) {
    // Random — same as base sketch
    p = Array.from({length: 8}, () => color(random(360), random(50, 90), random(40, 85)));

  } else if (balkColorMode === 1) {
    // Zmijanje: monochrome — single hue, 5 tonal steps
    // Authentic style: dense fill, one color only, high contrast with ground
    let h = zmijanjeHue;
    p = [
      color(h, 90, 28),
      color(h, 85, 42),
      color(h, 78, 56),
      color(h, 62, 70),
      color(h, 42, 82),
    ];

  } else if (balkColorMode === 2) {
    // Bulgarian: red + black, occasionally dark red
    p = [
      color(4,  92, 82),  // bright red (dominant)
      color(0,  0,  7),   // black
      color(8,  80, 58),  // dark red
      color(4,  92, 82),  // red repeat (biases palette toward red)
      color(0,  0,  7),   // black repeat
    ];

  } else if (balkColorMode === 3) {
    // Romanian: red, black, blue, forest green, gold
    p = [
      color(4,   90, 78),  // red
      color(0,   0,  7),   // black
      color(218, 78, 58),  // deep blue
      color(128, 68, 48),  // forest green
      color(42,  82, 72),  // gold/amber
    ];
  }

  colorMode(RGB, 255);
  return p;
}

function draw() {
  let pal = buildPalette();

  randomSeed(seed);
  noiseSeed(seed);
  noiseDetail(noiseOctaves, noiseFalloff);
  clear();

  // Background varies by mode: white for Zmijanje, linen for others
  if (balkColorMode === 1) {
    background(255, 252, 248);
  } else {
    background(243, 238, 225);
  }

  let cols = floor((width - paddingX * 2) / cellSize);
  let rows = floor((height - paddingY * 2) / cellSize);
  let offX = floor((width - cols * cellSize) / 2);
  let offY = floor((height - rows * cellSize) / 2);

  if (showGrid) {
    stroke(210, 200, 185); strokeWeight(0.5);
    for (let c = 0; c <= cols; c++) line(offX + c * cellSize, offY, offX + c * cellSize, offY + rows * cellSize);
    for (let r = 0; r <= rows; r++) line(offX, offY + r * cellSize, offX + cols * cellSize, offY + r * cellSize);
  }

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      let cx = offX + col * cellSize + cellSize * 0.5;
      let cy = offY + row * cellSize + cellSize * 0.5;

      let sx = cx, sy = cy;
      if (mirror > 0) {
        let dx = cx - width * 0.5, dy = cy - height * 0.5;
        let r = sqrt(dx * dx + dy * dy);
        let angle = atan2(dy, dx);
        if (angle < 0) angle += TWO_PI;
        let sectorSize = PI / mirror;
        let folded = angle % (sectorSize * 2);
        if (folded > sectorSize) folded = sectorSize * 2 - folded;
        sx = width * 0.5 + r * cos(folded);
        sy = height * 0.5 + r * sin(folded);
      }

      let n = noise(sx * noiseScale, sy * noiseScale);

      if (n > threshold) {
        let colorN = noise(sx * noiseScale * colorNoiseScale + 999, sy * noiseScale * colorNoiseScale + 999);

        let c;
        if (blackAndWhite) {
          c = color(0);
        } else if (balkColorMode === 1) {
          // Zmijanje: tonal variation — map colorN to tonal steps
          let toneIdx = constrain(floor(colorN * pal.length), 0, pal.length - 1);
          c = pal[toneIdx];
        } else {
          // Other modes: use colorN to distribute across palette
          // Bias toward palette[0] (dominant color in Bulgarian/Romanian)
          let idx = colorN < 0.55 ? 0 : constrain(floor((colorN - 0.55) / 0.45 * (pal.length - 1)) + 1, 1, pal.length - 1);
          c = pal[idx];
        }

        drawCell(col, row, offX, offY, c);
      }
    }
  }
}

function drawCell(col, row, offX, offY, c) {
  if (usePixel) {
    noStroke(); fill(c);
    rect(offX + col * cellSize, offY + row * cellSize, cellSize, cellSize);
  } else {
    noFill(); stroke(c); strokeWeight(crossStrokeWeight);
    let m = cellSize * 0.18;
    let x1 = offX + col * cellSize + m, y1 = offY + row * cellSize + m;
    let x2 = offX + (col + 1) * cellSize - m, y2 = offY + (row + 1) * cellSize - m;
    line(x1, y1, x2, y2); line(x2, y1, x1, y2);
  }
}
