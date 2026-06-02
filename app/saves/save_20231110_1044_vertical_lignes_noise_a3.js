var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;

var horizontalPoints = 10;
var horizontalPointsMin = 0;
var horizontalPointsMax = 20;
var horizontalPointsStep = 1;
var horizontalSpacing = 100;
var horizontalSpacingMin = 0;
var horizontalSpacingMax = 500;
var horizontalSpacingStep = 1;
var verticalPoints = 400;
var verticalPointsMin = 0;
var verticalPointsMax = 500;
var verticalPointsStep = 1;
var verticalSpacing = 3;
var verticalSpacingMin = 0;
var verticalSpacingMax = 50;
var verticalSpacingStep = 1;
var resetSpacing = 40;
var resetSpacingMin = 0;
var resetSpacingMax = 500;
var resetSpacingStep = 1;

var noiseFactor = 0.01;
var noiseFactorMin = 0;
var noiseFactorMax = 0.1;
var noiseFactorStep = 0.0001;
var noiseStrentgh = 170;
var noiseStrentghMin = 0;
var noiseStrentghMax = 1000;
var noiseStrentghStep = 1;
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
    'horizontalPoints',
    'horizontalSpacing',
    'verticalPoints',
    'verticalSpacing',
    'noiseFactor',
    'noiseStrentgh',
    'resetSpacing',
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
  noiseSeed(seed);
  clear();
  noFill();

  let pageCenter = [width / 2, height / 2];

  let allPoints = [];
  let horiPoints = [];
  for (let i = 0; i < horizontalPoints; i++) {
    horiPoints.push([i * horizontalSpacing, 0]);
  }
  for (let i = 0; i < verticalPoints; i++) {
    let tempVertPoints = [];
    for (const horiPointsKey in horiPoints) {
      tempVertPoints.push([horiPoints[horiPointsKey][0], i * verticalSpacing]);
    }
    allPoints.push(tempVertPoints);
  }
  let firstPoint = allPoints[0][0];
  let lastPoint = allPoints[allPoints.length - 1][allPoints[allPoints.length - 1].length - 1];
  let gridCenter = midpoint(firstPoint, lastPoint);
  let centerDist = [pageCenter[0] - gridCenter[0], pageCenter[1] - gridCenter[1]];

  stroke("blue")
  for (const allPointsKey in allPoints) {
    for (const horiPointsKey in allPoints[allPointsKey]) {
      let curPoint = allPoints[allPointsKey][horiPointsKey];
      curPoint = [curPoint[0] + centerDist[0], curPoint[1] + centerDist[1]];
      noiseDetail(2, 0.2);
      let n = noise(curPoint[0] * noiseFactor, curPoint[1] * noiseFactor) -0.5;
      curPoint = [curPoint[0] , curPoint[1] + (n * noiseStrentgh)];
      allPoints[allPointsKey][horiPointsKey] = curPoint;
      // circle(...curPoint, 2);
    }
    drawLine(allPoints[allPointsKey])
    if ((Number(allPointsKey)+1) % resetSpacing === 0) {
      // console.log("change seed to", (Number(seed)+Number(allPointsKey)));
      noiseSeed(Number(seed)+Number(allPointsKey));
    }
  }

}
