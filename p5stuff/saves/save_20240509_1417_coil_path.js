var seed = 608;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var seed2 = 143;
var seed2Min = 0;
var seed2Max = 1000;
var seed2Step = 1;

var randomizePoint = true;

var point1 = "300,700"
var point2 = "300,800"
var point3 = "800,1200"
var point4 = "300,1350"
var point5 = "800,600"
var point6 = "250,500"
var point7 = "850,400"
var point8 = "250,300"

var lineResolution = 1;
var lineResolutionMin = 0.001;
var lineResolutionMax = 10;
var lineResolutionStep = 0.01;

var pagePadding = 100;
var pagePaddingMin = 0;
var pagePaddingMax = 300;
var pagePaddingStep = 1;
var xOffset = 0;
var xOffsetMin = 0;
var xOffsetMax = 200;
var xOffsetStep = 1;
var yOffset = 0;
var yOffsetMin = 0;
var yOffsetMax = 200;
var yOffsetStep = 1;


var coilXFactor = 120;
var coilXFactorMin = 0;
var coilXFactorMax = 200;
var coilXFactorStep = 1;
var coilYFactor = 120;
var coilYFactorMin = 0;
var coilYFactorMax = 200;
var coilYFactorStep = 1;

var angleIncrement = 1.25;
var angleIncrementMin = 0;
var angleIncrementMax = 5;
var angleIncrementStep = 0.05;

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
    'seed2',
    // 'point1',
    // 'point2',
    // 'point3',
    // 'point4',
    // 'point5',
    // 'point6',
    // 'point7',
    // 'point8',
    'lineResolution',
    'randomizePoint',
    'pagePadding',
    'coilXFactor',
    'coilYFactor',
    'angleIncrement',
    // 'xOffset',
    // 'yOffset',
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
  // noFill();

  let widthRange = [pagePadding, (width - (2 * pagePadding)) / 3, ((width - (2 * pagePadding)) / 3) * 2, width - pagePadding]
  let heightRange = [pagePadding, (height - (2 * pagePadding)) / 3, ((height - (2 * pagePadding)) / 3) * 2, height - pagePadding]

  let points = [
    point1,
    point2,
    point3,
    point4,
    point5,
    point6,
    point7,
    point8
  ]

  points.forEach((pointString, index) => {
    points[index] = pointString.split(',').map(parseFloat);
  })

  if (randomizePoint) {
    points = []
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        points.push([
          Math.round(random(widthRange[j], widthRange[j + 1])),
          Math.round(random(heightRange[i], heightRange[i+1]))
        ])
      }
    }
  }
  shuffleArray(points)

  fill('white')
  let rc1 = randomColor();

  randomSeed(seed2);
  noiseSeed(seed2);
  let rc2 = randomColor();


  let points2 = []
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      points2.push([
        Math.round(random(widthRange[j], widthRange[j + 1])),
        Math.round(random(heightRange[i], heightRange[i+1]))
      ])
    }
  }
  shuffleArray(points2)

  let linePoints = []
  points.forEach((point, i) => {
    if (i < points.length - 1) {
      let dist = distance(points[i], points[i + 1])
      let j = 0;
      while (j < dist) {
        let newPoint = intersectLineCircle(points[i], points[i + 1], points[i], j)
        linePoints.push(newPoint)
        // circle(...newPoint, 10)
        j += lineResolution;
      }
    }
  })
  linePoints.push(points[points.length - 1])

  let linePoints2 = []
  points2.forEach((point, i) => {
    if (i < points2.length - 1) {
      let dist = distance(points2[i], points2[i + 1])
      let j = 0;
      while (j < dist) {
        let newPoint = intersectLineCircle(points2[i], points2[i + 1], points2[i], j)
        linePoints2.push(newPoint)
        // circle(...newPoint, 10)
        j += lineResolution;
      }
    }
  })
  linePoints2.push(points2[points2.length - 1])

  let angle1 = 0
  let angle2 = 0
  let count1 = 0
  let count2 = 0
  for (let i = 1; i < points.length; i++) {
    let index1 = linePoints.findIndex((p) => p[0] === points[i][0] && p[1] === points[i][1])
    let index2 = linePoints2.findIndex((p) => p[0] === points2[i][0] && p[1] === points2[i][1])

    let coilPoints1 = [];
    for (let i = count1; i <= index1; i++) {
      let x1 = linePoints[i][0] + cos(angle1) * coilXFactor;
      let y1 = linePoints[i][1] + sin(angle1) * coilYFactor;
      coilPoints1.push([x1, y1]);
      angle1 += angleIncrement;
      count1 += 1;
    }
    stroke(rc1)
    drawCurve(coilPoints1, null, TRIANGLE_STRIP, null);

    let coilPoints2 = [];
    for (let i = count2; i <= index2; i++) {
        let x1 = linePoints2[i][0] + cos(angle2) * coilXFactor;
        let y1 = linePoints2[i][1] + sin(angle2) * coilYFactor;
        coilPoints2.push([x1, y1]);
        angle2 += angleIncrement;
        count2 += 1;
    }
    stroke(rc2)
    drawCurve(coilPoints2, null, TRIANGLE_STRIP, null);
  }

  // drawLine(linePoints)

  // let coilPoints = [];
  //
  // let angle = 0;
  // for (let i = 0; i < linePoints.length; i++) {
  //     let x1 = linePoints[i][0] + cos(angle) * coilXFactor;
  //     let y1 = linePoints[i][1] + sin(angle) * coilYFactor;
  //     coilPoints.push([x1, y1]);
  //     // stroke("black");
  //     // fill("black");
  //     // circle(...[x1, y1], 1);
  //     angle += angleIncrement;
  // }
  //
  //
  // drawCurve(coilPoints, null, TRIANGLE_STRIP, null);
  //
  // let coilPoints2 = [];
  //
  // let angle2 = 0;
  // for (let i = 0; i < linePoints2.length; i++) {
  //     let x1 = linePoints2[i][0] + cos(angle2) * coilXFactor;
  //     let y1 = linePoints2[i][1] + sin(angle2) * coilYFactor;
  //     coilPoints2.push([x1, y1]);
  //     // stroke("black");
  //     // fill("black");
  //     // circle(...[x1, y1], 1);
  //     angle2 += angleIncrement;
  // }
  //
  // fill('white')
  // stroke(randomColor());
  // drawCurve(coilPoints2, null, TRIANGLE_STRIP, null);
}
