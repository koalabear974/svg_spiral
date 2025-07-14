var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;

var xOffset = 0;
var xOffsetMin = 0;
var xOffsetMax = 200;
var xOffsetStep = 1;
var yOffset = 0;
var yOffsetMin = 0;
var yOffsetMax = 200;
var yOffsetStep = 1;
var circleStart = 10;
var circleStartMin = 1;
var circleStartMax = 2000;
var circleStartStep = 1;
var circleItteration = 150;
var circleItterationMin = 1;
var circleItterationMax = 2000;
var circleItterationStep = 1;
var circleGrowth = 15;
var circleGrowthMin = 1;
var circleGrowthMax = 100;
var circleGrowthStep = 1;
var xCenter = 200;
var xCenterMin = 1;
var xCenterMax = 2000;
var xCenterStep = 1;
var yCenter = 700;
var yCenterMin = 1;
var yCenterMax = 2000;
var yCenterStep = 1;
var xCenter2 = 200;
var xCenter2Min = 1;
var xCenter2Max = 2000;
var xCenter2Step = 1;
var yCenter2 = 705;
var yCenter2Min = 1;
var yCenter2Max = 2000;
var yCenter2Step = 1;
var xCenter3= 200;
var xCenter3Min = 1;
var xCenter3Max = 2000;
var xCenter3Step = 1;
var yCenter3 = 715;
var yCenter3Min = 1;
var yCenter3Max = 2000;
var yCenter3Step = 1;

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
    'xOffset',
    'yOffset',
    'xCenter',
    'yCenter',
    'xCenter2',
    'yCenter2',
    'xCenter3',
    'yCenter3',
    'circleStart',
    'circleItteration',
    'circleGrowth',
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
    save(fileName+".svg");
  }
}

function draw() {
  randomSeed(seed);
  noiseSeed(seed);
  clear();
  noFill();


  let pageCenter = getPageCenter();

  let circleWidth = circleStart;

  stroke("blue")
  for (let i = 0; i < circleItteration; i++) {
    circle(...[xCenter, yCenter], circleWidth)
    circleWidth += circleGrowth;
  }

  circleWidth = circleStart;
  stroke("red")
  for (let i = 0; i < circleItteration; i++) {
    circle(...[xCenter2, yCenter2], circleWidth)
    circleWidth += circleGrowth;
  }
  circleWidth = circleStart;
  stroke("green")
  for (let i = 0; i < circleItteration; i++) {
    circle(...[xCenter3, yCenter3], circleWidth)
    circleWidth += circleGrowth;
  }
}
