var seed = 678;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var seed1 = 78;
var seed1Min = 0;
var seed1Max = 1000;
var seed1Step = 1;

var lineDivision = 50;
var lineDivisionMin = 1;
var lineDivisionMax = 200;
var lineDivisionStep = 1;

var xOffset = 0;
var xOffsetMin = 0;
var xOffsetMax = 200;
var xOffsetStep = 1;
var yOffset = 0;
var yOffsetMin = 0;
var yOffsetMax = 200;
var yOffsetStep = 1;
var pagePadding = 100;
var pagePaddingMin = 0;
var pagePaddingMax = 300;
var pagePaddingStep = 1;

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
    'seed1',
    'lineDivision',
    'pagePadding',
    'xOffset',
    'yOffset',
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
    save(fileName + ".svg");
  }
}

function draw() {
  randomSeed(seed);
  noiseSeed(seed);
  clear();
  noFill();

  // let point1 = generateRandomPoint({maxWidth: width / 2, maxHeight: height / 2})
  // let point2 = generateRandomPoint({minWidth: width / 2, maxHeight: height / 2})
  // let point3 = generateRandomPoint({minWidth: width / 2, minHeight: height / 2})
  // let point4 = generateRandomPoint({maxWidth: width / 2, minHeight: height / 2})
  // let point1 = [0, height / 4];
  // let point2 = [width / 4, height / 4 * 3];
  // let point3 = [width / 4 * 3, height / 4]
  // let point4  = [width / 4 * 3, height / 4 * 3];
  let dist = 100;
  let point1 = [width / 2, dist];
  let point2 = [width - dist, height / 2];
  let point3 = [width / 2 , height - dist]
  let point4   = [dist, height / 2];
  let center = getPageCenter()

  console.log(point1, point2, point3)


  // let linePoint = [point1, point2, point3]
  // drawLine(linePoint)
  noFill()

  stroke(randomColor())
  traceBetweenPairs(point1, point2, center)
  traceBetweenPairs(point2, point3, center)
  traceBetweenPairs(point4, point3, center)
  traceBetweenPairs(point4, point1, center)

  // randomSeed(seed1);
  // noiseSeed(seed1);
  // stroke(randomColor())
  //
  // point1 = generateRandomPoint({maxWidth: width / 2, maxHeight: height / 2})
  // point2 = generateRandomPoint({minWidth: width / 2, maxHeight: height / 2})
  // point3 = generateRandomPoint({minWidth: width / 2, minHeight: height / 2})
  // point4 = generateRandomPoint({maxWidth: width / 2, minHeight: height / 2})
  //
  // traceBetweenPairs(point1, point2, center)
  // traceBetweenPairs(point2, point3, center)
  // traceBetweenPairs(point4, point3, center)
  // traceBetweenPairs(point4, point1, center)

}

function generateRandomPoint({minWidth, maxWidth, minHeight, maxHeight}) {
  minWidth = minWidth || pagePadding
  maxWidth = maxWidth || width - pagePadding
  minHeight = minHeight || pagePadding
  maxHeight = maxHeight || height - pagePadding

  return [
    Math.round(random(minWidth, maxWidth)),
    Math.round(random(minHeight, maxHeight))
  ]
}

function traceBetweenPairs(p1, p2, center) {
  let line1 = []
  let line2 = []

  let dist = roundToPrecision(distance(center, p1), 5)
  let itt = roundToPrecision(dist / lineDivision, 5)
  for (let j = 0; roundToPrecision(j, 5) <= (dist); j += itt) {
    line1.push(intersectLineCircle(center, p1, center, j))
  }

  dist = roundToPrecision(distance(center, p2), 5)
  itt = roundToPrecision(dist / lineDivision, 5)
  for (let j = 0; roundToPrecision(j, 5) <= (dist); j += itt) {
    line2.push(intersectLineCircle(center, p2, center, j))
  }

  line1 = line1.filter((p) => !!p)
  line2 = line2.filter((p) => !!p)

  // line1.forEach((p) => circle(...p, 10))
  // line2.forEach((p) => circle(...p, 10))

  if (line1.length < line2.length) {
    line1.push(p1)
  }
  if (line2.length < line1.length) {
    line2.push(p2)
  }

  for (let i = 0; i < line1.length; i++) {
    let curLine = [line1[i], line2[line2.length - 1 - i]]
    drawLine(curLine)
  }
}

function roundToPrecision(number, precision) {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}