var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var verticalPadding = 140;
var verticalPaddingMin = 0;
var verticalPaddingMax = 1000;
var verticalPaddingStep = 1;
var horizontalPadding = 100;
var horizontalPaddingMin = 0;
var horizontalPaddingMax = 1000;
var horizontalPaddingStep = 1;

var verticalSpacing = 10;
var verticalSpacingMin = 0;
var verticalSpacingMax = 20;
var verticalSpacingStep = 1;
var lineNumber = 80;
var lineNumberMin = 0;
var lineNumberMax = 1000;
var lineNumberStep = 1;

var logScale = 0.3;
var logScaleMin = 0.1;
var logScaleMax = 10;
var logScaleStep = 0.1;

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
    'verticalPadding',
    'horizontalPadding',
    'verticalSpacing',
    'lineNumber',
    'logScale',
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
    save(fileName + ".svg");
  }
}

function draw() {
  randomSeed(seed);
  clear();

  let logMin = 0;
  let logMax = Math.round(verticalSpacing* (logScale * Math.log(lineNumber)))

  for (let i = 0; i < lineNumber; i++) {
    let startPoint = [horizontalPadding, verticalPadding + i * verticalSpacing];
    let numberOfLines = i > 1 ? Math.round(verticalSpacing* (logScale * Math.log(i))) : 0
    console.log("numberOfLines:", numberOfLines);
    text(numberOfLines, ...startPoint);
    let randomPositions = [];
    // while(randomPositions.length < numberOfLines && randomPositions.length < verticalSpacing) {
    //   let randomPos = Math.round(Math.random() * verticalSpacing - 1);
    //   // console.log("randomPos:", randomPos, !!randomPositions[randomPos]);
    //   if (!randomPositions[randomPos]) {
    //     randomPositions[randomPos] = true;
    //     let startPoint = [horizontalPadding, verticalPadding + i * verticalSpacing + randomPos];
    //     let endPoint = [width - horizontalPadding, verticalPadding + i * verticalSpacing + randomPos];
    //
    //     line(...startPoint, ...endPoint);
    //   }
    // }
  }

}
