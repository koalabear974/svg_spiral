var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var gui;

var circleRadius = 500;
var circleRadiusMin = 10;
var circleRadiusMax = 1000;
var circleRadiusStep = 1;

var circleResolution = 5000;
var circleResolutionMin = 10;
var circleResolutionMax = 10000;
var circleResolutionStep = 10;

var angleIncrement = 0.5;
var angleIncrementMin = 0;
var angleIncrementMax = 5;
var angleIncrementStep = 0.05;

var addPoints = 1;
var addPointsMin = 0;
var addPointsMax = 20;
var addPointsStep = 1;


var coilXFactor = 60;
var coilXFactorMin = 0;
var coilXFactorMax = 200;
var coilXFactorStep = 1;
var coilYFactor = 60;
var coilYFactorMin = 0;
var coilYFactorMax = 200;
var coilYFactorStep = 1;

var noiseFactor = 0.001;
var noiseFactorMin = 0;
var noiseFactorMax = 0.002;
var noiseFactorStep = 0.0001;
var noiseStrengh = 200;
var noiseStrenghMin = 0;
var noiseStrenghMax = 2000;
var noiseStrenghStep = 100;
var noiseOffset = 0;
var noiseOffsetMin = -1000;
var noiseOffsetMax = 1000;
var noiseOffsetStep = 1;

var xOffset = 0;
var xOffsetMin = 0;
var xOffsetMax = 200;
var xOffsetStep = 1;
var yOffset = 0;
var yOffsetMin = 0;
var yOffsetMax = 200;
var yOffsetStep = 1;

function setup() {
  if (typeof SVG === 'undefined') {
    createCanvas(...a3Format);
  } else {
    createCanvas(...a3Format, SVG);
  }
  pixelDensity(1);
  gui = createGui('My awesome GUI');
  let globals  = [
    'seed',
    'circleRadius',
    'circleResolution',
    'angleIncrement',
    'addPoints',
    'coilXFactor',
    'coilYFactor',
    'noiseFactor',
    'noiseStrengh',
    'noiseOffset',
    'xOffset',
    'yOffset',
  ]
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
  randomSeed(seed);
  noiseSeed(seed);
  clear();

  let pageCenter = getPageCenter();
  pageCenter[0] = pageCenter[0] + xOffset;
  pageCenter[1] = pageCenter[1] + yOffset;

  // Make a circle that have a center in the page center
  let circlePoints = generateCirclePoints({
    point: pageCenter,
    radius: circleRadius
  }, circleResolution);
  let coilPoints = [];

  let angle = 0;
  let noiseRange = circlePoints.length/2;
  let noiseI = 0;
  for (let i = 0; i < circlePoints.length; i++) {
    let n = noise((noiseI+noiseOffset) * noiseFactor) * noiseStrengh
    let x1 = circlePoints[i][0] + cos(angle) * n;
    let y1 = circlePoints[i][1] + sin(angle) * n;
    coilPoints.push([x1, y1]);
    // stroke("black");
    // fill("black");
    // circle(...[x1, y1], 1);
    angle += angleIncrement;
    noiseI = i > noiseRange ? noiseI - 1 : noiseI + 1
  }
  for (let i = 0; i < addPoints; i++) {
    let n = noise((noiseI+noiseOffset) * noiseFactor) * noiseStrengh
    let x1 = circlePoints[i][0] + cos(angle) * n;
    let y1 = circlePoints[i][1] + sin(angle) * n;
    coilPoints.push([x1, y1]);
    // stroke("black");
    // fill("black");
    // circle(...[x1, y1], 1);
    angle += angleIncrement;
  }

  noFill();
  stroke(randomColor());
  drawCurve(coilPoints);
}
