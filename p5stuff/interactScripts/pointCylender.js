var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var circleWidth = 200;
var circleWidthMin = 50;
var circleWidthMax = 300;
var circleWidthStep = 1;
var circleHeight = 200;
var circleHeightMin = 10;
var circleHeightMax = 300;
var circleHeightStep = 1;
var pointCount = 10;
var pointCountMin = 3;
var pointCountMax = 15;
var pointCountStep = 1;

var lineLength = 250;
var lineLengthMin = 50;
var lineLengthMax = 300;
var lineLengthStep = 10;

var targetDistanceSample = .5;
var targetDistanceSampleMin = 0.1;
var targetDistanceSampleMax = 5;
var targetDistanceSampleStep = 0.1;


var noiseFactor = 0.001;
var noiseFactorMin = 0;
var noiseFactorMax = 0.002;
var noiseFactorStep = 0.0001;
var noiseStrengh = 200;
var noiseStrenghMin = 0;
var noiseStrenghMax = 2000;
var noiseStrenghStep = 100;
var gui;

function setup() {
  if (typeof SVG === 'undefined') {
    createCanvas(...a6Format);
  } else {
    createCanvas(...a6Format, SVG);
  }
  pixelDensity(1);
  loadMidiSetting();
  noLoop();
}


function loadMidiSetting() {
  let map = [
    'circleWidth',
    'circleHeight',
    'pointCount',
    'lineLength',
    'noiseFactor',
    'noiseStrengh',
  ];

  loadMIDIMapping(map);
}

function draw() {
  randomSeed(seed);
  clear();
  noFill();


  let randomPointsAnchor = [];
  for (let i = 0; i < pointCount; i++) {
    randomPointsAnchor.push(random());
  }
  randomPointsAnchor = randomPointsAnchor.sort();

  let lineStart = [width / 2, height / 2 - lineLength/2];
  let lineEnd = [width / 2, height / 2 + lineLength/2];
  drawRandomCoil(lineStart, lineEnd, randomPointsAnchor);

}

function drawRandomCoil(lineStart, lineEnd, randomPointsAnchor) {
  let pageCenter = [width / 2, height / 2];
  let heightRatio = circleHeight/circleWidth;

  let curvePoints = [];
  let coilPoints = [];
  let tempTargetDistanceSample = (targetDistanceSample /pointCount) * 10 ;
  for (let i = 0; i <= lineLength; i+=tempTargetDistanceSample) {
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
