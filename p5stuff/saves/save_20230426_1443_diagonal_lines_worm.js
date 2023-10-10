var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var lineDistance = 80;
var lineDistanceMin = 2;
var lineDistanceMax = 100;
var lineDistanceStep = 1;
var lineAngle = -255;
var lineAngleMin = -500;
var lineAngleMax = 500;
var lineAngleStep = 1;
var lineSteps = 650;
var lineStepsMin = 0;
var lineStepsMax = 1000;
var lineStepsStep = 10;
var angleIncrement = 0.5;
var angleIncrementMin = 0;
var angleIncrementMax = 5;
var angleIncrementStep = 0.05;
var coilXFactor = 40;
var coilXFactorMin = 0;
var coilXFactorMax = 200;
var coilXFactorStep = 1;
var coilYFactor = 20;
var coilYFactorMin = 0;
var coilYFactorMax = 200;
var coilYFactorStep = 1;
var gui;

function setup() {
  createCanvas(...a4Format4, SVG);
  pixelDensity(1);
  gui = createGui('My awesome GUI');
  gui.addGlobals(
    'seed',
    'lineDistance',
    'lineAngle',
    'lineSteps',
    'angleIncrement',
    'coilXFactor',
    'coilYFactor',
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


function generateSpiralFromLine(line) {
  const curvePoints = [];
  const dist = Math.sqrt((line[0][0] - line[1][0]) ** 2 + (line[0][1] - line[1][1]) ** 2);
  if (window.biggestDistance < dist) {
    window.biggestDistance = dist;
    // window.biggestLine = line;
  }
  const curSteps = lineSteps * dist / window.biggestDistance
  for (let i = 0; i <= (curSteps); i++) {
    let t = i / (curSteps);
    // TODO!! INTERSECT changed: debug
    const point = intersectLineCircle(line[0],line[1],line[0], dist * t);
    // stroke("blue");
    // fill("blue");
    // circle(...[point[0].x, point[0].y], 2);
    curvePoints.push([point[0].x, point[0].y]);
  }

  const coilPoints = [];
  let angle = 0;
  for (let i = 0; i < curvePoints.length; i++) {
    let x1 = curvePoints[i][0] + cos(angle) * coilXFactor;
    let y1 = curvePoints[i][1] + sin(angle) * coilYFactor;
    coilPoints.push([x1, y1]);
    // stroke("red");
    // fill("red");
    // circle(...[x1, y1], 1);
    angle += angleIncrement;
  }

  stroke(window.randomC);
  noFill();
  drawCurve(coilPoints);
}

function draw() {
  randomSeed(seed)
  window.randomC = randomColor();
  window.biggestDistance = 0;
  background("white");

  strokeWeight(1);
  stroke("white");

  let midPoint = height/2;
  let startLeft = [0, midPoint + lineAngle];
  let startRight = [width, midPoint - lineAngle];

  let lines = [[startLeft, startRight]];
  // line(...startLeft, ...startRight);

  let outOfBound = false;
  let i = 1;
  while (!outOfBound) {
    let newLine1Left = [0, (midPoint + lineAngle) - (i * lineDistance)];
    let newLine1Right = [width, (midPoint - lineAngle) - (i * lineDistance)];
    let newLine2Left = [0, (midPoint + lineAngle) + (i * lineDistance)];
    let newLine2Right = [width, (midPoint - lineAngle) + (i * lineDistance)];
    if (
      newLine1Left[1] < 0 ||
      newLine1Right[1] < 0 ||
      newLine2Left[1] > height ||
      newLine2Right[1] > height
    ) {
      if (newLine1Left[1] < 0) {
        newLine1Left = getIntersectPoint(newLine1Left, newLine1Right, [0, 0], [width, 0]);
      }
      if (newLine1Right[1] < 0) {
        newLine1Right = getIntersectPoint(newLine1Left, newLine1Right, [0, 0], [width, 0]);
      }
      if (newLine2Left[1] > height) {
        newLine2Left = getIntersectPoint(newLine2Left, newLine2Right, [0, height], [width, height]);
      }
      if (newLine2Right[1] > height) {
        newLine2Right = getIntersectPoint(newLine2Left, newLine2Right, [0, height], [width, height]);
      }

      if (lineAngle < 0 && (newLine1Right[0] > width || newLine2Left[0] < 0)) {
        outOfBound = true
      }
      if (lineAngle > 0 && (newLine1Left[0] < 0 || newLine2Right[0] > width)) {
        outOfBound = true
      }
      if (!outOfBound) {
        // line(...newLine1Left, ...newLine1Right);
        // line(...newLine2Left, ...newLine2Right);
        lines.push([newLine1Left, newLine1Right]);
        lines.push([newLine2Left, newLine2Right]);
      }
    } else {
      // line(...newLine1Left, ...newLine1Right);
      // line(...newLine2Left, ...newLine2Right);
      lines.push([newLine1Left, newLine1Right]);
      lines.push([newLine2Left, newLine2Right]);
    }
    i += 1;
  }

  for (let j = 0; j < lines.length; j++) {
    drawLine(lines[j])
    generateSpiralFromLine(lines[j]);
  }
}

