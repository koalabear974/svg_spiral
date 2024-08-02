var seed = 171;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var angleIncrement = 0.21;
var angleIncrementMin = 0;
var angleIncrementMax = 1;
var angleIncrementStep = 0.0001;
var scaling = 0.8;
var scalingMin = 0;
var scalingMax = 5;
var scalingStep = 0.001;
var noiseAmplitude = 200;
var noiseAmplitudeMin = 0;
var noiseAmplitudeMax = 300;
var noiseAmplitudeStep = 1;
var pointNumber = 8000;
var pointNumberMin = 100;
var pointNumberMax = 15000;
var pointNumberStep = 100;
var showPoints = false;
var size = 5000;
var sizeMin = 0;
var sizeMax = 10000;
var sizeStep = 10;
var perlinSize = 12;
var perlinSizeMin = 1;
var perlinSizeMax = 100;
var perlinSizeStep = 1;

var startPoint = 1;
var startPointMin = 1;
var startPointMax = 10000;
var startPointStep = 1;

var noiseDiff = 10;
var noiseDiffMin = 1;
var noiseDiffMax = 100;
var noiseDiffStep = 1;

var startPointDiff = 500;
var startPointDiffMin = 0;
var startPointDiffMax = 10000;
var startPointDiffStep = 100;


var xOffset = 0;
var xOffsetMin = 0;
var xOffsetMax = 1000;
var xOffsetStep = 1;
var yOffset = 0;
var yOffsetMin = 0;
var yOffsetMax = 1000;
var yOffsetStep = 1;
var gui;

function setup() {
  if (typeof SVG === 'undefined') {
    createCanvas(...a3Format);
  } else {
    createCanvas(...a3Format, SVG);
  }
  pixelDensity(1);
  gui = createGui('My awesome GUI');
  gui.addGlobals(
    'seed',
    'scaling',
    'angleIncrement',
    'pointNumber',
    'showPoints',
    'size',
    'perlinSize',
    'noiseAmplitude',
    'startPoint',
    'noiseDiff',
    'startPointDiff',
    'xOffset',
    'yOffset',
  );
  noLoop();
}

function keyPressed() {
  if (keyCode === 32) {
    redraw();
  }
  if (keyCode === 83) {
    const d = new Date();
    let fileName = 'art_' + d.toISOString().split('.')[0].replaceAll(':', '-');
    save(fileName+".svg");
  }
}

function draw() {
  randomSeed(seed);
  clear();
  strokeWeight(1);
  noFill();

  let perlin = new Perlin(size, perlinSize);

  stroke("rgba(255, 106, 183, 0.5)")
  drawDonutSpiral(perlin, noiseAmplitude, startPoint);
  stroke("rgba(19, 252, 23, 0.5)")
  drawDonutSpiral(perlin, noiseAmplitude+noiseDiff, startPoint+startPointDiff);
  stroke("rgba(19, 199, 252, 0.5)")
  drawDonutSpiral(perlin, noiseAmplitude+noiseDiff+noiseDiff, startPoint+startPointDiff+startPointDiff);
}

function drawDonutSpiral(perlin, nA, sP) {
  let spiralPoints = [];

  let angle = 0;
  for (let i = 0; i < pointNumber; i++) {
    let r = scaling * angle
    let x1 = r * cos(angle)
    let y1 = r * sin(angle)

    let deviation = perlin.get(x1, y1);

    x1 += cos(deviation * Math.PI) * nA;
    y1 += sin(deviation * Math.PI) * nA;
    spiralPoints.push([x1, y1]);
    angle += angleIncrement;
  }
  let center = spiralPoints[0];
  let widthOffset = width/2 - center[0];
  let heightOffset = height/2 - center[1];
  spiralPoints.forEach((spiralPoint, i) => {
    spiralPoints[i] = [spiralPoint[0] + widthOffset + xOffset, spiralPoint[1] + heightOffset + yOffset];
    showPoints && circle(...spiralPoints[i],1)
  })
  // stroke(randomColorString("0.7"));

  !showPoints && drawCurve(spiralPoints.slice(sP));
}
