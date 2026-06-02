var seed = 131;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;

var circleWidth = 400;
var circleWidthMin = 1;
var circleWidthMax = 1000;
var circleWidthStep = 1;
var circleHeight = 400;
var circleHeightMin = 1;
var circleHeightMax = 1000;
var circleHeightStep = 1;
var pointCount = 10;
var pointCountMin = 1;
var pointCountMax = 50;
var pointCountStep = 1;

var lineLength = 400;
var lineLengthMin = 0;
var lineLengthMax = 1000;
var lineLengthStep = 10;

var targetDistanceSample = .5;
var targetDistanceSampleMin = 0.1;
var targetDistanceSampleMax = 5;
var targetDistanceSampleStep = 0.1;


var noiseFactor = 0.001;
var noiseFactorMin = 0;
var noiseFactorMax = 0.01;
var noiseFactorStep = 0.0001;
var noiseStrengh = 200;
var noiseStrenghMin = 0;
var noiseStrenghMax = 2000;
var noiseStrenghStep = 1;

var decreaseCircle = false;
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
    'circleWidth',
    'circleHeight',
    'pointCount',
    'lineLength',
    'targetDistanceSample',
    'noiseFactor',
    'noiseStrengh',
    'decreaseCircle',
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
  noFill();

  let pageCenter = [width / 2, height / 2];

  stroke("black");
  strokeWeight(1);

  // ellipse(...pageCenter, circleWidth, circleHeight);
  // circle(...pageCenter, circleWidth);

  let randomPointsAnchor = [];
  for (let i = 0; i < pointCount; i++) {
    randomPointsAnchor.push(random());
  }
  randomPointsAnchor = randomPointsAnchor.sort();
  let randomPoints = []
  let heightRatio = circleHeight/circleWidth;
  randomPointsAnchor.forEach((v) => {
    let degree = map(v, 0, 1, 0, 360);
    let intersectedPoint = pointOnCircle(degreesToRadians(degree), circleWidth/2, pageCenter);
    // line(...pageCenter, ...projectedPoint)
    let squishedPoint = [intersectedPoint[0], ((intersectedPoint[1] - pageCenter[1])*heightRatio)+pageCenter[1]]
    // let squishedPoint = intersectedPoint;
    // strokeWeight(3);
    // stroke("red")
    // circle(...squishedPoint,2)
    randomPoints.push(squishedPoint);
  })

  // drawLine([randomPoints[randomPoints.length -1], randomPoints[0], ...randomPoints, randomPoints[randomPoints.length -1]]);
  // drawLine(randomPoints);

  let lineStart = [width / 2, height / 2 - lineLength/2];
  let lineEnd = [width / 2, height / 2 + lineLength/2];

  // stroke(...randomColor());

  let curvePoints = [];
  let coilPoints = [];

  // console.log(lineLength/targetDistanceSample);
  let count = 0
  for (let i = 0; i <= lineLength; i+=targetDistanceSample) {
    curvePoints.push(intersectLineCircle(lineStart, lineEnd, lineStart, i));
    count++;
  }
  // curvePoints.forEach((p) => {
  //   stroke("red")
  //   circle(...p, 2);
  // })
  // bezierPoints.forEach((p) => {
  //   stroke("blue")
  //   circle(...p, 1);
  // })
  for (let i = 0; i < curvePoints.length; i++) {
    let shapeIndex = i % randomPoints.length;
    // console.log(shapeIndex);
    let curPercent = i/curvePoints.length;
    // let curRanPoint = randomPoints[shapeIndex];

    let degree = map(randomPointsAnchor[shapeIndex], 0, 1, 0, 360);
    let n = (noise(i * noiseFactor) - 0.5) * noiseStrengh;
    let intersectedPoint = pointOnCircle(degreesToRadians(degree + n), circleWidth/2, pageCenter);
    let curRanPoint = [intersectedPoint[0], ((intersectedPoint[1] - pageCenter[1])*heightRatio)+pageCenter[1]]

    curRanPoint = [curRanPoint[0]- pageCenter[0], curRanPoint[1] - pageCenter[1]];
    if (decreaseCircle) {
      curRanPoint = [curRanPoint[0] * (0 - curPercent ), curRanPoint[1] * (0 - curPercent )];
    }
    // console.log(i, curvePoints[i]);
    curRanPoint = [curRanPoint[0]+ curvePoints[i][0], curRanPoint[1] + curvePoints[i][1]];

    coilPoints.push(curRanPoint);
    // stroke("black");
    // fill("black");
    // circle(...[x1, y1], 1);
  }

  // bezierPoints.forEach((p, i) => {
  //   let curPercent = i/bezierPoints.length;
  //   randomPoints.forEach((rp, ri) => {
  //     let curRanPoint = rp;
  //     curRanPoint = [curRanPoint[0]- pageCenter[0], curRanPoint[1] - pageCenter[1]];
  //     // curRanPoint = [curRanPoint[0] * (1 - curPercent ), curRanPoint[1] * (1 - curPercent )];
  //     curRanPoint = [curRanPoint[0]+ bezierPoints[i][0], curRanPoint[1] + bezierPoints[i][1]];
  //
  //     coilPoints.push(curRanPoint);
  //   })
  // });

  drawLine(coilPoints);
  // drawCurve(coilPoints)
}

