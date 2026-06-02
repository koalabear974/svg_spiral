var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var verticalPoints = 90;
var verticalPointsMin = 0;
var verticalPointsMax = 150;
var verticalPointsStep = 1;
var verticalSpacing = 10;
var verticalSpacingMin = 0;
var verticalSpacingMax = 20;
var verticalSpacingStep = 1;
var horizontalPoints = 62;
var horizontalPointsMin = 0;
var horizontalPointsMax = 100;
var horizontalPointsStep = 1;
var horizontalSpacing = 10;
var horizontalSpacingMin = 0;
var horizontalSpacingMax = 20;
var horizontalSpacingStep = 1;

var gridOffset = 2;
var gridOffsetMin = 0;
var gridOffsetMax = 10;
var gridOffsetStep = 1;
var noiseFactor = 0.005;
var noiseFactorMin = 0;
var noiseFactorMax = 0.01;
var noiseFactorStep = 0.0001;
var breakOff1 = 0.4;
var breakOff1Min = 0.1;
var breakOff1Max = 1;
var breakOff1Step = 0.01;
var circleSize1 = 10;
var circleSize1Min = 1;
var circleSize1Max = 100;
var circleSize1Step = 1;
var breakOff2 = 0.5;
var breakOff2Min = 0.1;
var breakOff2Max = 1;
var breakOff2Step = 0.01;
var circleSize2 = 20;
var circleSize2Min = 1;
var circleSize2Max = 100;
var circleSize2Step = 1;
var breakOff3 = 0.7;
var breakOff3Min = 0.1;
var breakOff3Max = 1;
var breakOff3Step = 0.01;
var circleSize3 = 30;
var circleSize3Min = 1;
var circleSize3Max = 100;
var circleSize3Step = 1;
var gui;

function setup() {
  if (typeof SVG === 'undefined') {
    createCanvas(...a4Format4);
  } else {
    createCanvas(...a4Format4, SVG);
  }
  pixelDensity(1);
  gui = createGui('My awesome GUI');
  gui.addGlobals(
    'seed',
    'verticalPoints',
    'verticalSpacing',
    'horizontalPoints',
    'horizontalSpacing',
    'gridOffset',
    'noiseFactor',
    'noiseStrentgh',
    'breakOff1',
    'circleSize1',
    'breakOff2',
    'circleSize2',
    'breakOff3',
    'circleSize3',
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
  strokeWeight(2);
  noFill();

  stroke("red")
  // circle(...pageCenter, 1);

  let allPoints = generatePoints(horizontalPoints, circleSize3, verticalPoints, circleSize3);

  stroke("rgba(0,200,200, 0.7)")
  generateCircleGrid(allPoints, circleSize3, breakOff1)

  allPoints = generatePoints(horizontalPoints, circleSize2, verticalPoints, circleSize2);

  stroke("rgba(0,150,150, 0.7)")
  generateCircleGrid(allPoints, circleSize2, breakOff2)

  allPoints = generatePoints(horizontalPoints, circleSize1, verticalPoints, circleSize1);

  stroke("rgba(0,50,50, 0.7)")
  generateCircleGrid(allPoints, circleSize1, breakOff3)
}

function generatePoints(horizontalPoints, horizontalSpacing, verticalPoints, verticalSpacing) {
  let allPoints = [];
  let horiPoints = [];
  let vertPoints = [];
  let pageCenter = getPageCenter();
  for (let i = 0; i < horizontalPoints; i++) {
    horiPoints.push([i * horizontalSpacing, 0]);
  }
  for (let i = 0; i < verticalPoints; i++) {
    vertPoints.push([0, i * verticalSpacing]);
  }

  for (let i = 0; i < verticalPoints; i++) {
    let tempVertPoints = [];
    for (const horiPointsKey in horiPoints) {
      tempVertPoints.push([horiPoints[horiPointsKey][0], i * verticalSpacing]);
    }
    allPoints.push(tempVertPoints);
  }

  let firstPoint = allPoints[0][0];
  let lastPoint = allPoints[allPoints.length-1][allPoints[allPoints.length-1].length-1];
  let gridCenter = midpoint(firstPoint, lastPoint);
  let centerDist = [pageCenter[0] - gridCenter[0], pageCenter[1] - gridCenter[1]];
  for (const allPointsKey in allPoints) {
    for (const horiPointsKey in allPoints[allPointsKey]) {
      let curPoint = allPoints[allPointsKey][horiPointsKey];
      curPoint = [curPoint[0] + centerDist[0], curPoint[1] + centerDist[1]];
      allPoints[allPointsKey][horiPointsKey] = curPoint;
    }
  }

  return allPoints;
}

function generateCircleGrid(allPoints, circleSize, breakOff) {
  for (const allPointsKey in allPoints) {
    for (const horiPointsKey in allPoints[allPointsKey]) {
      let curPoint = allPoints[allPointsKey][horiPointsKey];
      let n = noise(curPoint[0] * noiseFactor, curPoint[1] * noiseFactor);

      if (n >= breakOff) {
        circle(...curPoint, circleSize);
      }
    }
  }
}
