var seed = 332;
// var seed = 540;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var lineNumber = 150;
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
  // background("white");
  stroke("black");
  clear()
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
  stroke("black");
  lines.forEach((line, i) => {
    if (i === 0) return;
    drawCurve(line);
  });
  groupSVGNodes('path', 'g1');

  // // noise = new SimplexNoise(seed +1 );
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
  //   let r = (waveSize + 20) * .2 * wrinkleNoise(noise, wrinkles, x * frequency / fieldSize, y * frequency / fieldSize);
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
  // stroke(randomColorString(0.7));
  // stroke("rgba(0,255,0,0.7)");
  // lines.forEach((line, i) => {
  //   if (i === 0) return;
  //   drawCurve(line);
  // });
  // groupSVGNodes('path', 'g2');

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

}

