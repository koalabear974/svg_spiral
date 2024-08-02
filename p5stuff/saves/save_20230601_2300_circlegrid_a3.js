var seed = 544;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var seed1 = 10;
var seed1Min = 0;
var seed1Max = 1000;
var seed1Step = 1;
var seed2 = 441;
var seed2Min = 0;
var seed2Max = 1000;
var seed2Step = 1;
var verticalPoints = 85;
var verticalPointsMin = 0;
var verticalPointsMax = 100;
var verticalPointsStep = 1;
var verticalSpacing = 13;
var verticalSpacingMin = 0;
var verticalSpacingMax = 100;
var verticalSpacingStep = 1;
var horizontalPoints = 70;
var horizontalPointsMin = 0;
var horizontalPointsMax = 100;
var horizontalPointsStep = 1;
var horizontalSpacing = 13;
var horizontalSpacingMin = 0;
var horizontalSpacingMax = 100;
var horizontalSpacingStep = 1;

var gridOffset = 2;
var gridOffsetMin = 0;
var gridOffsetMax = 10;
var gridOffsetStep = 1;
var noiseFactor = 0.0001;
var noiseFactorMin = 0;
var noiseFactorMax = 0.0005;
var noiseFactorStep = 0.00001;
var noiseStrentgh = 50;
var noiseStrentghMin = 1;
var noiseStrentghMax = 200;
var noiseStrentghStep = 0.1;

var show1 = true;
var show2 = true;
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
    'seed1',
    'seed2',
    'verticalPoints',
    'verticalSpacing',
    'horizontalPoints',
    'horizontalSpacing',
    'gridOffset',
    'noiseFactor',
    'noiseStrentgh',
    'show1',
    'show2',
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

function generateCircleGrid(hP, vP, pageCenter) {
  let allPoints = [];
  let horiPoints = [];
  let vertPoints = [];
  for (let i = 0; i < hP; i++) {
    horiPoints.push([i * horizontalSpacing, 0]);
  }
  for (let i = 0; i < vP; i++) {
    vertPoints.push([0, i * verticalSpacing]);
  }

  for (let i = 0; i < vP; i++) {
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

  for (const allPointsKey in allPoints) {
    for (const horiPointsKey in allPoints[allPointsKey]) {
      let curPoint = allPoints[allPointsKey][horiPointsKey];
      let n2 = map(noiseArray[allPointsKey][horiPointsKey], noiseMin, noiseMax, 0, 1);
      circle(...curPoint, n2*noiseStrentgh);
    }
  }

}

function draw() {
  clear();
  // randomSeed(seed)
  // noiseSeed(seed);
  strokeWeight(2)

  noFill();
  stroke("black")
  //
  // let pageCenter = [width/4, height/2];
  // noiseSeed(seed);
  // generateCircleGrid((horizontalPoints/3)-5, verticalPoints, pageCenter)
  //
  // pageCenter = [width/2, height/2];
  // noiseSeed(seed1);
  // generateCircleGrid((horizontalPoints/3)-5, verticalPoints, pageCenter)
  //
  // pageCenter = [(width/4)*3, height/2];
  // noiseSeed(seed2);
  // generateCircleGrid((horizontalPoints/3)-5, verticalPoints, pageCenter)


  pageCenter = [width/2, height/2];
  noiseSeed(seed);
  stroke("red")
  if (show1) {
    generateCircleGrid((horizontalPoints), verticalPoints, pageCenter)
  }

  noiseSeed(seed1);
  stroke("blue")
  if (show2) {
    generateCircleGrid((horizontalPoints), verticalPoints, pageCenter)
  }

  noiseSeed(seed2);
  stroke("green")
  if (true) {
    generateCircleGrid((horizontalPoints), verticalPoints, pageCenter)
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
