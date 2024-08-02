var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;


var padding = 60;
var paddingMin = 0;
var paddingMax = 400;
var paddingStep = 1;
var lineDistance = 8;
var lineDistanceMin = 2;
var lineDistanceMax = 100;
var lineDistanceStep = 1;
var lineAngle = -255;
var lineAngleMin = -500;
var lineAngleMax = 500;
var lineAngleStep = 1;
var lineResolution = 100;
var lineResolutionMin = 0;
var lineResolutionMax = 500;
var lineResolutionStep = 1;

var noiseAmplitude = 30;
var noiseAmplitudeStep = 0.1;
var noiseAmplitudeMin = 1;
var noiseAmplitudeMax = 100;

var noiseXOffset = 10;
var noiseXOffsetStep = 1;
var noiseXOffsetMin = 0;
var noiseXOffsetMax = 100;
var noiseYOffset = 10;
var noiseYOffsetStep = 1;
var noiseYOffsetMin = 0;
var noiseYOffsetMax = 100;


var size = 1000;
var sizeMin = 0;
var sizeMax = 10000;
var sizeStep = 10;
var perlinSize = 10;
var perlinSizeMin = 1;
var perlinSizeMax = 100;
var perlinSizeStep = 1;
var drawBackground = true;
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
    'lineDistance',
    'lineAngle',
    'noiseAmplitude',
    'size',
    'perlinSize',
    'noiseXOffset',
    'noiseYOffset',
    'drawBackground',
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
  noiseSeed(seed);
  const perlin = new Perlin(size, perlinSize);
  clear();

  window.randomC = randomColor();
  window.biggestDistance = 0;
  strokeWeight(1);
  noFill();
  stroke("black");
  let midPoint = height / 2;
  let startLeft = [padding, midPoint + lineAngle];
  let startRight = [width - padding, midPoint - lineAngle];

  let lines = [[startLeft, startRight]];

  let outOfBound = false;
  let i = 1;
  while (!outOfBound) {
    let newLine1Left = [padding, (midPoint + lineAngle) - (i * lineDistance)];
    let newLine1Right = [width - padding, (midPoint - lineAngle) - (i * lineDistance)];
    let newLine2Left = [padding, (midPoint + lineAngle) + (i * lineDistance)];
    let newLine2Right = [width - padding, (midPoint - lineAngle) + (i * lineDistance)];
    if (
      newLine1Left[1] < padding ||
      newLine1Right[1] < padding ||
      newLine2Left[1] > height - padding ||
      newLine2Right[1] > height - padding
    ) {
      if (newLine1Left[1] < padding) {
        newLine1Left = getIntersectPoint(newLine1Left, newLine1Right, [padding, padding], [width - padding, padding]);
      }
      if (newLine1Right[1] < padding) {
        newLine1Right = getIntersectPoint(newLine1Left, newLine1Right, [padding, padding], [width - padding, padding]);
      }
      if (newLine2Left[1] > (height - padding)) {
        newLine2Left = getIntersectPoint(newLine2Left, newLine2Right, [padding, height - padding], [width - padding, height - padding]);
      }
      if (newLine2Right[1] > (height - padding)) {
        newLine2Right = getIntersectPoint(newLine2Left, newLine2Right, [padding, height - padding], [width - padding, height - padding]);
      }

      if (lineAngle < 0 && (newLine1Right[0] > (width - padding) || newLine2Left[0] < padding)) {
        outOfBound = true;
      }
      if (lineAngle > 0 && (newLine1Left[0] < padding || newLine2Right[0] > (width - padding))) {
        outOfBound = true;
      }
      if (!outOfBound) {
        lines.push([newLine1Left, newLine1Right]);
        lines.push([newLine2Left, newLine2Right]);
      }
    } else {
      lines.push([newLine1Left, newLine1Right]);
      lines.push([newLine2Left, newLine2Right]);
    }
    i += 1;
  }

  if(drawBackground) {
    for (let j = 0; j < lines.length; j++) {
      drawLine(lines[j]);
    }
    groupSVGNodes('path', 'g1');
  }



  stroke("grey");
  midPoint = height / 2;
  startLeft = [padding, midPoint + lineAngle];
  startRight = [width - padding, midPoint - lineAngle];

  let curLine = [startLeft];
  let linedistance = distance(startLeft, startRight);
  for (let j = 1; j < lineResolution; j++) {
    let dist = map(j, 0, lineResolution, 0, linedistance);
    curLine.push(intersectLineCircle(startLeft, startRight, startLeft, dist));
  }
  curLine.push(startRight);
  lines = [curLine];

  outOfBound = false;
  i = 1;
  while (!outOfBound) {
    let newLine1Left = [padding, (midPoint + lineAngle) - (i * lineDistance)];
    let newLine1Right = [width - padding, (midPoint - lineAngle) - (i * lineDistance)];
    let newLine2Left = [padding, (midPoint + lineAngle) + (i * lineDistance)];
    let newLine2Right = [width - padding, (midPoint - lineAngle) + (i * lineDistance)];
    if (
      newLine1Left[1] < padding ||
      newLine1Right[1] < padding ||
      newLine2Left[1] > height - padding ||
      newLine2Right[1] > height - padding
    ) {
      if (newLine1Left[1] < padding) {
        newLine1Left = getIntersectPoint(newLine1Left, newLine1Right, [padding, padding], [width - padding, padding]);
      }
      if (newLine1Right[1] < padding) {
        newLine1Right = getIntersectPoint(newLine1Left, newLine1Right, [padding, padding], [width - padding, padding]);
      }
      if (newLine2Left[1] > (height - padding)) {
        newLine2Left = getIntersectPoint(newLine2Left, newLine2Right, [padding, height - padding], [width - padding, height - padding]);
      }
      if (newLine2Right[1] > (height - padding)) {
        newLine2Right = getIntersectPoint(newLine2Left, newLine2Right, [padding, height - padding], [width - padding, height - padding]);
      }

      if (lineAngle < 0 && (newLine1Right[0] > (width - padding) || newLine2Left[0] < padding)) {
        outOfBound = true;
      }
      if (lineAngle > 0 && (newLine1Left[0] < padding || newLine2Right[0] > (width - padding))) {
        outOfBound = true;
      }
      if (!outOfBound) {
        let curLine1 = [newLine1Left];
        let curLine2 = [newLine2Left];
        let linedistance = distance(newLine1Left, newLine1Right);
        for (let j = 1; j < lineResolution; j++) {
          let dist = map(j, 0, lineResolution, 0, linedistance);
          curLine1.push(intersectLineCircle(newLine1Left, newLine1Right, newLine1Left, dist));
          curLine2.push(intersectLineCircle(newLine2Left, newLine2Right, newLine2Left, dist));
        }
        curLine1.push(newLine1Right);
        curLine2.push(newLine2Right);
        lines.push(curLine1);
        lines.push(curLine2);
      }
    } else {
      let curLine1 = [newLine1Left];
      let curLine2 = [newLine2Left];
      let linedistance = distance(newLine1Left, newLine1Right);
      for (let j = 1; j < lineResolution; j++) {
        let dist = map(j, 0, lineResolution, 0, linedistance);
        curLine1.push(intersectLineCircle(newLine1Left, newLine1Right, newLine1Left, dist));
        curLine2.push(intersectLineCircle(newLine2Left, newLine2Right, newLine2Left, dist));
      }
      curLine1.push(newLine1Right);
      curLine2.push(newLine2Right);
      lines.push(curLine1);
      lines.push(curLine2);
    }
    i += 1;
  }

  let max = 0;
  let min = 100;
  for (let j = 0; j < lines.length; j++) {
    lines[j].forEach((point, z) => {
      let deviation = perlin.get(point[0], point[1]);
      if (cos(deviation * Math.PI) * noiseAmplitude > max) {
        max = cos(deviation * Math.PI) * noiseAmplitude;
      }
      if (cos(deviation * Math.PI) * noiseAmplitude < min) {
        min = cos(deviation * Math.PI) * noiseAmplitude;
      }
      let x1 = point[0] + cos(deviation * Math.PI) * noiseAmplitude - noiseXOffset;
      let y1 = point[1] + sin(deviation * Math.PI) * noiseAmplitude - noiseYOffset;
      lines[j][z] = [x1, y1];
    });
    drawLine(lines[j]);
  }
  groupSVGNodes('path', 'g2');
}
