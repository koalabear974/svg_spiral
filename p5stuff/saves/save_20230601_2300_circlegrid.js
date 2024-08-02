var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var verticalPoints = 50;
var verticalPointsMin = 0;
var verticalPointsMax = 20;
var verticalPointsStep = 1;
var verticalSpacing = 13;
var verticalSpacingMin = 0;
var verticalSpacingMax = 20;
var verticalSpacingStep = 1;
var horizontalPoints = 50;
var horizontalPointsMin = 0;
var horizontalPointsMax = 20;
var horizontalPointsStep = 1;
var horizontalSpacing = 13;
var horizontalSpacingMin = 0;
var horizontalSpacingMax = 20;
var horizontalSpacingStep = 1;

var gridOffset = 2;
var gridOffsetMin = 0;
var gridOffsetMax = 10;
var gridOffsetStep = 1;
var noiseFactor = 0.005;
var noiseFactorMin = 0;
var noiseFactorMax = 0.005;
var noiseFactorStep = 0.0001;
var noiseStrentgh = 12.5;
var noiseStrentghMin = 1;
var noiseStrentghMax = 200;
var noiseStrentghStep = 0.1;
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
  background("white");
  strokeWeight(2)

  let pageCenter = [width/2, height/2];
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
  let lastPoint = allPoints[allPoints.length-1][allPoints[allPoints.length-1].length-1];
  let gridCenter = midpoint(firstPoint, lastPoint);
  let centerDist = [pageCenter[0] - gridCenter[0], pageCenter[1] - gridCenter[1]];

  noFill();
  stroke("blue")
  stroke("black")
  let noiseArray =  []
  let noiseMin = 100;
  let noiseMax = 0;
  for (const allPointsKey in allPoints) {
    for (const horiPointsKey in allPoints[allPointsKey]) {
      let curPoint = allPoints[allPointsKey][horiPointsKey];
      curPoint = [curPoint[0] + centerDist[0], curPoint[1] + centerDist[1]];
      // (noise(x*noiseFactor, y*noiseFactor) * noiseStrentgh)
      // noiseDetail(2, 0.2);
      // let n = noise(curPoint[0] * noiseFactor, curPoint[1] * noiseFactor) - 0.5;
      let n = noise(curPoint[0] * noiseFactor, curPoint[1] * noiseFactor);
      // curPoint = [curPoint[0] + (n * noiseStrentgh), curPoint[1] + (n * noiseStrentgh)];
      allPoints[allPointsKey][horiPointsKey] = curPoint;
      // console.log("n:", n);
      if (!noiseArray[allPointsKey]) noiseArray[allPointsKey] = [];
      noiseArray[allPointsKey][horiPointsKey] = n

      if (n > noiseMax) noiseMax = n
      if (n < noiseMin) noiseMin = n
      // circle(...curPoint, n*noiseStrentgh);
    }
  }

  console.log("noiseMin:", noiseMin);
  console.log("noiseMax:", noiseMax);

  for (const allPointsKey in allPoints) {
    for (const horiPointsKey in allPoints[allPointsKey]) {
      let curPoint = allPoints[allPointsKey][horiPointsKey];
      let n2 = map(noiseArray[allPointsKey][horiPointsKey], noiseMin, noiseMax, 0, 1);
      circle(...curPoint, n2*noiseStrentgh);
    }
  }


  // stroke("red")
  // let r = random() * 1000;
  // noiseSeed(r);
  // for (const allPointsKey in allPoints) {
  //   for (const horiPointsKey in allPoints[allPointsKey]) {
  //     let curPoint = allPoints[allPointsKey][horiPointsKey];
  //     curPoint = [curPoint[0] + gridOffset, curPoint[1] + gridOffset];
  //     // (noise(x*noiseFactor, y*noiseFactor) * noiseStrentgh)
  //     // noiseDetail(2, 0.2);
  //     // let n = noise(curPoint[0] * noiseFactor, curPoint[1] * noiseFactor) - 0.5;
  //     let n = noise(curPoint[0] * noiseFactor, curPoint[1] * noiseFactor);
  //     // curPoint = [curPoint[0] + (n * noiseStrentgh), curPoint[1] + (n * noiseStrentgh)];
  //     allPoints[allPointsKey][horiPointsKey] = curPoint;
  //     circle(...curPoint, n*noiseStrentgh);
  //   }
  // }
}
