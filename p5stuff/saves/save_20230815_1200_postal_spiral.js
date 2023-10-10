var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var seed1 = 1;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var seed2 = 2;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var seed3 = 3;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var angleIncrement = 0.13;
var angleIncrementMin = 0;
var angleIncrementMax = 5;
var angleIncrementStep = 0.001;
var scaling = 0.7;
var scalingMin = 0;
var scalingMax = 5;
var scalingStep = 0.001;
var noiseAmplitude = 75;
var noiseAmplitudeMin = 0;
var noiseAmplitudeMax = 100;
var noiseAmplitudeStep = 1;
var pointNumber = 1400;
var pointNumberMin = 100;
var pointNumberMax = 10000;
var pointNumberStep = 100;
var showPoints = false;
var size = 4000;
var sizeMin = 0;
var sizeMax = 10000;
var sizeStep = 10;
var perlinSize = 30;
var perlinSizeMin = 1;
var perlinSizeMax = 100;
var perlinSizeStep = 1;

var gui;
function setup() {
  if (typeof SVG === 'undefined') {
    createCanvas(...a4Format4Vert);
  } else {
    createCanvas(...a4Format4Vert, SVG);
  }
  pixelDensity(1);
  gui = createGui('My awesome GUI');
  gui.addGlobals(
    'seed',
    'seed1',
    'seed2',
    'seed3',
    'scaling',
    'angleIncrement',
    'pointNumber',
    'showPoints',
    'size',
    'perlinSize',
    'noiseAmplitude',
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
  // randomSeed(seed)
  background("white");

  line(width / 2, 100, width / 2, height -100);
  line(100, height / 2, width - 100, height / 2);


  randomSeed(seed);
  let perlin = new Perlin(size, perlinSize);
  drawSpiral(perlin, [width/4 * 1, height/4 * 1])
  randomSeed(seed1);
  perlin = new Perlin(size, perlinSize);
  drawSpiral(perlin, [width/4 * 1, height/4 * 3])
  randomSeed(seed2);
  perlin = new Perlin(size, perlinSize);
  drawSpiral(perlin, [width/4 * 3, height/4 * 3])
  randomSeed(seed3);
  perlin = new Perlin(size, perlinSize);
  drawSpiral(perlin, [width/4 * 3, height/4 * 1])
}

function drawSpiral(perlin, center) {
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
  let curCenter = spiralPoints[0];
  let widthOffset = center[0] - curCenter[0];
  let heightOffset = center[1] - curCenter[1];
  spiralPoints.forEach((spiralPoint, i) => {
    spiralPoints[i] = [spiralPoint[0] + widthOffset, spiralPoint[1] + heightOffset];
    stroke("blue");
    showPoints && circle(...spiralPoints[i],1)
  })
  stroke("black");

  !showPoints && drawCurve(spiralPoints);
}
