var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var angleIncrement = 0.13;
var angleIncrementMin = 0;
var angleIncrementMax = 5;
var angleIncrementStep = 0.001;
var scaling = 0.7;
var scalingMin = 0;
var scalingMax = 5;
var scalingStep = 0.001;
var noiseAmplitude = 75;
var noiseAmplitudeMin = 0;
var noiseAmplitudeMax = 100;
var noiseAmplitudeStep = 1;
var pointNumber = 1400;
var pointNumberMin = 100;
var pointNumberMax = 2000;
var pointNumberStep = 100;
var showPoints = false;
var size = 4000;
var sizeMin = 1000;
var sizeMax = 10000;
var sizeStep = 100;
var perlinSize = 30;
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
    'pointNumber',
    'size',
    'noiseAmplitude',
  ];
  loadMIDIMapping(map);
}

function draw() {
  clear();
  noFill();

  randomSeed(seed);
  let perlin = new Perlin(size, perlinSize);
  drawSpiral(perlin, getPageCenter())
}

function drawSpiral(perlin, center) {
  let spiralPoints = [];

  let angle = 0;
  for (let i = 0; i < pointNumber; i++) {
    let r = scaling * angle
    let x1 = r * cos(angle)
    let y1 = r * sin(angle)

    let deviation = perlin.get(x1, y1);

    x1 += cos(deviation * Math.PI) * noiseAmplitude;
    y1 += sin(deviation * Math.PI) * noiseAmplitude;
    spiralPoints.push([x1, y1]);
    angle += angleIncrement;
  }
  let curCenter = spiralPoints[0];
  let widthOffset = center[0] - curCenter[0];
  let heightOffset = center[1] - curCenter[1];
  spiralPoints.forEach((spiralPoint, i) => {
    spiralPoints[i] = [spiralPoint[0] + widthOffset, spiralPoint[1] + heightOffset];
    stroke("blue");
    showPoints && circle(...spiralPoints[i],1)
  })
  stroke("black");

  !showPoints && drawCurve(spiralPoints);
}

