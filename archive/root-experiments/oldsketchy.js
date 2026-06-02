var seed = 332;
// var seed = 540;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var lineNumber = 160;
var lineNumberMin = 1;
var lineNumberMax = 500;
var lineNumberStep = 1;
var noiseScale = 250;
var noiseScaleMin = 1;
var noiseScaleMax = 1000;
var noiseScaleStep = 1;
var scaleFactor = 3.5;
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

var waveSize = 25;
var waveSizeMin = 0;
var waveSizeMax = 120;
var waveSizeStep = 5;

var xDisplacement = 0;
var xDisplacementMin = 0;
var xDisplacementMax = 1;
var xDisplacementStep = 0.01;
var gui;

function setup() {
  if (typeof SVG === 'undefined') {
    createCanvas(...a4Format4);
  } else {
    createCanvas(...a4Format4, SVG);
  }
  pixelDensity(1);
  gui = createGui('My awesome GUI');
  let map = [
    'seed',
    'lineNumber',
    'noiseScale',
    'scaleFactor',
    'wrinkles',
    'frequency',
    'waveSize',
    'xDisplacement',
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
  background("white");
  stroke("black");
  noFill();

  const gridX = noiseScale;
  const gridY = lineNumber; // min=10, max=400, step=1
  const fieldSize = 200; // min=100, max=200, step=1

  let noise = new SimplexNoise(seed);

  let minHeights = [];
  for (let x = 0; x < gridX; x++) {
    minHeights[x] = 200;
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
      lines[gy][gx] = [((x + (h - y) * xDisplacement) * scaleFactor + (width / 2)), h * scaleFactor + (height / 2)];
    }
    walkContinue = i < gridX * gridY - 1;
    i++;
  }

  // stroke(randomColorString(0.7));
  stroke("rgba(255,0,0,0.7)");
  // stroke("black");
  lines.forEach((line, i) => {
    if (i === 0) return;
    drawCurve(line);
  });
  groupSVGNodes('path', 'g1');

  // noise = new SimplexNoise(seed +1 );
  minHeights = [];
  for (let x = 0; x < gridX; x++) {
    minHeights[x] = 200;
  }
  i = 0;
  walkContinue = true;
  lines = [];
  while (walkContinue) {
    const gx = (i % gridX);
    const gy = (i / gridX) | 0;

    const x = gx * fieldSize / (gridX - 1) - fieldSize / 2;
    const y = (gridY - gy) / gridY * fieldSize - fieldSize / 2;

    let r = (waveSize + 15) * .2 * wrinkleNoise(noise, wrinkles, x * frequency / fieldSize, y * frequency / fieldSize);
    const h = minHeights[gx] = Math.min(y + r, minHeights[gx]);

    if (gy != (((i - 1) / gridX) | 0) || i < 2) {
    } else {
      if (typeof lines[gy] === "undefined") lines[gy] = [];
      lines[gy][gx] = [((x + (h - y) * xDisplacement) * scaleFactor + (width / 2)), h * scaleFactor + (height / 2)];
      // lines[gy][gx] = [x* scaleFactor + (width / 2), y * scaleFactor + (height / 2)];
    }
    walkContinue = i < gridX * gridY - 1;
    i++;
  }
  // stroke(randomColorString(0.7));
  stroke("rgba(0,255,0,0.7)");
  lines.forEach((line, i) => {
    if (i === 0) return;
    drawCurve(line);
  });
  groupSVGNodes('path', 'g2');

  // noise = new SimplexNoise(seed +2);
  //  minHeights = [];
  // for (let x = 0; x < gridX; x++) {
  //   minHeights[x] = 200;
  // }
  // i = 0;
  // walkContinue = true;
  // lines = [];
  // while (walkContinue) {
  //   const gx = (i % gridX);
  //   const gy = (i / gridX) | 0;
  //
  //   const x = gx * fieldSize / (gridX - 1) - fieldSize / 2;
  //   const y = (gridY - gy) / gridY * fieldSize - fieldSize / 2;
  //
  //   let r = (waveSize + 0) * .2 * wrinkleNoise(noise, wrinkles, x * frequency / fieldSize, y * frequency / fieldSize);
  //   const h = minHeights[gx] = Math.min(y + r, minHeights[gx]);
  //
  //   if (gy != (((i - 1) / gridX) | 0) || i < 2) {
  //   } else {
  //     if (typeof lines[gy] === "undefined") lines[gy] = [];
  //     lines[gy][gx] = [((x + (h - y) * xDisplacement) * scaleFactor + (width / 2)), h * scaleFactor + (height / 2)];
  //     // lines[gy][gx] = [x* scaleFactor + (width / 2), y * scaleFactor + (height / 2)];
  //   }
  //   walkContinue = i < gridX * gridY - 1;
  //   i++;
  // }
  // // stroke(randomColorString(0.7));
  //
  // stroke("rgba(0,0,255,0.7)");
  // lines.forEach((line, i) => {
  //   if (i === 0) return;
  //   drawCurve(line);
  // });
  // groupSVGNodes('path', 'g3');

  function wrinkleNoise(noise, wrinkles, x, y) {
    let n = noise.noise2D([x, y]);
    return Math.sin(n * 3. * wrinkles) * ((.5 + .5 * n) ** 2);
  }
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
