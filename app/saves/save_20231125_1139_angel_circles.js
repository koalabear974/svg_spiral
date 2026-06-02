var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var pointOnLine = 10;
var pointOnLineMin = 10;
var pointOnLineMax = 100;
var pointOnLineStep = 1;
var circleRadius = 1000;
var circleRadiusMin = 10;
var circleRadiusMax = 1000;
var circleRadiusStep = 10;
var circleReduction = 10;
var circleReductionMin = 1;
var circleReductionMax = 20;
var circleReductionStep = 0.1;
var lineLength = 10;
var lineLengthMin = 1;
var lineLengthMax = 30;
var lineLengthStep = 0.1;
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
    'pointOnLine',
    'circleRadius',
    'circleReduction',
    'lineLength',
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

  let pageCenter = getPageCenter();

  translate(width / 2, height / 2);

  let line1Start = [pageCenter[0] + lineLength, pageCenter[1] - lineLength]
  let line1End = [pageCenter[0] - lineLength, pageCenter[1] + lineLength]

  // line(...line1Start, ...line1End);
  generateCircleAlongLine(line1Start, line1End, 1, 0.5);

  let line2Start = [pageCenter[0] + lineLength, pageCenter[1] + lineLength]
  let line2End = [pageCenter[0] - lineLength, pageCenter[1] - lineLength]

  // line(...line2Start, ...line2End);
  generateCircleAlongLine(line2Start, line2End, 0.5, 1);

  line1Start = [pageCenter[0] + lineLength, pageCenter[1] - lineLength]
  line1End = [pageCenter[0] - lineLength, pageCenter[1] + lineLength]

  // line(...line1Start, ...line1End);
  generateCircleAlongLine(line1Start, line1End, 1, 0.5, 225);

  line2Start = [pageCenter[0] + lineLength, pageCenter[1] + lineLength]
  line2End = [pageCenter[0] - lineLength, pageCenter[1] - lineLength]

  // line(...line2Start, ...line2End);
  generateCircleAlongLine(line2Start, line2End, 0.5, 1, 225);
}

function generateCircleAlongLine(lineStart, lineEnd, scaleX, scaleY, rotation = 0 ) {
  let centerPoints = [];
  for (let i = 0; i < pointOnLine; i++) {
    let radius = (distance(lineStart, lineEnd)/pointOnLine)*i
    centerPoints.push(intersectLineCircle(lineStart, lineEnd, lineStart, radius));
  }
  angleMode(DEGREES)
  push();
  // translate(-width/2, -height/2);
  rotate(rotation);
  centerPoints.forEach((p, i) => {
    push();
    scale(scaleX, scaleY);
    let scaleXpix = width - width * scaleX;
    let scaleYpix = height - height * scaleY;
    // translate(scaleXpix, scaleYpix);
    circle(p[0]-width/2, p[1]-height/2, circleRadius - (circleReduction * i));
    pop()
  })
  translate(width/2, height/2);
  pop();
}
