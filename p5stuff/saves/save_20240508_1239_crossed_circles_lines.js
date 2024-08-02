var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;

var circleWidth = 200;
var circleWidthMin = 1;
var circleWidthMax = 500;
var circleWidthStep = 1;

var circleResolution = 50;
var circleResolutionMin = 1;
var circleResolutionMax = 200;
var circleResolutionStep = 1;

var xPadding = 150;
var xPaddingMin = 0;
var xPaddingMax = 500;
var xPaddingStep = 1;
var yPadding = 100;
var yPaddingMin = 0;
var yPaddingMax = 500;
var yPaddingStep = 1;

var xOffset = 0;
var xOffsetMin = 0;
var xOffsetMax = 200;
var xOffsetStep = 1;
var yOffset = 100;
var yOffsetMin = 0;
var yOffsetMax = 200;
var yOffsetStep = 1;

var oddOrEven = true

var gui;

function setup() {
  if (typeof SVG === 'undefined') {
    createCanvas(...a3Format);
  } else {
    createCanvas(...a3Format, SVG);
  }
  pixelDensity(1);
  gui = createGui('My awesome GUI');
  let globals = [
    'seed',
    'circleWidth',
    'circleResolution',
    'oddOrEven',
    'xPadding',
    'yPadding',
    'xOffset',
    'yOffset',
  ];
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
  noFill();


  let numberOfCircles = Math.round((height - (2 * yPadding)) / circleWidth);

  let leftCircles = [];
  let rightCircles = [];
  for (let i = 0; i < numberOfCircles; i++) {
    let leftCenter = [
      xPadding,
      (i * circleWidth) + yPadding + yOffset
    ];
    let rightCenter = [
      width - xPadding,
      (i * circleWidth) + yPadding + yOffset
    ];

    leftCircles.push(leftCenter);
    rightCircles.push(rightCenter);

    leftCenter = [
      xPadding,
      (i * circleWidth)+ (circleWidth * 0.5) + yPadding + yOffset
    ];
    rightCenter = [
      width - xPadding,
      (i * circleWidth)+ (circleWidth * 0.5) + yPadding + yOffset
    ];

    leftCircles.push(leftCenter);
    rightCircles.push(rightCenter);
    // circle(...leftCenter, circleWidth)
    // circle(...rightCenter, circleWidth)
  }

  stroke('blue')
  for (let i = 0; i < leftCircles.length - (oddOrEven ? 1 : 0); i++) {
    let circlePoints = i % 2 === 0 ? generatePointsFromCircle(leftCircles[i]) : generatePointsFromCircle(rightCircles[i], true);
    let center = i % 2 === 0 ? rightCircles[i] : leftCircles[i];

    circlePoints.forEach((p) => {
      drawLine([center, p])
    })
  }

  stroke('red')
  for (let i = 0; i < leftCircles.length - (oddOrEven ? 1 : 0); i++) {
    let circlePoints = i % 2 !== 0 ? generatePointsFromCircle(leftCircles[i]) : generatePointsFromCircle(rightCircles[i], true);
    let center = i % 2 !== 0 ? rightCircles[i] : leftCircles[i];

    circlePoints.forEach((p) => {
      drawLine([center, p])
    })
  }
}

function generatePointsFromCircle(circleCenter, leftOrRight = false) {
  let circlePoints = generateCirclePoints({
    point: circleCenter,
    radius: circleWidth
  }, circleResolution);

  if (leftOrRight) {
    circlePoints = circlePoints.filter((p) => p[0] > width - xPadding);
  } else {
    circlePoints = circlePoints.filter((p) => p[0] < xPadding);
  }

  return circlePoints;
  // drawCurve(circlePoints)
}
