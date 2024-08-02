var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var angleIncrement = 0.05;
var angleIncrementMin = 0;
var angleIncrementMax = 1;
var angleIncrementStep = 0.0001;
var scaling = 0.65;
var scalingMin = 0;
var scalingMax = 5;
var scalingStep = 0.001;
// var noiseAmplitude = 75;
var noiseAmplitude = 50;
var noiseAmplitudeMin = 0;
var noiseAmplitudeMax = 300;
var noiseAmplitudeStep = 1;
var pointNumber = 10000;
var pointNumberMin = 100;
var pointNumberMax = 15000;
var pointNumberStep = 100;
var showPoints = false;
// var size = 4000;
var size = 1600;
var sizeMin = 0;
var sizeMax = 10000;
var sizeStep = 10;
var perlinSize = 30;
var perlinSizeMin = 1;
var perlinSizeMax = 100;
var perlinSizeStep = 1;

var startPoint = 3000;
var startPointMin = 1;
var startPointMax = 10000;
var startPointStep = 1;

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
    'scaling',
    'angleIncrement',
    'pointNumber',
    'showPoints',
    'size',
    'perlinSize',
    'noiseAmplitude',
    'startPoint',
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
  strokeWeight(1);
  noFill();

  let perlin = new Perlin(size, perlinSize);

  drawDonutSpiral(perlin, noiseAmplitude);
  // drawDonutSpiral(perlin, noiseAmplitude+20);

}

function drawDonutSpiral(perlin, nA) {
  let spiralPoints = [];

  let angle = 0;
  for (let i = 0; i < pointNumber; i++) {
    let r = scaling * angle
    let x1 = r * cos(angle)
    let y1 = r * sin(angle)

    let deviation = perlin.get(x1, y1);

    x1 += cos(deviation * Math.PI) * nA;
    y1 += sin(deviation * Math.PI) * nA;
    spiralPoints.push([x1, y1]);
    angle += angleIncrement;
  }
  let center = spiralPoints[0];
  let widthOffset = width/2 - center[0];
  let heightOffset = height/2 - center[1];
  spiralPoints.forEach((spiralPoint, i) => {
    spiralPoints[i] = [spiralPoint[0] + widthOffset, spiralPoint[1] + heightOffset];
    // stroke("blue");
    showPoints && circle(...spiralPoints[i],1)
  })
  // stroke(randomColorString("0.7"));
  stroke("black")

  !showPoints && drawCurve(spiralPoints.slice(startPoint));
}
