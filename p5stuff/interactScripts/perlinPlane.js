var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var lineNumber = 60;
var lineNumberMin = 1;
var lineNumberMax = 500;
var lineNumberStep = 1;
var pointNumber = 100;
var pointNumberMin = 1;
var pointNumberMax = 1000;
var pointNumberStep = 1;
var noiseAmplitude = 12;
var noiseAmplitudeStep = 1;
var noiseAmplitudeMin = 1;
var noiseAmplitudeMax = 50;
var scaleFactor = 1.3;
var scaleFactorMin = 0.01;
var scaleFactorMax = 10;
var scaleFactorStep = 0.01;

var size = 600;
var sizeMin = 250;
var sizeMax = 1500;
var sizeStep = 10;
var perlinSize = 20;
var perlinSizeMin = 1;
var perlinSizeMax = 100;
var perlinSizeStep = 1;
var gui;

function setup() {
  if (typeof SVG === 'undefined') {
    createCanvas(...a6Format);
  } else {
    createCanvas(...a6Format, SVG, "main");
  }
  pixelDensity(1);
  loadMidiSetting();
  noLoop();
}

function loadMidiSetting() {
  let map = [
    'noiseAmplitude',
    'size',
  ];

  loadMIDIMapping(map);
}

function draw() {
  clear();
  noFill();

  randomSeed(seed);
  let perlin = new Perlin(size, perlinSize);
  drawPerlinPlane(perlin, getPageCenter())
}

function drawPerlinPlane(perlin, center) {

  const gridX = pointNumber;
  const gridY = lineNumber; // min=10, max=400, step=1
  const fieldSize = 200; // min=100, max=200, step=1

  let i = 0;
  let walkContinue = true;
  let lines = [];
  while (walkContinue) {
    const gx = (i % gridX);
    const gy = (i / gridX) | 0;

    const x = gx * fieldSize / (gridX - 1) - fieldSize / 2;
    const y = (gridY - gy) / gridY * fieldSize - fieldSize / 2;

    if (gy != (((i - 1) / gridX) | 0) || i < 2) {
    } else {
      if (typeof lines[gy] === "undefined") lines[gy] = [];
      let deviation = perlin.get(x, y);

      let x1 = x + cos(deviation * Math.PI) * noiseAmplitude;
      let y1 = y + sin(deviation * Math.PI) * noiseAmplitude;
      lines[gy][gx] = [x1* scaleFactor  + (width / 2), y1* scaleFactor + (height / 2)];
    }
    walkContinue = i < gridX * gridY - 1;
    i++;
  }

  let firstPoint = lines[1][1];
  let lastPoint = lines[gridY -1 ][gridX -1 ];
  let shapeCenter = [
    (firstPoint[0] + lastPoint[0]) / 2,
    (firstPoint[1] + lastPoint[1]) / 2,
  ];
  let widthOffset = center[0] - shapeCenter[0];
  let heightOffset = center[1] - shapeCenter[1];
  lines.forEach((line, i1) => {
    line.forEach((point, i2) => {
      lines[i1][i2] = [point[0] + widthOffset, point[1] + heightOffset];
    })
  })

  stroke("black");
  lines.forEach((line, i) => {
    if (i === 0) return;
    drawCurve(line);
  });
}

