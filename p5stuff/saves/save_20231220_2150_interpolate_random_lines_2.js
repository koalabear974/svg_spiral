var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var verticalPadding = 80;
var verticalPaddingMin = 0;
var verticalPaddingMax = 1000;
var verticalPaddingStep = 1;
var horizontalPadding = 400;
var horizontalPaddingMin = 0;
var horizontalPaddingMax = 1000;
var horizontalPaddingStep = 1;
var pointNumber = 3;
var pointNumberMin = 0;
var pointNumberMax = 100;
var pointNumberStep = 1;
var lineDistance = 500;
var lineDistanceMin = 0;
var lineDistanceMax = 1000;
var lineDistanceStep = 1;
var interpolationSteps = 10;
var interpolationStepsMin = 1;
var interpolationStepsMax = 500;
var interpolationStepsStep = 1;
var connectToEdge = true;
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
    'verticalPadding',
    'horizontalPadding',
    'pointNumber',
    'connectToEdge',
    'lineDistance',
    'interpolationSteps',
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

  let randomPoints1 = [];

  for (let i = 0; i < pointNumber; i++) {
    randomPoints1.push([random(verticalPadding, width-verticalPadding), random(horizontalPadding, height-horizontalPadding)]);
  }

  if (connectToEdge) {
    randomPoints1 = [[verticalPadding, height/2], ...randomPoints1];
    randomPoints1 = [[verticalPadding, height/2], ...randomPoints1];
    randomPoints1.push([width-verticalPadding, height/2])
    randomPoints1.push([width-verticalPadding, height/2])
  }

  let randomPoints2 = [];

  for (let i = 0; i < pointNumber; i++) {
    randomPoints2.push([random(verticalPadding, width-verticalPadding), random(horizontalPadding, height-horizontalPadding)]);
  }

  if (connectToEdge) {
    randomPoints2 = [[verticalPadding, height/2], ...randomPoints2];
    randomPoints2 = [[verticalPadding, height/2], ...randomPoints2];
    randomPoints2.push([width-verticalPadding, height/2])
    randomPoints2.push([width-verticalPadding, height/2])
  }

  randomPoints1.forEach((p, i) => {
    randomPoints1[i] = [p[0], p[1] - lineDistance/2];
  })

  randomPoints2.forEach((p, i) => {
    randomPoints2[i] = [p[0], p[1] + lineDistance/2];
  })

  drawCurve(randomPoints1);
  drawCurve(randomPoints2);
  // drawBezierCurve(randomPoints);
  for (let i = 0; i < interpolationSteps; i++) {
    let dist = map(i, 0, interpolationSteps, 0, 1);
    let interpolatedLine = interpolatePath(randomPoints1, randomPoints2, dist);
    drawCurve(interpolatedLine);
  }

}

function interpolatePath(arr1, arr2, dist = 0.5) {
  // Ensure both arrays have the same length
  let length = min(arr1.length, arr2.length);

  let resultArray = [];
  for (let i = 0; i < length; i++) {
    // Interpolate between points and add to the resultArray
    let v0 = createVector(...arr1[i]);
    let v1 = createVector(...arr2[i]);
    let lerpedPoint = p5.Vector.lerp(v0, v1, dist);
    resultArray.push(lerpedPoint);
  }

  resultArray.forEach((p, i) => {
    resultArray[i] = [p.x, p.y]
  })

  return resultArray;
}
