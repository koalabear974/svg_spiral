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

var bezierSteps = 10000;
var bezierStepsMin = 0;
var bezierStepsMax = 10000;
var bezierStepsStep = 100;

var targetDistanceSample = 5;
var targetDistanceSampleMin = 0;
var targetDistanceSampleMax = 10;
var targetDistanceSampleStep = 0.1;
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
    'circleWidth',
    'circleHeight',
    'pointCount',
    'bezierSteps',
    'targetDistanceSample',
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
  randomPointsAnchor.forEach((v) => {
    let degree = map(v, 0, 1, 0, 360);
    let intersectedPoint = pointOnCircle(degreesToRadians(degree), circleWidth/2, pageCenter);
    // line(...pageCenter, ...projectedPoint)
    let heightRatio = circleHeight/circleWidth;
    let squishedPoint = [intersectedPoint[0], ((intersectedPoint[1] - pageCenter[1])*heightRatio)+pageCenter[1]]
    // let squishedPoint = intersectedPoint;
    // strokeWeight(3);
    // stroke("red")
    // circle(...squishedPoint,2)
    randomPoints.push(squishedPoint);
  })

  // drawLine([randomPoints[randomPoints.length -1], randomPoints[0], ...randomPoints, randomPoints[randomPoints.length -1]]);
  // drawLine(randomPoints);

  randomSeed(seed);
  const points = generateRandomPoints(4, [width/2, height/2], [width/2, height/2]);

  let startPoint = points[0];
  let endPoint = points[3];
  let c1 = points[1];
  let c2 = points[2];
  if (startPoint[1] < endPoint[1]) {
    endPoint = points[0];
    startPoint = points[3];
    c2 = points[1];
    c1 = points[2];
  }

  // stroke(...randomColor());

  let curvePoints = [];
  let coilPoints = [];

  for (let i = 0; i <= bezierSteps; i++) {
    let t = i / bezierSteps;
    let tx = bezierPoint(startPoint[0], c1[0], c2[0], endPoint[0], t);
    let ty = bezierPoint(startPoint[1], c1[1], c2[1], endPoint[1], t);
    curvePoints.push([tx, ty]);
  }
  let bezierPoints = getBezierPointDistance(curvePoints,targetDistanceSample);

  // curvePoints.forEach((p) => {
  //   stroke("red")
  //   // circle(...p, 2);
  // })
  // bezierPoints.forEach((p) => {
  //   stroke("blue")
  //   circle(...p, 1);
  // })

  // for (let i = 0; i < bezierPoints.length; i++) {
  //   let shapeIndex = i % randomPoints.length;
  //   let curPercent = i/bezierPoints.length;
  //   let curRanPoint = randomPoints[shapeIndex];
  //   curRanPoint = [curRanPoint[0]- pageCenter[0], curRanPoint[1] - pageCenter[1]];
  //   curRanPoint = [curRanPoint[0] * (1 - curPercent ), curRanPoint[1] * (1 - curPercent )];
  //   curRanPoint = [curRanPoint[0]+ bezierPoints[i][0], curRanPoint[1] + bezierPoints[i][1]];
  //
  //   coilPoints.push(curRanPoint);
  //   // stroke("black");
  //   // fill("black");
  //   // circle(...[x1, y1], 1);
  // }
  // let angle = 0;
  // for (let i = 0; i < bezierPoints.length; i++) {
  //   let x1 = bezierPoints[i][0] + cos(angle) * 40;
  //   let y1 = bezierPoints[i][1] + sin(angle) * 40;
  //   coilPoints.push([x1, y1]);
  //   // stroke("black");
  //   // fill("black");
  //   // circle(...[x1, y1], 1);
  //   angle += 0.5;
  // }

  bezierPoints.forEach((p, i) => {
    let curPercent = i/bezierPoints.length;
    randomPoints.forEach((rp, ri) => {
      let curRanPoint = rp;
      curRanPoint = [curRanPoint[0]- pageCenter[0], curRanPoint[1] - pageCenter[1]];
      // curRanPoint = [curRanPoint[0] * (1 - curPercent ), curRanPoint[1] * (1 - curPercent )];
      curRanPoint = [curRanPoint[0]+ bezierPoints[i][0], curRanPoint[1] + bezierPoints[i][1]];

      coilPoints.push(curRanPoint);
    })
  });

  drawLine(coilPoints)
  // drawCurve(coilPoints)
}

