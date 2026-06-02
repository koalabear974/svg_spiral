var seed = 198;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var angleIncrement = 4.5;
var angleIncrementMin = 0;
var angleIncrementMax = 10;
var angleIncrementStep = 0.001;
var scaling = 1;
var scalingMin = 0;
var scalingMax = 5;
var scalingStep = 0.001;
var noiseAmplitude = 200;
var noiseAmplitudeMin = 0;
var noiseAmplitudeMax = 300;
var noiseAmplitudeStep = 1;
var pointNumber = 200;
var pointNumberMin = 10;
var pointNumberMax = 1500;
var pointNumberStep = 10;
var showPoints = false;
var size = 5000;
var sizeMin = 0;
var sizeMax = 10000;
var sizeStep = 10;
var perlinSize = 10;
var perlinSizeMin = 1;
var perlinSizeMax = 100;
var perlinSizeStep = 1;

var startPoint = 10;
var startPointMin = 1;
var startPointMax = 10000;
var startPointStep = 1;

var noiseDiff = 0;
var noiseDiffMin = 1;
var noiseDiffMax = 100;
var noiseDiffStep = 1;

var startPointDiff = 0;
var startPointDiffMin = 100;
var startPointDiffMax = 10000;
var startPointDiffStep = 100;


var lineThickness = 10;
var lineThicknessSetp = 1;
var lineThicknessMin = 1;
var lineThicknessMax = 100;
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
  const a1Format = [1889, 2648];
  if (typeof SVG === 'undefined') {
    createCanvas(...a1Format);
  } else {
    createCanvas(...a1Format, SVG);
  }
  pixelDensity(1);
  gui = createGui('My awesome GUI');
  gui.addGlobals(
    'seed',
    'scaling',
    'lineThickness',
    'angleIncrement',
    'pointNumber',
    'showPoints',
    'size',
    'perlinSize',
    'noiseAmplitude',
    'startPoint',
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
  strokeWeight(lineThickness);
  noFill();

  let perlin = new Perlin(size, perlinSize);

  // background("black")
  stroke("black")
  drawDonutSpiral(perlin, noiseAmplitude, startPoint);
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
