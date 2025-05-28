var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var seed2 = 10;
var seed2Min = 0;
var seed2Max = 1000;
var seed2Step = 1;

// var lineNumber = 80;
var lineNumber = 150;
var lineNumberMin = 10;
var lineNumberMax = 200;
var lineNumberStep = 1;
var lineResolution = 80;
var lineResolutionMin = 10;
var lineResolutionMax = 200;
var lineResolutionStep = 1;
var linePadding = 4;
var linePaddingMin = 1;
var linePaddingMax = 200;
var linePaddingStep = 1;
var noiseScale = 0.00069 ;
var noiseScaleMin = 0.00001;
var noiseScaleMax = 0.01;
var noiseScaleStep = 0.00001;

var noiseStrengh = 700 ;
var noiseStrenghMin = 1;
var noiseStrenghMax = 2000;
var noiseStrenghStep = 1;
var pagePadding = 20;
var pagePaddingMin = -5000;
var pagePaddingMax = 5000;
var pagePaddingStep = 1;
var xOffset = 0;
var xOffsetMin = -500;
var xOffsetMax = 500;
var xOffsetStep = 1;
var yOffset = 0;
var yOffsetMin = -500;
var yOffsetMax = 500;
var yOffsetStep = 1;
var xOffset2 = 0;
var xOffset2Min = -500;
var xOffset2Max = 500;
var xOffset2Step = 1;
var yOffset2 = 0;
var yOffset2Min = -500;
var yOffset2Max = 500;
var yOffset2Step = 1;

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
    'noiseScale',
    'noiseStrengh',
    'lineNumber',
    'lineResolution',
    'linePadding',
    'pagePadding',
    'xOffset',
    'yOffset',
    'xOffset2',
    'yOffset2',
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
    save(fileName+".svg");
  }
}

function draw() {
  randomSeed(seed);
  noiseSeed(seed);
  clear();
  noFill();

  stroke(...randomColor());
  generateShape(xOffset, yOffset)

  // randomSeed(seed2);
  // noiseSeed(seed2);
  // stroke(...randomColor());
  // generateShape(xOffset2, yOffset2)
}

function generateShape(xOffset, yOffset) {
  let pageCenter = getPageCenter();

  let lineStarts = []
  let lineEnds = []

  let middleOffset = width/2 - (linePadding * lineNumber)/2 ;

  for (let i = 0; i < lineNumber; i++) {
    lineStarts.push([middleOffset + i * linePadding, pagePadding])
    lineEnds.push([middleOffset + i * linePadding, height- pagePadding])
  }

  let lines = []
  lineStarts.forEach((lineStart, i) => {
    // let line = [lineStarts[i]]
    let line = []
    let distancePerPoint = distance(lineStarts[i], lineEnds[i]) / lineResolution
    for (let j = 0; j < lineResolution; j++) {
      let newP = intersectLineCircle(lineStarts[i], lineEnds[i], lineStarts[i], distancePerPoint*j)
      if (newP && newP.length > 0) {
        let n = noise(newP[0] * noiseScale, newP[1] * noiseScale, i * noiseScale * noiseScale * noiseScale);
        n = map(n, 0, 1, 0.25, 0.75)

        let a = TAU * n;
        newP = [newP[0] - (cos(a)*noiseStrengh), newP[1] + (sin(a)*noiseStrengh)];

        line.push(newP)
      }
    }
    // line.push(lineEnds[i])

    let firstPoint = line[0];
    let lastPoint = line[line.length - 1];
    let shapeCenter = [
      (firstPoint[0] + lastPoint[0]) / 2,
      (firstPoint[1] + lastPoint[1]) / 2,
    ];
    let widthOffset = pageCenter[0] - shapeCenter[0] + ((i * linePadding) - (lineNumber * linePadding /2 ));
    let heightOffset = pageCenter[1] - shapeCenter[1];
    line.forEach((point, i) => {
      line[i] = [point[0] + widthOffset + xOffset, point[1] + heightOffset + yOffset];
    })

    lines.push(line)
  })

  lines.forEach(line => {
    drawCurve(line)
  })
}