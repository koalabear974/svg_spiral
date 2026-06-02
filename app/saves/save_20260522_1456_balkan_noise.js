var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;

var cellSize = 20;
var cellSizeMin = 4;
var cellSizeMax = 40;
var cellSizeStep = 1;

var noiseScale = 0.01;
var noiseScaleMin = 0.001;
var noiseScaleMax = 0.12;
var noiseScaleStep = 0.001;

var noiseOctaves = 4;
var noiseOctavesMin = 1;
var noiseOctavesMax = 8;
var noiseOctavesStep = 1;

var noiseFalloff = 0.5;
var noiseFalloffMin = 0.1;
var noiseFalloffMax = 0.9;
var noiseFalloffStep = 0.05;

var threshold = 0.5;
var thresholdMin = 0;
var thresholdMax = 1;
var thresholdStep = 0.01;

var colorNoiseScale = 0.5;
var colorNoiseScaleMin = 0.05;
var colorNoiseScaleMax = 3;
var colorNoiseScaleStep = 0.05;

var colorSeed = 0;
var colorSeedMin = 0;
var colorSeedMax = 100;
var colorSeedStep = 1;

var mirror = 4;
var mirrorMin = 0;
var mirrorMax = 10;
var mirrorStep = 1;

var usePixel = true;

var crossStrokeWeight = 6;
var crossStrokeWeightMin = 0.3;
var crossStrokeWeightMax = 6;
var crossStrokeWeightStep = 0.1;

var paddingX = 70;
var paddingXMin = 0;
var paddingXMax = 300;
var paddingXStep = 5;

var paddingY = 100;
var paddingYMin = 0;
var paddingYMax = 300;
var paddingYStep = 5;

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
  gui = createGui('Cross Stitch');
  let globals = [
    'seed',
    'cellSize',
    'noiseScale',
    'noiseOctaves',
    'noiseFalloff',
    'threshold',
    'colorNoiseScale',
    'colorSeed',
    'mirror',
    'paddingX',
    'paddingY',
    'usePixel',
    'blackAndWhite',
    'crossStrokeWeight',
    'showGrid',
  ];
  gui.addGlobals(...globals);
  noLoop();
}

function keyPressed() {
  if (keyCode === 32) {
    redraw();
  }
  if (keyCode === 83) {
    const d = new Date();
    let fileName = 'art_' + d.toISOString().split('.')[0].replaceAll(':', '-');
    save(fileName + ".svg");
  }
}

function draw() {
  colorMode(HSB, 360, 100, 100);
  randomSeed(colorSeed);
  let pal = Array.from({length: 8}, () => color(random(360), random(50, 90), random(40, 85)));
  colorMode(RGB, 255);

  randomSeed(seed);
  noiseSeed(seed);
  noiseDetail(noiseOctaves, noiseFalloff);
  clear();
  background(243, 238, 225); // linen

  let cols = floor((width - paddingX * 2) / cellSize);
  let rows = floor((height - paddingY * 2) / cellSize);
  let offX = floor((width - cols * cellSize) / 2);
  let offY = floor((height - rows * cellSize) / 2);

  if (showGrid) {
    stroke(210, 200, 185);
    strokeWeight(0.5);
    for (let c = 0; c <= cols; c++) {
      line(offX + c * cellSize, offY, offX + c * cellSize, offY + rows * cellSize);
    }
    for (let r = 0; r <= rows; r++) {
      line(offX, offY + r * cellSize, offX + cols * cellSize, offY + r * cellSize);
    }
  }

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      let cx = offX + col * cellSize + cellSize * 0.5;
      let cy = offY + row * cellSize + cellSize * 0.5;

      // kaleidoscope fold
      let sx = cx;
      let sy = cy;
      if (mirror > 0) {
        let dx = cx - width * 0.5;
        let dy = cy - height * 0.5;
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
        let c = blackAndWhite ? color(0) : pal[constrain(floor(colorN * pal.length), 0, pal.length - 1)];

        if (usePixel) {
          noStroke();
          fill(c);
          rect(offX + col * cellSize, offY + row * cellSize, cellSize, cellSize);
        } else {
          noFill();
          stroke(c);
          strokeWeight(crossStrokeWeight);
          let m = cellSize * 0.18;
          let x1 = offX + col * cellSize + m;
          let y1 = offY + row * cellSize + m;
          let x2 = offX + (col + 1) * cellSize - m;
          let y2 = offY + (row + 1) * cellSize - m;
          line(x1, y1, x2, y2);
          line(x2, y1, x1, y2);
        }
      }
    }
  }
}
