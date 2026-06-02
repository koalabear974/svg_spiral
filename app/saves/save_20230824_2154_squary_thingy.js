var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var itteration = 5;
var itterationMin = 1;
var itterationMax = 10;
var itterationStep = 1;
var distance = 11;
var distanceMin = 10;
var distanceMax = 100;
var distanceStep = 1;
var offsetDistance = 2.5;
var offsetDistanceMin = 1;
var offsetDistanceMax = 20;
var offsetDistanceStep = 0.5;
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
    'itteration',
    'offset',
    'distance',
    'offsetDistance',
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

  stroke(randomColor());
  drawShape([width / 2 - offsetDistance, height / 2 -offsetDistance]);
  groupSVGNodes('path', 'g1');

  // stroke(randomColor());
  // drawShape([width / 2, height / 2]);
  // groupSVGNodes('path', 'g2');

  stroke(randomColor());
  drawShape([width / 2 + offsetDistance, height / 2 +offsetDistance]);
  groupSVGNodes('path', 'g3');
}

function drawShape(center) {
  let points = [[0, height]];
  const inst = createLSystem(itteration, "B"); // number of iterations and axiom

  let i = 0;
  let lastAngle = 'right';
  while (i < inst.length - 1) {
    const cmd = inst[i];
    const lastPoint = points.length -1 ;
    switch (cmd) {
      case "F":
        switch (lastAngle) {
          case "right":
            points.push([points[lastPoint][0], points[lastPoint][1] - distance]);
            break;
          case "left":
            points.push([points[lastPoint][0], points[lastPoint][1] + distance]);
            break;
          case "up":
            points.push([points[lastPoint][0] - distance, points[lastPoint][1]]);
            break;
          case "down":
            points.push([points[lastPoint][0] + distance, points[lastPoint][1]]);
            break;
          default:
        }
        break;
      case "-":
        lastAngle = turnRight(lastAngle);
        break;
      case "+":
        lastAngle = turnLeft(lastAngle);
        break;
      default:
    }
    i++;
  }

  let shapeCenter = points[points.length/2 -1 ];
  shapeCenter = [shapeCenter[0] - distance/2, shapeCenter[1]-distance/2];
  let widthOffset = center[0] - shapeCenter[0];
  let heightOffset = center[1] - shapeCenter[1];
  points.forEach((point, i1) => {
    points[i1] = [point[0] + widthOffset, point[1] + heightOffset];
  })
  noFill()
  strokeWeight(1);
  drawLine(points);
}

function turnRight(curAngle) {
  let r = curAngle;
  switch (r) {
    case "right":
      r = "down";
      break;
    case "down":
      r = "left";
      break;
    case "left":
      r = "up";
      break;
    case "up":
      r = "right";
      break;
    default:
  }
  return r;
}

function turnLeft(curAngle) {
  let r = curAngle;
  switch (r) {
    case "right":
      r = "up";
      break;
    case "down":
      r = "right";
      break;
    case "left":
      r = "down";
      break;
    case "up":
      r = "left";
      break;
    default:
  }
  return r;
}

function createLSystem(numIters, axiom) {
  let s = axiom;
  for (let i = 0; i < numIters; i++) {
    s = processString(s);
  }
  return s;
}

function processString(oldStr) {
  let newstr = "";
  for (let i = 0; i < oldStr.length; i++) {
    newstr += applyRules(oldStr[i]);
  }
  return newstr;
}

function applyRules(ch) {
  switch (ch) {
    case "A":
      return "+BF-AFA-FB+";
    case "B":
      return "-AF+BFB+FA-";
    case "C":
      return "-F-F-F+FF+F+FB+FA-";
    default:
      return ch;
  }
}
