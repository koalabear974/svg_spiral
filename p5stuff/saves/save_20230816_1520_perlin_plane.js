var seed = 115;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var lineNumber = 170;
var lineNumberMin = 1;
var lineNumberMax = 500;
var lineNumberStep = 1;
var pointNumber = 250;
var pointNumberMin = 1;
var pointNumberMax = 1000;
var pointNumberStep = 1;
var noiseAmplitude = 12;
var noiseAmplitudeStep = 0.1;
var noiseAmplitudeMin = 1;
var noiseAmplitudeMax = 100;
var scaleFactor = 3;
var scaleFactorMin = 0.01;
var scaleFactorMax = 10;
var scaleFactorStep = 0.01;

var size = 400;
var sizeMin = 0;
var sizeMax = 1000;
var sizeStep = 10;
var perlinSize = 20;
var perlinSizeMin = 1;
var perlinSizeMax = 100;
var perlinSizeStep = 1;
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
    'lineNumber',
    'pointNumber',
    'noiseAmplitude',
    'scaleFactor',
    'size',
    'perlinSize',
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

  const gridX = pointNumber;
  const gridY = lineNumber; // min=10, max=400, step=1
  const fieldSize = 200; // min=100, max=200, step=1

  const perlin = new Perlin(size, perlinSize);

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



  // X coordinate is (x1 + x2) / 2
  //
  // y coordinate is (y1 + y2) / 2
  let firstPoint = lines[1][1];
  let lastPoint = lines[gridY -1 ][gridX -1 ];
  let center = [
    (firstPoint[0] + lastPoint[0]) / 2,
    (firstPoint[1] + lastPoint[1]) / 2,
  ];
  let widthOffset = width/2 - center[0];
  let heightOffset = height/2 - center[1];
  lines.forEach((line, i1) => {
    line.forEach((point, i2) => {
      lines[i1][i2] = [point[0] + widthOffset, point[1] + heightOffset];
    })
  })

  // stroke(randomColorString(0.7));
  stroke("black");
  lines.forEach((line, i) => {
    if (i === 0) return;
    drawCurve(line);
  });
  // groupSVGNodes('path', 'g1');
}
