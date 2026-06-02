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
var circleWidth = 700;
var circleWidthMin = 1;
var circleWidthMax = 2000;
var circleWidthStep = 1;
var circleWidth2 = 700;
var circleWidth2Min = 1;
var circleWidth2Max = 2000;
var circleWidth2Step = 1;

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
    'circleWidth',
    'circleWidth2',
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

  circle(...pageCenter, circleWidth)
  circle(...[0, height/2], circleWidth2)
}
