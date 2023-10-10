var seed = 40;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var verticalPoints = 8;
var verticalPointsMin = 0;
var verticalPointsMax = 20;
var verticalPointsStep = 1;
var verticalSpacing = 80;
var verticalSpacingMin = 0;
var verticalSpacingMax = 500;
var verticalSpacingStep = 1;
var horizontalPoints = 8;
var horizontalPointsMin = 0;
var horizontalPointsMax = 20;
var horizontalPointsStep = 1;
var horizontalSpacing = 80;
var horizontalSpacingMin = 0;
var horizontalSpacingMax = 500;
var horizontalSpacingStep = 1;
var lineCount = 20;
var lineCountMin = 0;
var lineCountMax = 50;
var lineCountStep = 1;
var showVerticalLines = true;
var showHorizontalLines = true;
var offsetX = 0;
var offsetXMin = -10;
var offsetXMax = 10;
var offsetXStep = 0.5;
var offsetY = 0;
var offsetYMin = -10;
var offsetYMax = 10;
var offsetYStep = 0.5;
var addOffset = true;
var noiseFactor = 0.1;
var noiseFactorMin = 0;
var noiseFactorMax = 0.1;
var noiseFactorStep = 0.0001;
var noiseStrentgh = 125;
var noiseStrentghMin = 0;
var noiseStrentghMax = 200;
var noiseStrentghStep = 1;
var gui;

function setup() {
  createCanvas(...a4Format4, SVG);
  pixelDensity(1);
  gui = createGui('My awesome GUI');
  gui.addGlobals(
    'seed',
    'verticalPoints',
    'verticalSpacing',
    'horizontalPoints',
    'horizontalSpacing',
    'lineCount',
    'showVerticalLines',
    'showHorizontalLines',
    'offsetX',
    'offsetY',
    'addOffset',
    'noiseFactor',
    'noiseStrentgh',
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

async function draw() {
  randomSeed(seed);
  noiseSeed(seed);
  background("white");

  let pageCenter = [width / 2, height / 2];
  stroke("red")
  // circle(...pageCenter, 1);

  let allPoints = [];
  let horiPoints = [];
  let vertPoints = [];
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
  let lastPoint = allPoints[allPoints.length - 1][allPoints[allPoints.length - 1].length - 1];
  let gridCenter = midpoint(firstPoint, lastPoint);
  let centerDist = [pageCenter[0] - gridCenter[0], pageCenter[1] - gridCenter[1]];

  stroke("blue")
  for (const allPointsKey in allPoints) {
    for (const horiPointsKey in allPoints[allPointsKey]) {
      let curPoint = allPoints[allPointsKey][horiPointsKey];
      curPoint = [curPoint[0] + centerDist[0], curPoint[1] + centerDist[1]];
      // (noise(x*noiseFactor, y*noiseFactor) * noiseStrentgh)
      noiseDetail(2, 0.2);
      let n = noise(curPoint[0] * noiseFactor, curPoint[1] * noiseFactor) - 0.5;
      curPoint = [curPoint[0] + (n * noiseStrentgh), curPoint[1] + (n * noiseStrentgh)];
      allPoints[allPointsKey][horiPointsKey] = curPoint;
      // circle(...curPoint, 2);
    }
  }

  stroke("red")
  let allPoints2Hori = [];
  for (const allPointsKey in allPoints) {
    let i = 0;
    allPoints2Hori[allPointsKey] = [];
    for (const horiPointsKey in allPoints[allPointsKey]) {
      let curPoint = allPoints[allPointsKey][horiPointsKey];
      let nextPoint = allPoints[allPointsKey][parseInt(horiPointsKey) + 1];
      allPoints2Hori[allPointsKey][i] = curPoint;
      i++;
      if (nextPoint) {
        let offset = distance(curPoint, nextPoint) / lineCount;
        for (let j = 1; j < lineCount; j++) {
          allPoints2Hori[allPointsKey][i] = intersectLineCircle(curPoint, nextPoint, curPoint, offset * j);
          // circle(...allPoints2Hori[allPointsKey][i], 2);
          i++;
        }
      }
    }
  }
  let allPoints2Vert = [];
  for (let x = 0; x < allPoints[0].length; x++) {
    let i = 0;
    allPoints2Vert[x] = [];
    for (let y = 0; y < allPoints.length; y++) {
      let curPoint = allPoints[y][x];
      allPoints2Vert[x][i] = curPoint;
      i++;
      if (allPoints[y + 1]) {
        let nextPoint = allPoints[y + 1][x];
        let offset = distance(curPoint, nextPoint) / lineCount;
        for (let j = 1; j < lineCount; j++) {
          allPoints2Vert[x][i] = intersectLineCircle(curPoint, nextPoint, curPoint, offset * j);
          // circle(...allPoints2Vert[x][i], 2);
          i++;
        }
      }
    }
  }


  noFill();
  if (showHorizontalLines) {
    // createSVGGroup('horizontalLine');
    stroke(randomColor())
    strokeWeight(1);
    for (let x = 0; x < allPoints2Vert[0].length; x++) {
      let curLine = [];
      for (let y = 0; y < allPoints2Vert.length; y++) {
        // let tempPoint = allPoints2Vert[y][x];
        // if (addOffset) {
        //   tempPoint[0] += offsetX;
        //   tempPoint[1] += offsetY;
        // }
        // curLine.push(tempPoint);
        curLine.push(allPoints2Vert[y][x]);
      }
      drawLine(curLine)
    }
    groupSVGNodes('path', 'horizontalLine');
  }

  if (showVerticalLines) {
    // createSVGGroup('verticalLine');
    stroke(randomColor())
    strokeWeight(1);
    for (let x = 0; x < allPoints2Hori[0].length; x++) {
      let curLine = [];
      for (let y = 0; y < allPoints2Hori.length; y++) {
        let tempPoint = allPoints2Hori[y][x];
        if (addOffset) {
          tempPoint[0] += offsetX;
          tempPoint[1] += offsetY;
        }
        curLine.push(tempPoint);
        // curLine.push(allPoints2Hori[y][x]);
      }
      drawLine(curLine)
    }
    groupSVGNodes('path', 'verticalLine');
  }
}
