var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var padding = 80;
var paddingMin = 0;
var paddingMax = 1000;
var paddingStep = 1;
var lineNumber = 200;
var lineNumberMin = 0;
var lineNumberMax = 1000;
var lineNumberStep = 1;
var lineSpacing = 4;
var lineSpacingMin = 1;
var lineSpacingMax = 1000;
var lineSpacingStep = 1;
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
    'padding',
    'lineNumber',
    'lineSpacing',
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

  for (let i = 0; i < lineNumber; i++) {
    let startPoint = [padding, padding + lineSpacing * i];
    let endPoint = [width - padding, padding + lineSpacing * i];
    if (padding + lineSpacing * i > height - padding ) {
      return;
    }
    line(...startPoint, ...endPoint);
  }
}
