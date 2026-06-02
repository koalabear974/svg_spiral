var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var seed2 = 11;
var seed2Min = 0;
var seed2Max = 1000;
var seed2Step = 1;
var angleIncrement = 0.1232;
var angleIncrementMin = 0;
var angleIncrementMax = 1;
var angleIncrementStep = 0.0001;
var scaling = 0.8;
var scalingMin = 0;
var scalingMax = 5;
var scalingStep = 0.001;
var noiseAmplitude = 200;
var noiseAmplitudeMin = 0;
var noiseAmplitudeMax = 300;
var noiseAmplitudeStep = 1;
var pointNumber = 40000;
var pointNumberMin = 100;
var pointNumberMax = 50000;
var pointNumberStep = 100;
var showPoints = true;
var noiseSize = 10000;
var noiseSizeMin = 0;
var noiseSizeMax = 20000;
var noiseSizeStep = 1000;
var perlinSize = 30;
var perlinSizeMin = 1;
var perlinSizeMax = 100;
var perlinSizeStep = 1;

var point1x = -1600;
var point1xMin = -2000;
var point1xMax = 2000;
var point1xStep = 10;

var point1y = 2000;
var point1yMin = -2000;
var point1yMax = 2000;
var point1yStep = 10;
var point2x = 1400;
var point2xMin = -2000;
var point2xMax = 2000;
var point2xStep = 10;

var point2y = -1600;
var point2yMin = -2000;
var point2yMax = 2000;
var point2yStep = 10;

var gui;

function setup() {
  if (typeof SVG === 'undefined') {
    createCanvas(...a1Format);
  } else {
    createCanvas(...a1Format, SVG);
  }
  pixelDensity(1);
  gui = createGui('My awesome GUI');
  gui.addGlobals(
    'seed',
    'seed2',
    'scaling',
    'angleIncrement',
    'pointNumber',
    'showPoints',
    'noiseSize',
    'noiseAmplitude',
    'point1x',
    'point1y',
    'point2x',
    'point2y',
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
  strokeWeight(2);

  stroke("red")
  fill("rgba(0,0,0,0)")
  drawSpiral([point1x, point1y])
  if (showPoints) {
    randomSeed(seed2);
    stroke("#8DB600")
    drawSpiral([point2x, point2y])
  }
}

function drawSpiral(startPoint) {
  push()
  translate(startPoint[0],startPoint[1])
  let perlin = new Perlin(noiseSize, perlinSize);
  let spiralPoints = [];

  let angle = 0;
  for (let i = 0; i < pointNumber; i++) {
    let r = scaling * angle
    let x1 = r * cos(angle)
    let y1 = r * sin(angle)

    let deviation = perlin.get(x1, y1);

    x1 += cos(deviation * Math.PI) * noiseAmplitude;
    y1 += sin(deviation * Math.PI) * noiseAmplitude;
    spiralPoints.push([x1, y1]);
    angle += angleIncrement;
  }
  let center = spiralPoints[0];
  let widthOffset = width/2 - center[0];
  let heightOffset = height/2 - center[1];
  spiralPoints.forEach((spiralPoint, i) => {
    spiralPoints[i] = [spiralPoint[0] + widthOffset, spiralPoint[1] + heightOffset];
    // circle(...spiralPoints[i],1)
  })

  drawCurve(spiralPoints);
  pop();
}
