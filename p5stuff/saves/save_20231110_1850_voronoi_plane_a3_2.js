var seed = 203;
// var seed = 540;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var lineNumber = 15;
var lineNumberMin = 1;
var lineNumberMax = 500;
var lineNumberStep = 1;
var noiseScale = 250;
var noiseScaleMin = 1;
var noiseScaleMax = 1000;
var noiseScaleStep = 1;
var scaleFactor = 1.8;
var scaleFactorMin = 0.01;
var scaleFactorMax = 10;
var scaleFactorStep = 0.01;
var wrinkles = 10.3;
var wrinklesMin = 0;
var wrinklesMax = 20;
var wrinklesStep = 0.1;

var frequency = 0.74;
var frequencyMin = 0.1;
var frequencyMax = 10;
var frequencyStep = 0.01;

var waveSize = 170;
var waveSizeMin = 0;
var waveSizeMax = 400;
var waveSizeStep = 5;
var waveDiff = 100;
var waveDiffMin = 0;
var waveDiffMax = 400;
var waveDiffStep = 5;

var xDisplacement = 0;
var xDisplacementMin = 0;
var xDisplacementMax = 1;
var xDisplacementStep = 0.01;

var vertPadding = 40;
var vertPaddingMin = 0;
var vertPaddingMax = 100;
var vertPaddingStep = 1;

var weightS = 50;
var weightSMin = 0;
var weightSMax = 100;
var weightSStep = 1;

// Blend mode selection (0=BLEND, 1=ADD, 2=DARKEST, 3=LIGHTEST, 4=EXCLUSION, 5=MULTIPLY, 6=SCREEN, 7=REPLACE, 8=REMOVE, 9=DIFFERENCE, 10=OVERLAY, 11=HARD_LIGHT, 12=SOFT_LIGHT, 13=DODGE, 14=BURN)
var blendModeIndex = 5; // MULTIPLY - RGB primaries blend to black
var blendModeIndexMin = 0;
var blendModeIndexMax = 14;
var blendModeIndexStep = 1;

var blendModes;
var blendModeNames = ['BLEND', 'ADD', 'DARKEST', 'LIGHTEST', 'EXCLUSION', 'MULTIPLY', 'SCREEN', 'REPLACE', 'REMOVE', 'DIFFERENCE', 'OVERLAY', 'HARD_LIGHT', 'SOFT_LIGHT', 'DODGE', 'BURN'];

// Set to true for blend modes (canvas), false for SVG export
var useCanvasMode = true;

var gui;

function setup() {
  if (typeof SVG === 'undefined' || useCanvasMode) {
    createCanvas(...a4Format4);
  } else {
    createCanvas(...a4Format4, SVG);
  }
  pixelDensity(1);

  // Initialize blend modes array (p5.js constants available after setup)
  blendModes = [BLEND, ADD, DARKEST, LIGHTEST, EXCLUSION, MULTIPLY, SCREEN, REPLACE, REMOVE, DIFFERENCE, OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, BURN];

  gui = createGui('My awesome GUI');
  let map = [
    'seed',
    'lineNumber',
    'noiseScale',
    'scaleFactor',
    'wrinkles',
    'frequency',
    'waveSize',
    'waveDiff',
    'weightS',
    'vertPadding',
    'blendModeIndex',
  ];
  gui.addGlobals(...map);
  loadMIDIMapping(map);
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
  randomSeed(seed);
  noiseSeed(seed);

  // Reset blend mode to draw background
  blendMode(BLEND);

  // ADD/SCREEN need dark background, MULTIPLY/others need light background
  var additiveModes = [1, 6]; // ADD=1, SCREEN=6
  if (additiveModes.includes(blendModeIndex)) {
    background(0); // Black background for additive modes
  } else {
    background(255); // White background for other modes
  }
  noFill();

  let noise = new SimplexNoise(seed);
  strokeWeight(weightS);
  blendMode(blendModes[blendModeIndex]);
  console.log('Blend mode:', blendModeNames[blendModeIndex]);


  // stroke(0, 255, 0);  // Pure Green
  stroke("rgba(90,0,0,1)");
  drawVoronoiCurve(noise, waveSize-waveDiff);

  // Primary colors - MULTIPLY mode makes overlaps darker, RGB overlaps = black
  // stroke(255, 0, 0);  // Pure Red
  stroke("rgba(180,0,0,1)");
  drawVoronoiCurve(noise, waveSize);

  // stroke(0, 255, 0);  // Pure Green
  stroke("rgba(255,0,0,1)");
  drawVoronoiCurve(noise, waveSize+waveDiff);

  // stroke(0, 0, 255);  // Pure Blue
  // drawVoronoiCurve(noise, waveSize-waveDiff);
}

function drawVoronoiCurve(noise, waveSize, yOffset = 0) {
  const gridX = noiseScale;
  const gridY = lineNumber; // min=10, max=400, step=1
  const fieldSize = 500; // min=100, max=200, step=1

  let minHeights = [];
  for (let x = 0; x < gridX; x++) {
    minHeights[x] = 400;
  }

  let i = 0;
  let walkContinue = true;
  let lines = [];
  while (walkContinue) {
    const gx = (i % gridX);
    const gy = (i / gridX) | 0;

    const x = gx * fieldSize / (gridX - 1) - fieldSize / 2;
    const y = (gridY - gy) / gridY * fieldSize - fieldSize / 2;

    let r = waveSize * .2 * wrinkleNoise(noise, wrinkles, x * frequency / fieldSize, y * frequency / fieldSize);
    const h = minHeights[gx] = Math.min(y + r, minHeights[gx]);

    if (gy != (((i - 1) / gridX) | 0) || i < 2) {
    } else {
      if (typeof lines[gy] === "undefined") lines[gy] = [];
      lines[gy][gx] = [((x + (h - y) * xDisplacement) * scaleFactor + (width / 2)), h * scaleFactor + (height / 2)+ yOffset];
    }
    walkContinue = i < gridX * gridY - 1;
    i++;
  }

  lines.forEach((line, i) => {
    line.forEach((point, lineI) => {
      if (point[0] <= vertPadding || point[0] >= width - vertPadding ) delete line[lineI];
    })
  })

  // stroke(randomColorString(0.7));
  // stroke("rgba(255,0,0,0.7)");
  // stroke("black");
  lines.forEach((line, i) => {
    if (i === 0) return;
    drawCurve(line);
  });
}


////////////////////////////////////////////////////////////////
// Simplex Noise utility code. Created by Reinder Nijhoff 2020
// https://turtletoy.net/turtle/6e4e06d42e
// Based on: http://webstaff.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
////////////////////////////////////////////////////////////////
function SimplexNoise(seed = 1) {
  const grad = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
  const const1 = 255;
  const const2 = 512;
  const const3 = 256;
  const perm = new Uint8Array(const2);

  const F2 = (Math.sqrt(3) - 1) / 2, F3 = 1 / 3;
  const G2 = (3 - Math.sqrt(3)) / 6, G3 = 1 / 6;

  const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];
  const sub2 = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

  class SimplexNoise {
    constructor(seed = 1) {
      for (let i = 0; i < const2; i++) {
        perm[i] = i & const1;
      }
      for (let i = 0; i < const1; i++) {
        const r = (seed = this.hash(i + seed)) % (const3 - i) + i;
        const swp = perm[i];
        perm[i + const3] = perm[i] = perm[r];
        perm[r + const3] = perm[r] = swp;
      }
    }

    noise2D(p) {
      const s = dot2(p, [F2, F2]);
      const c = [Math.floor(p[0] + s), Math.floor(p[1] + s)];
      const i = c[0] & const1, j = c[1] & const1;
      const t = dot2(c, [G2, G2]);

      const p0 = sub2(p, sub2(c, [t, t]));
      const o = p0[0] > p0[1] ? [1, 0] : [0, 1];
      const p1 = sub2(sub2(p0, o), [-G2, -G2]);
      const p2 = sub2(p0, [1 - 2 * G2, 1 - 2 * G2]);

      let n = Math.max(0, 0.5 - dot2(p0, p0)) ** 4 * dot2(grad[perm[i + perm[j]] % 12], p0);
      n += Math.max(0, 0.5 - dot2(p1, p1)) ** 4 * dot2(grad[perm[i + o[0] + perm[j + o[1]]] % 12], p1);
      n += Math.max(0, 0.5 - dot2(p2, p2)) ** 4 * dot2(grad[perm[i + 1 + perm[j + 1]] % 12], p2);

      return 70 * n;
    }

    hash(i) {
      i = 1103515245 * ((i >> 1) ^ i);
      const h32 = 1103515245 * (i ^ (i >> 3));
      return h32 ^ (h32 >> 16);
    }
  }

  return new SimplexNoise(seed);
}

function wrinkleNoise(noise, wrinkles, x, y) {
  let n = noise.noise2D([x, y]);
  return Math.sin(n * 3. * wrinkles) * ((.5 + .5 * n) ** 2);
}
