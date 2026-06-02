var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var inicircleRadius = 20;
var inicircleRadiusMin = 1;
var inicircleRadiusMax = 100;
var inicircleRadiusStep = 1;
var iniconcentricDistance = 8;
var iniconcentricDistanceMin = 1;
var iniconcentricDistanceMax = 100;
var iniconcentricDistanceStep = 1;
var sWeight = 8;
var sWeightMin = 1;
var sWeightMax = 10;
var sWeightStep = 1;
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
    'inicircleRadius',
    'iniconcentricDistance',
    'iniconcentricCirclesCount',
    'sWeight',
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

  stroke("black");
  noFill();

  let centerPoint = [width / 2, height / 2];
  strokeWeight(sWeight);

  createInnerCircle(inicircleRadius, iniconcentricDistance, 2, 22, centerPoint);
  let stepRadius1 = (iniconcentricDistance * 2) + inicircleRadius;
  createInnerCircle(stepRadius1, iniconcentricDistance, 2, 35, centerPoint);

  let stepRadius2 = (iniconcentricDistance * 2) + stepRadius1;
  createInnerCircle(stepRadius2, iniconcentricDistance, 4, 52, centerPoint);

  let stepRadius3 = (iniconcentricDistance * 4) + stepRadius2;
  createInnerCircle(stepRadius3, iniconcentricDistance, 4, 80, centerPoint);

  let stepRadius4 = (iniconcentricDistance * 4) + stepRadius3;
  createInnerCircle(stepRadius4, iniconcentricDistance, 8, 120, centerPoint);

  let stepRadius5 = (iniconcentricDistance * 8) + stepRadius4;
  createInnerCircle(stepRadius5, iniconcentricDistance, 8, 160, centerPoint);

  let stepRadius6 = (iniconcentricDistance * 8) + stepRadius5;
  createInnerCircle(stepRadius6, iniconcentricDistance, 8, 210, centerPoint);

  let stepRadius7 = (iniconcentricDistance * 8) + stepRadius6;
  createInnerCircle(stepRadius7, iniconcentricDistance, 8, 250, centerPoint);


}

function createInnerCircle(circleRadius, concentricDistance, concentricCirclesCount, pointCount, centerPoint) {
  // create number Range from circleRadius to circleRadius + concentricCirclesCount at a step of concentricDistance A
  const circleRadiusArray = rangeCount(circleRadius, concentricCirclesCount, concentricDistance);

  // circleRadiusArray.forEach((r) => circle(...centerPoint, r * 2));
  circleRadiusArray.forEach((r, i) => {
    let angle = i % 2 === 0 ? 0 : PI / pointCount ;
    for (let i = angle; i < TWO_PI + angle; i += (TWO_PI / pointCount)) {
      point(...pointOnCircle(i, r, centerPoint));
    }
  })
}
