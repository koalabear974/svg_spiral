var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var circleWidth = 200;
var circleWidthMin = 1;
var circleWidthMax = 1000;
var circleWidthStep = 1;
var circleHeight = 200;
var circleHeightMin = 1;
var circleHeightMax = 1000;
var circleHeightStep = 1;
var pointCount = 10;
var pointCountMin = 1;
var pointCountMax = 50;
var pointCountStep = 1;

var lineLength = 250;
var lineLengthMin = 0;
var lineLengthMax = 1000;
var lineLengthStep = 10;

var targetDistanceSample = .5;
var targetDistanceSampleMin = 0.1;
var targetDistanceSampleMax = 5;
var targetDistanceSampleStep = 0.1;


var noiseFactor = 0.001;
var noiseFactorMin = 0;
var noiseFactorMax = 0.01;
var noiseFactorStep = 0.0001;
var noiseStrengh = 200;
var noiseStrenghMin = 0;
var noiseStrenghMax = 2000;
var noiseStrenghStep = 1;


// var size = 600;
// var sizeMin = 0;
// var sizeMax = 1000;
// var sizeStep = 10;
// var perlinSize = 20;
// var perlinSizeMin = 1;
// var perlinSizeMax = 100;
// var perlinSizeStep = 1;
//
//
// var lineNumber = 60;
// var lineNumberMin = 1;
// var lineNumberMax = 500;
// var lineNumberStep = 1;
// var pointNumber = 100;
// var pointNumberMin = 1;
// var pointNumberMax = 1000;
// var pointNumberStep = 1;
// var noiseAmplitude = 12;
// var noiseAmplitudeStep = 0.1;
// var noiseAmplitudeMin = 1;
// var noiseAmplitudeMax = 100;
// var scaleFactor = 1.3;
// var scaleFactorMin = 0.01;
// var scaleFactorMax = 10;
// var scaleFactorStep = 0.01;
var lineNumber = 60;
var lineNumberMin = 1;
var lineNumberMax = 500;
var lineNumberStep = 1;

var wrinkles = 10.3;
var wrinklesMin = 0;
var wrinklesMax = 20;
var wrinklesStep = 0.1;

var noiseScale = 100;
var noiseScaleMin = 1;
var noiseScaleMax = 1000;
var noiseScaleStep = 1;
var scaleFactor = 1.3;
var scaleFactorMin = 0.01;
var scaleFactorMax = 10;
var scaleFactorStep = 0.01;
var frequency = 0.74;
var frequencyMin = 0.1;
var frequencyMax = 10;
var frequencyStep = 0.01;

var waveSize = 25;
var waveSizeMin = 0;
var waveSizeMax = 120;
var waveSizeStep = 5;

var xDisplacement = 0;
var xDisplacementMin = 0;
var xDisplacementMax = 1;
var xDisplacementStep = 0.01;
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
    'circleWidth',
    'circleHeight',
    'pointCount',
    'lineLength',
    'targetDistanceSample',
    'noiseFactor',
    'noiseStrengh',
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

  line(width / 2, 100, width / 2, height -100);
  line(100, height / 2, width - 100, height / 2);


  let randomPointsAnchor = [];
  for (let i = 0; i < pointCount; i++) {
    randomPointsAnchor.push(random());
  }
  randomPointsAnchor = randomPointsAnchor.sort();

  let lineStart = [width / 4, height / 4 - lineLength/2];
  let lineEnd = [width / 4, height / 4 + lineLength/2];
  drawRandomCoil(lineStart, lineEnd, randomPointsAnchor);

  randomPointsAnchor = [];
  for (let i = 0; i < pointCount; i++) {
    randomPointsAnchor.push(random());
  }
  randomPointsAnchor = randomPointsAnchor.sort();

  lineStart = [(width / 4) * 3, height / 4 - lineLength/2];
  lineEnd = [(width / 4) * 3, height / 4 + lineLength/2];
  drawRandomCoil(lineStart, lineEnd, randomPointsAnchor);

  // randomPointsAnchor = [];
  // for (let i = 0; i < pointCount; i++) {
  //   randomPointsAnchor.push(random());
  // }
  // randomPointsAnchor = randomPointsAnchor.sort();
  //
  // lineStart = [(width / 4) * 3, (height / 4) * 3 - lineLength/2];
  // lineEnd = [(width / 4) * 3, (height / 4) * 3 + lineLength/2];
  // drawRandomCoil(lineStart, lineEnd, randomPointsAnchor);
  //
  // randomPointsAnchor = [];
  // for (let i = 0; i < pointCount; i++) {
  //   randomPointsAnchor.push(random());
  // }
  // randomPointsAnchor = randomPointsAnchor.sort();
  //
  // lineStart = [(width / 4) , (height / 4) * 3 - lineLength/2];
  // lineEnd = [(width / 4), (height / 4) * 3 + lineLength/2];
  // drawRandomCoil(lineStart, lineEnd, randomPointsAnchor);


  // randomSeed(seed);
  // let perlin = new Perlin(size, perlinSize);
  // drawPerlinPlane(perlin, [width/4 * 3, height/4 * 3])
  // randomSeed(seed + 1);
  // perlin = new Perlin(size, perlinSize);
  // drawPerlinPlane(perlin, [width/4 * 1, height/4 * 3])

  let noise = new SimplexNoise(seed);
  drawPerlinVor(noise, [width/4 * 3, height/4 * 3])
  noise = new SimplexNoise(seed + 1);
  drawPerlinVor(noise, [width/4 * 1, height/4 * 3])

}

function drawRandomCoil(lineStart, lineEnd, randomPointsAnchor) {
  let pageCenter = [width / 2, height / 2];
  let heightRatio = circleHeight/circleWidth;

  let curvePoints = [];
  let coilPoints = [];
  for (let i = 0; i <= lineLength; i+=targetDistanceSample) {
    curvePoints.push(intersectLineCircle(lineStart, lineEnd, lineStart, i));
  }

  for (let i = 0; i < curvePoints.length; i++) {
    let shapeIndex = i % randomPointsAnchor.length;
    let curPercent = i/curvePoints.length;

    let degree = map(randomPointsAnchor[shapeIndex], 0, 1, 0, 360);
    let n = (noise(i * noiseFactor) - 0.5) * noiseStrengh;
    let intersectedPoint = pointOnCircle(degreesToRadians(degree + n), circleWidth/2, pageCenter);
    let curRanPoint = [intersectedPoint[0], ((intersectedPoint[1] - pageCenter[1])*heightRatio)+pageCenter[1]]

    curRanPoint = [curRanPoint[0]- pageCenter[0], curRanPoint[1] - pageCenter[1]];
    curRanPoint = [curRanPoint[0]+ curvePoints[i][0], curRanPoint[1] + curvePoints[i][1]];

    coilPoints.push(curRanPoint);
  }

  drawLine(coilPoints);
}


function drawPerlinPlane(perlin, center) {

  const gridX = pointNumber;
  const gridY = lineNumber; // min=10, max=400, step=1
  const fieldSize = 200; // min=100, max=200, step=1

  let i = 0;
  let walkContinue = true;
  let lines = [];
  while (walkContinue) {
    const gx = (i % gridX);
    const gy = (i / gridX) | 0;

    const x = gx * fieldSize / (gridX - 1) - fieldSize / 2;
    const y = (gridY - gy) / gridY * fieldSize - fieldSize / 2;

    if (gy != (((i - 1) / gridX) | 0) || i < 2) {
    } else {
      if (typeof lines[gy] === "undefined") lines[gy] = [];
      let deviation = perlin.get(x, y);

      let x1 = x + cos(deviation * Math.PI) * noiseAmplitude;
      let y1 = y + sin(deviation * Math.PI) * noiseAmplitude;
      lines[gy][gx] = [x1* scaleFactor  + (width / 2), y1* scaleFactor + (height / 2)];
    }
    walkContinue = i < gridX * gridY - 1;
    i++;
  }

  let firstPoint = lines[1][1];
  let lastPoint = lines[gridY -1 ][gridX -1 ];
  let shapeCenter = [
    (firstPoint[0] + lastPoint[0]) / 2,
    (firstPoint[1] + lastPoint[1]) / 2,
  ];
  let widthOffset = center[0] - shapeCenter[0];
  let heightOffset = center[1] - shapeCenter[1];
  lines.forEach((line, i1) => {
    line.forEach((point, i2) => {
      lines[i1][i2] = [point[0] + widthOffset, point[1] + heightOffset];
    })
  })

  stroke("black");
  lines.forEach((line, i) => {
    if (i === 0) return;
    drawCurve(line);
  });
}

function drawPerlinVor(noise, center) {
  const gridX = noiseScale;
  const gridY = lineNumber; // min=10, max=400, step=1
  const fieldSize = 200; // min=100, max=200, step=1

  let minHeights = [];
  for (let x = 0; x < gridX; x++) {
    minHeights[x] = 200;
  }

  let i = 0;
  let walkContinue = true;
  let lines = [];
  while (walkContinue) {
    const gx = (i % gridX);
    const gy = (i / gridX) | 0;

    const x = gx * fieldSize / (gridX - 1) - fieldSize / 2;
    const y = (gridY - gy) / gridY * fieldSize - fieldSize / 2;

    let r = waveSize * .2 * wrinkleNoise(noise, wrinkles, x * frequency / fieldSize, y * frequency / fieldSize);
    const h = minHeights[gx] = Math.min(y + r, minHeights[gx]);

    if (gy != (((i - 1) / gridX) | 0) || i < 2) {
    } else {
      if (typeof lines[gy] === "undefined") lines[gy] = [];
      lines[gy][gx] = [((x + (h - y) * xDisplacement) * scaleFactor + (width / 2)), h * scaleFactor + (height / 2)];
    }
    walkContinue = i < gridX * gridY - 1;
    i++;
  }

  let firstPoint = lines[1][1];
  let lastPoint = lines[gridY -1 ][gridX -1 ];
  let shapeCenter = [
    (firstPoint[0] + lastPoint[0]) / 2,
    (firstPoint[1] + lastPoint[1]) / 2,
  ];
  let widthOffset = center[0] - shapeCenter[0];
  let heightOffset = center[1] - shapeCenter[1];
  lines.forEach((line, i1) => {
    line.forEach((point, i2) => {
      lines[i1][i2] = [point[0] + widthOffset, point[1] + heightOffset];
    })
  })

  // stroke(randomColorString(0.7));
  stroke("black");
  lines.forEach((line, i) => {
    if (i === 0) return;
    drawCurve(line);
  });
}
