var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var linesNumber = 145;
var linesNumberMin = 1;
var linesNumberMax = 1000;
var linesNumberStep = 1;
var lineSpacing = 7;
var lineSpacingMin = 0;
var lineSpacingMax = 10;
var lineSpacingStep = 1;
var lineResolution = 100;
var lineResolutionMin = 1;
var lineResolutionMax = 1000;
var lineResolutionStep = 1;
var padding = 45;
var paddingMin = 0;
var paddingMax = 1000;
var paddingStep = 1;
var weightFactor = 50;
var weightFactorMin = 1;
var weightFactorMax = 1000;
var weightFactorStep = 1;
var gui;
//
// function getPixel(x, y) {
//   console.log(x,y, width, height);
//   return context.getImageData(x, y, width, height).data;
// }

function preload() {
  img = loadImage('assets/skeleton_3.png');
}

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
    'linesNumber',
    'lineSpacing',
    'lineResolution',
    'padding',
    'weightFactor',
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
  strokeWeight(1);
  noFill();

  let lines = [];

  stroke("black");
  for (let i = 0; i < linesNumber; i++) {
    let startPoint = [padding, padding + i * lineSpacing];
    let endPoint = [width - padding, padding + i * lineSpacing];
    let curLine = [startPoint];
    let linedistance = distance(startPoint, endPoint);
    for (let j = 1; j < lineResolution; j++) {
      let dist = map(j, 0, lineResolution, 0, linedistance);
      curLine.push(intersectLineCircle(startPoint, endPoint, startPoint, dist));
    }
    curLine.push(endPoint);
    lines.push(curLine);
  }

  lines.forEach((line) => {
    drawCurve(line);
  })

  let movedLines = [];
  stroke("black");
  for (let i = 0; i < linesNumber; i++) {
    let startPoint = [padding, padding + i * lineSpacing];
    let endPoint = [width - padding, padding + i * lineSpacing];
    let curLine = [startPoint];
    let linedistance = distance(startPoint, endPoint);
    for (let j = 1; j < lineResolution; j++) {
      let dist = map(j, 0, lineResolution, 0, linedistance);
      curLine.push(intersectLineCircle(startPoint, endPoint, startPoint, dist));
    }
    curLine.push(endPoint);
    movedLines.push(curLine);
  }

  const d = pixelDensity();
  img.resize(width, height);
  img.loadPixels();
  let pixelData = [];
  movedLines.forEach((line, xx) => {
    line.forEach((point, yy) => {
      const [x, y] = point;
      const i = 4 * d * (Math.round(y) * d * width + Math.round(x));
      const [r, g, b, a] = [img.pixels[i], img.pixels[i + 1], img.pixels[i + 2], img.pixels[i + 3]];
      if (pixelData[x] === undefined) pixelData[x] = [];
      if (a) {
        pixelData[x][y] = [r, g, b, a / 255];
      } else {
        pixelData[x][y] = [0, 0, 0, 0];
      }
      // stroke("rgba("+pixelData[x][y].join(',')+")");
      // circle(...point, 2);
      movedLines[xx][yy] = [movedLines[xx][yy][0], movedLines[xx][yy][1] + pixelData[x][y][3] * weightFactor];
    });
  });

  movedLines.forEach((line) => {
    drawCurve(line);
  });
}
