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
var interpolationSteps = 80;
var interpolationStepsMin = 1;
var interpolationStepsMax = 500;
var interpolationStepsStep = 1;
var edgeDirection = 1;
var edgeDirectionMin = 0;
var edgeDirectionMax = 2;
var edgeDirectionStep = 1;
var showPoints = false;
var gui;

// Persisted point arrays for drag-and-drop
var storedPoints1 = null;
var storedPoints2 = null;
var prevParams = {};

// Drag state
var dragTarget = null; // {arr: 'storedPoints1'|'storedPoints2', idx: number}

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
    'edgeDirection',
    'showPoints',
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

function generatePoints() {
  randomSeed(seed);

  let randomPoints1 = [];
  for (let i = 0; i < pointNumber; i++) {
    randomPoints1.push([random(verticalPadding, width-verticalPadding), random(horizontalPadding, height-horizontalPadding)]);
  }

  if (edgeDirection === 1) {
    randomPoints1 = [[verticalPadding, height/2], ...randomPoints1];
    randomPoints1 = [[verticalPadding, height/2], ...randomPoints1];
    randomPoints1.push([width-verticalPadding, height/2])
    randomPoints1.push([width-verticalPadding, height/2])
  } else if (edgeDirection === 2) {
    randomPoints1 = [[width/2, horizontalPadding], ...randomPoints1];
    randomPoints1 = [[width/2, horizontalPadding], ...randomPoints1];
    randomPoints1.push([width/2, height-horizontalPadding])
    randomPoints1.push([width/2, height-horizontalPadding])
  } else {
    randomPoints1 = [randomPoints1[0], ...randomPoints1];
    randomPoints1.push(randomPoints1[randomPoints1.length - 1]);
  }

  let randomPoints2 = [];
  for (let i = 0; i < pointNumber; i++) {
    randomPoints2.push([random(verticalPadding, width-verticalPadding), random(horizontalPadding, height-horizontalPadding)]);
  }

  if (edgeDirection === 1) {
    randomPoints2 = [[verticalPadding, height/2], ...randomPoints2];
    randomPoints2 = [[verticalPadding, height/2], ...randomPoints2];
    randomPoints2.push([width-verticalPadding, height/2])
    randomPoints2.push([width-verticalPadding, height/2])
  } else if (edgeDirection === 2) {
    randomPoints2 = [[width/2, horizontalPadding], ...randomPoints2];
    randomPoints2 = [[width/2, horizontalPadding], ...randomPoints2];
    randomPoints2.push([width/2, height-horizontalPadding])
    randomPoints2.push([width/2, height-horizontalPadding])
  } else {
    randomPoints2 = [randomPoints2[0], ...randomPoints2];
    randomPoints2.push(randomPoints2[randomPoints2.length - 1]);
  }

  if (edgeDirection === 2) {
    randomPoints1.forEach((p, i) => {
      randomPoints1[i] = [p[0] - lineDistance/2, p[1]];
    })
    randomPoints2.forEach((p, i) => {
      randomPoints2[i] = [p[0] + lineDistance/2, p[1]];
    })
  } else {
    randomPoints1.forEach((p, i) => {
      randomPoints1[i] = [p[0], p[1] - lineDistance/2];
    })
    randomPoints2.forEach((p, i) => {
      randomPoints2[i] = [p[0], p[1] + lineDistance/2];
    })
  }

  storedPoints1 = randomPoints1;
  storedPoints2 = randomPoints2;
  prevParams = { seed, pointNumber, edgeDirection, lineDistance, verticalPadding, horizontalPadding };
}

function paramsChanged() {
  return storedPoints1 === null ||
    prevParams.seed !== seed ||
    prevParams.pointNumber !== pointNumber ||
    prevParams.edgeDirection !== edgeDirection ||
    prevParams.lineDistance !== lineDistance ||
    prevParams.verticalPadding !== verticalPadding ||
    prevParams.horizontalPadding !== horizontalPadding;
}

function mousePressed() {
  if (storedPoints1 === null) return;
  var hitRadius = 15;
  var bestDist = Infinity;
  var bestTarget = null;

  storedPoints1.forEach(function(p, i) {
    var d = distance(p, [mouseX, mouseY]);
    if (d < hitRadius && d < bestDist) {
      bestDist = d;
      bestTarget = { arr: 'storedPoints1', idx: i };
    }
  });
  storedPoints2.forEach(function(p, i) {
    var d = distance(p, [mouseX, mouseY]);
    if (d < hitRadius && d < bestDist) {
      bestDist = d;
      bestTarget = { arr: 'storedPoints2', idx: i };
    }
  });

  dragTarget = bestTarget;
}

function mouseDragged() {
  if (dragTarget === null) return;
  var arr = dragTarget.arr === 'storedPoints1' ? storedPoints1 : storedPoints2;
  var idx = dragTarget.idx;
  var len = arr.length;

  arr[idx] = [mouseX, mouseY];

  // Sync duplicate edge control points
  if (edgeDirection === 1 || edgeDirection === 2) {
    if (idx === 0) arr[1] = [mouseX, mouseY];
    else if (idx === 1) arr[0] = [mouseX, mouseY];
    else if (idx === len - 1) arr[len - 2] = [mouseX, mouseY];
    else if (idx === len - 2) arr[len - 1] = [mouseX, mouseY];
  } else {
    // edgeDirection === 0: first two and last two are also duplicates
    if (idx === 0) arr[1] = [mouseX, mouseY];
    else if (idx === 1) arr[0] = [mouseX, mouseY];
    else if (idx === len - 1) arr[len - 2] = [mouseX, mouseY];
    else if (idx === len - 2) arr[len - 1] = [mouseX, mouseY];
  }

  redraw();
}

function mouseReleased() {
  dragTarget = null;
}

function draw() {
  if (paramsChanged()) {
    generatePoints();
  }

  clear();
  noFill();

  drawCurve(storedPoints1);
  drawCurve(storedPoints2);
  // drawBezierCurve(randomPoints);
  for (let i = 0; i < interpolationSteps; i++) {
    let dist = map(i, 0, interpolationSteps, 0, 1);
    let interpolatedLine = interpolatePath(storedPoints1, storedPoints2, dist);
    drawCurve(interpolatedLine);
  }

  if (showPoints) {
    push();
    fill(255, 0, 0);
    noStroke();
    storedPoints1.forEach(p => circle(p[0], p[1], 15));
    storedPoints2.forEach(p => circle(p[0], p[1], 15));
    pop();
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
