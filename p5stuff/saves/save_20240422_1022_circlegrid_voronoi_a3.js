var seed = 416;
// var seed = 540;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;

var seed2 = 278;
var seed2Min = 0;
var seed2Max = 1000;
var seed2Step = 1;

var seed3 = 300;
var seed3Min = 0;
var seed3Max = 1000;
var seed3Step = 1;
// var lineNumber = 100;
var lineNumber = 70;
var lineNumberMin = 1;
var lineNumberMax = 500;
var lineNumberStep = 1;
// var noiseScale = 100;
var noiseScale = 85;
var noiseScaleMin = 1;
var noiseScaleMax = 1000;
var noiseScaleStep = 1;
// var fieldSize = 300;
var fieldSize = 500;
var fieldSizeMin = 1;
var fieldSizeMax = 1000;
var fieldSizeStep = 1;
var scaleFactor = 2;
var scaleFactorMin = 0.01;
var scaleFactorMax = 10;
var scaleFactorStep = 0.01;
var wrinkles = 3;
var wrinklesMin = 0;
var wrinklesMax = 20;
var wrinklesStep = 0.1;

// var frequency = 0.74;
var frequency = 0.3;
var frequencyMin = 0.01;
var frequencyMax = 5;
var frequencyStep = 0.01;

// var waveSize = 90;
var waveSize = 300;
var waveSizeMin = 0;
var waveSizeMax = 300;
var waveSizeStep = 5;

var rScale = 1.5;
var rScaleMin = 1;
var rScaleMax = 4;
var rScaleStep = 0.01;

var rOffset = 10;
var rOffsetMin = 1;
var rOffsetMax = 100;
var rOffsetStep = 1;

var vertPadding = 80;
var vertPaddingMin = 0;
var vertPaddingMax = 100;
var vertPaddingStep = 1;
var vertPadding = 80;
var vertPaddingMin = 0;
var vertPaddingMax = 100;
var vertPaddingStep = 1;
var gui;

function setup() {
  if (typeof SVG === 'undefined') {
    createCanvas(...a3Format);
  } else {
    createCanvas(...a3Format, SVG);
  }
  pixelDensity(1);
  gui = createGui('My awesome GUI');
  let map = [
    'seed',
    'seed2',
    'lineNumber',
    'noiseScale',
    'fieldSize',
    'scaleFactor',
    'wrinkles',
    'frequency',
    'waveSize',
    'rScale',
    'rOffset',
    'vertPadding',
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
  clear();
  noFill();

  let noise = new SimplexNoise(seed);
  stroke("cyan")
  drawVoronoiCurve(noise, waveSize);

  noise = new SimplexNoise(seed2);
  stroke("yellow")
  drawVoronoiCurve(noise, waveSize);

  noise = new SimplexNoise(seed3);
  stroke("magenta")
  drawVoronoiCurve(noise, waveSize);
}

// Need 70x85
function drawVoronoiCurve(noise, waveSize) {
  const gridX = noiseScale;
  const gridY = lineNumber; // min=10, max=400, step=1

  let minHeights = [];
  for (let x = 0; x < gridX; x++) {
    minHeights[x] = 400;
  }

  let i = 0;
  let walkContinue = true;
  let lines = [];
  let minR = 10000;
  let maxR = 0;
  while (walkContinue) {
    const gx = (i % gridX);
    const gy = (i / gridX) | 0;

    const x = gx * fieldSize / (gridX - 1) - fieldSize / 2;
    const y = (gridY - gy) / gridY * fieldSize - fieldSize / 2;


    let r = waveSize * .2 * wrinkleNoise(noise, wrinkles, x * frequency / fieldSize, y * frequency / fieldSize);
    const h = minHeights[gx] = Math.min(y + r, minHeights[gx]);
    if (r > maxR) maxR = r
    if (r < minR) minR = r

    if (gy != (((i - 1) / gridX) | 0) || i < 2) {
    } else {
      if (typeof lines[gy] === "undefined") lines[gy] = [];

      let point = [(x * scaleFactor + (width / 2)), h * scaleFactor + (height / 2)]

      if (point[0] > vertPadding && point[0] < width - vertPadding ) {
        // text(h, ...[(x * scaleFactor + (width / 2)), y * scaleFactor + (height / 2)]);
        circle(...[(x * scaleFactor + (width / 2)), y * scaleFactor + (height / 2)], (r * rScale) + rOffset)
        // if (r>0) {
        //   stroke("red")
        //   circle(...[(x * scaleFactor + (width / 2)), y * scaleFactor + (height / 2)], r * rScale)
        // } else {
        //   stroke("blue")
        //   circle(...[(x * scaleFactor + (width / 2)), y * scaleFactor + (height / 2)], r * rScale)
        // }
      }

      lines[gy][gx] = point;
    }
    walkContinue = i < gridX * gridY - 1;
    i++;
  }

  lines.forEach((line, i) => {
    line.forEach((point, lineI) => {
      if (point[0] <= vertPadding || point[0] >= width - vertPadding ) delete line[lineI];
    })
  })

  stroke(randomColorString(0.7));
  // stroke("rgba(255,0,0,0.7)");
  // stroke("black");
  lines.forEach((line, i) => {
    if (i === 0) return;
    // drawCurve(line);
  });
}
