// Balkan Motif Stamps
// Places Balkan motifs on a kaleidoscope cross-stitch grid.
// Motif source: built-in algorithmic shapes or motifs saved from Motif Studio.

var seed = 0;
var seedMin = 0; var seedMax = 1000; var seedStep = 1;

var cellSize = 12;
var cellSizeMin = 4; var cellSizeMax = 40; var cellSizeStep = 1;

var motifSelector = 'diamond'; // updated by dropdown

var motifSize = 22;
var motifSizeMin = 8; var motifSizeMax = 150; var motifSizeStep = 2;

var motifGap = 4;
var motifGapMin = 0; var motifGapMax = 20; var motifGapStep = 1;

var stampOffX = 0;
var stampOffXMin = -600; var stampOffXMax = 600; var stampOffXStep = 1;

var stampOffY = 0;
var stampOffYMin = -600; var stampOffYMax = 600; var stampOffYStep = 1;

var rotateStamps = true;
var flipH = false;
var flipV = false;

var noiseBackground = true;
var noiseScale = 0.02;
var noiseScaleMin = 0.001; var noiseScaleMax = 0.12; var noiseScaleStep = 0.001;

var noiseOctaves = 4;
var noiseOctavesMin = 1; var noiseOctavesMax = 8; var noiseOctavesStep = 1;

var noiseFalloff = 0.5;
var noiseFalloffMin = 0.1; var noiseFalloffMax = 0.9; var noiseFalloffStep = 0.05;

var threshold = 0.48;
var thresholdMin = 0; var thresholdMax = 1; var thresholdStep = 0.01;

var colorNoiseScale = 0.5;
var colorNoiseScaleMin = 0.05; var colorNoiseScaleMax = 3; var colorNoiseScaleStep = 0.05;

var colorSeed = 0;
var colorSeedMin = 0; var colorSeedMax = 100; var colorSeedStep = 1;

var mirror = 4;
var mirrorMin = 0; var mirrorMax = 10; var mirrorStep = 1;

var usePixel = true;

var crossStrokeWeight = 1.5;
var crossStrokeWeightMin = 0.3; var crossStrokeWeightMax = 6; var crossStrokeWeightStep = 0.1;

var paddingX = 70;
var paddingXMin = 0; var paddingXMax = 300; var paddingXStep = 5;

var paddingY = 100;
var paddingYMin = 0; var paddingYMax = 300; var paddingYStep = 5;

var blackAndWhite = false;
var showGrid = false;

var stampGui, canvasGui;
var _allMotifs = []; // internal list, not GUI-bound

function buildMotifList() {
  _allMotifs = [
    {name: 'diamond', isBuiltin: true, builtinType: 0},
    {name: 'tree',    isBuiltin: true, builtinType: 1},
    {name: 'star',    isBuiltin: true, builtinType: 2},
  ];
  var imported = window.IMPORTED_MOTIFS || [];
  for (var i = 0; i < imported.length; i++) {
    _allMotifs.push({name: imported[i].name, isBuiltin: false, data: imported[i]});
  }
}

function setup() {
  if (typeof SVG === 'undefined') {
    createCanvas(...a3Format);
  } else {
    createCanvas(...a3Format, SVG);
  }
  pixelDensity(1);

  buildMotifList();

  stampGui = createGui('Stamp');
  // addDropDown via underlying quicksettings instance (gui.prototype)
  stampGui.prototype.addDropDown('motif', _allMotifs.map(m => m.name), function(v) {
    motifSelector = v.value;
    var entry = _allMotifs.find(m => m.name === v.value);
    if (entry && !entry.isBuiltin) {
      motifSize = max(entry.data.stitchWidth, entry.data.stitchHeight);
      stampGui.prototype.setValue('motifSize', motifSize);
    }
    redraw();
  });
  stampGui.addGlobals('motifSize', 'motifGap', 'stampOffX', 'stampOffY', 'rotateStamps', 'flipH', 'flipV');
  stampGui.setPosition(10, 10);

  canvasGui = createGui('Canvas');
  canvasGui.addGlobals(
    'seed', 'cellSize',
    'noiseBackground', 'noiseScale', 'noiseOctaves', 'noiseFalloff', 'threshold',
    'colorNoiseScale', 'colorSeed',
    'mirror', 'paddingX', 'paddingY',
    'usePixel', 'blackAndWhite', 'crossStrokeWeight', 'showGrid'
  );
  canvasGui.setPosition(240, 10);

  noLoop();
}

function keyPressed() {
  if (keyCode === 32) redraw();
  if (keyCode === 83) {
    const d = new Date();
    save('art_' + d.toISOString().split('.')[0].replaceAll(':', '-') + '.svg');
  }
}

function draw() {
  colorMode(HSB, 360, 100, 100);
  randomSeed(colorSeed);
  let pal = Array.from({length: 8}, () => color(random(360), random(50, 90), random(40, 85)));
  colorMode(RGB, 255);

  let motifEntry = _allMotifs.find(m => m.name === motifSelector) || _allMotifs[0];

  // Pre-build studio palette (colorId → p5 color)
  let studioPalette = {};
  if (!motifEntry.isBuiltin) {
    for (let cd of motifEntry.data.colors) {
      if (cd.colorId > 0) studioPalette[cd.colorId] = color(cd.hexValue);
    }
  }

  randomSeed(seed);
  noiseSeed(seed);
  noiseDetail(noiseOctaves, noiseFalloff);
  clear();
  background(243, 238, 225);

  let cols = floor((width - paddingX * 2) / cellSize);
  let rows = floor((height - paddingY * 2) / cellSize);
  let offX = floor((width - cols * cellSize) / 2);
  let offY = floor((height - rows * cellSize) / 2);

  if (showGrid) {
    stroke(210, 200, 185); strokeWeight(0.5);
    for (let c = 0; c <= cols; c++) line(offX + c * cellSize, offY, offX + c * cellSize, offY + rows * cellSize);
    for (let r = 0; r <= rows; r++) line(offX, offY + r * cellSize, offX + cols * cellSize, offY + r * cellSize);
  }

  let spacing = (motifSize + motifGap) * cellSize;

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

      let osx = sx + stampOffX;
      let osy = sy + stampOffY;
      let sCol = floor(osx / spacing);
      let sRow = floor(osy / spacing);
      let localX = osx - (sCol + 0.5) * spacing;
      let localY = osy - (sRow + 0.5) * spacing;
      let lc = round(localX / cellSize);
      let lr = round(localY / cellSize);

      if (rotateStamps) {
        let turns = (sCol * 3 + sRow * 7) % 4;
        let tmp = lc;
        for (let t = 0; t < turns; t++) { tmp = lc; lc = -lr; lr = tmp; }
      }

      let colorId = 0;

      if (motifEntry.isBuiltin) {
        colorId = getMotifColor(flipH ? -lc : lc, flipV ? -lr : lr, motifEntry.builtinType, motifSize);
      } else {
        colorId = getStudioMotifColor(lc, lr, motifEntry.data);
      }

      if (colorId > 0) {
        let c;
        if (motifEntry.isBuiltin) {
          c = blackAndWhite ? color(0) : pal[(colorId - 1) % pal.length];
        } else {
          c = blackAndWhite ? color(0) : (studioPalette[colorId] || color(0));
        }
        drawCell(col, row, offX, offY, c);
      } else if (noiseBackground) {
        let n = noise(sx * noiseScale, sy * noiseScale);
        if (n > threshold) {
          let cn = noise(sx * noiseScale * colorNoiseScale + 999, sy * noiseScale * colorNoiseScale + 999);
          let c = blackAndWhite ? color(0) : pal[constrain(floor(cn * pal.length), 0, pal.length - 1)];
          drawCell(col, row, offX, offY, c);
        }
      }
    }
  }
}

// Returns colorId for a studio motif at local grid coords (lc, lr)
function getStudioMotifColor(lc, lr, motif) {
  let halfW = floor(motif.stitchWidth / 2);
  let halfH = floor(motif.stitchHeight / 2);
  let gc = lc + halfW;
  let gr = lr + halfH;
  if (flipH) gc = motif.stitchWidth - 1 - gc;
  if (flipV) gr = motif.stitchHeight - 1 - gr;
  if (gc < 0 || gc >= motif.stitchWidth || gr < 0 || gr >= motif.stitchHeight) return 0;
  return motif.grid[gr][gc];
}

// Returns color index 0=background, 1..3=palette layers
function getMotifColor(lc, lr, type, size) {
  let half = floor(size / 2);
  if (abs(lc) > half || abs(lr) > half) return 0;
  if (type === 0) return getDiamondMotif(lc, lr, half);
  if (type === 1) return getTreeMotif(lc, lr, half, size);
  if (type === 2) return getStarMotif(lc, lr, half);
  return 0;
}

// Nested diamond: 3 concentric L1-norm rings
function getDiamondMotif(lc, lr, half) {
  let d = abs(lc) + abs(lr);
  if (d > half) return 0;
  if (d > half * 0.65) return 1;
  if (d > half * 0.3) return 2;
  return 3;
}

// Tree of life: crown diamond + vertical stem + 3 branch pairs
function getTreeMotif(lc, lr, half, size) {
  let row = lr + half;
  let crownR = max(2, floor(half * 0.28));
  let crownDist = abs(lc) + abs(row - crownR);
  if (crownDist <= crownR) return crownDist < crownR ? 3 : 1;
  let stemStart = crownR * 2 + 1;
  if (row < stemStart) return 0;
  if (lc === 0) return 2;
  let stemLen = size - stemStart;
  for (let b = 1; b <= 3; b++) {
    let branchRow = stemStart + floor(stemLen * b / 4);
    let s = abs(lc);
    let bLen = floor(half * (0.22 + b * 0.07));
    if (s >= 1 && s <= bLen && row === branchRow - s) return 3;
    if (s === bLen + 1 && abs(row - (branchRow - bLen)) <= 1 && abs(lc) <= bLen + 1) {
      let tipDist = abs(lc - (bLen + 1) * sign(lc)) + abs(row - (branchRow - bLen));
      if (tipDist <= 1) return 1;
    }
  }
  return 0;
}

function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }

// 8-pointed star: union of L1 diamond (cardinal) + Chebyshev square (ordinal)
function getStarMotif(lc, lr, half) {
  let d1 = abs(lc) + abs(lr);
  let d2 = max(abs(lc), abs(lr));
  let h2 = floor(half * 0.72);
  if (d1 > half && d2 > h2) return 0;
  if (d1 <= floor(half * 0.35) && d2 <= floor(h2 * 0.5)) return 3;
  if (d1 <= floor(half * 0.6) || d2 <= floor(h2 * 0.65)) return 2;
  return 1;
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
