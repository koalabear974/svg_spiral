var seed = 52;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var seed2 = 134;
var seed2Min = 0;
var seed2Max = 1000;
var seed2Step = 1;
var seed3 = 554;
var seed3Min = 0;
var seed3Max = 1000;
var seed3Step = 1;
var seed4 = 627;
var seed4Min = 0;
var seed4Max = 1000;
var seed4Step = 1;
var seed5 = 866;
var seed5Min = 0;
var seed5Max = 1000;
var seed5Step = 1;
// var size = 600;
// var sizeMin = 250;
// var sizeMax = 1500;
// var sizeStep = 10;
// var perlinSize = 20;
// var perlinSizeMin = 1;
// var perlinSizeMax = 100;
// var perlinSizeStep = 1;
var pointNumber = 250;
var pointNumberMin = 1;
var pointNumberMax = 1000;
var pointNumberStep = 1;
// var noiseAmplitude = 12;
// var noiseAmplitudeStep = 1;
// var noiseAmplitudeMin = 1;
// var noiseAmplitudeMax = 50;
// var noiseScale = 0.00142 ;
var noiseScale = 0.07 ;
var noiseScaleMin = 0.00001;
var noiseScaleMax = 0.1;
var noiseScaleStep = 0.00001;
var noiseStrengh = 0.02 ;
var noiseStrenghMin = 0.00001;
var noiseStrenghMax = 0.1;
var noiseStrenghStep = 0.00001;
var noiseSize = 0.03 ;
var noiseSizeMin = 0.00001;
var noiseSizeMax = 0.1;
var noiseSizeStep = 0.00001;
var lineCount = 60;
var lineCountMin = 1;
var lineCountMax = 100;
var lineCountStep = 1;
var lineSpacing = 5;
var lineSpacingMin = 1;
var lineSpacingMax = 10;
var lineSpacingStep = 1;

var point1 = -1500;
var point1Min = -1000;
var point1Max = 1000;
var point1Step = 1;

var point2 = 750;
var point2Min = -1000;
var point2Max = 1000;
var point2Step = 1;

var point3 = 750;
var point3Min = -1000;
var point3Max = 1000;
var point3Step = 1;

var point4 = 750;
var point4Min = -1000;
var point4Max = 1000;
var point4Step = 1;

var point5 = 750;
var point5Min = -1000;
var point5Max = 1000;
var point5Step = 1;
var gui;

function setup() {
    const a1Format1 = [2245, 3178*1.5]
  if (typeof SVG === 'undefined') {
    createCanvas(...a1Format1);
  } else {
    createCanvas(...a1Format1, SVG);
  }
  pixelDensity(1);
  gui = createGui('My awesome GUI');
  gui.addGlobals(
    'seed',
    'seed2',
    'seed3',
    'seed4',
    'seed5',
    // 'size',
    // 'perlinSize',
    // 'noiseAmplitude',
    'pointNumber',
    'noiseScale',
    'noiseStrengh',
    'noiseSize',
    'lineCount',
    'lineSpacing',
    'point1',
    'point2',
    'point3',
    'point4',
    'point5',
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
  noiseSeed(seed);
  noFill();
  clear();
  strokeWeight(2)

  // let line1Point = [[0,0]];
  let line2Point = [[0,0]];
  // let perlin = new Perlin(size, perlinSize);
  let center = getPageCenter()

  translate(center[0], center[1]);
  push(); // Save the current transformation state
  let point1center = [center[0], center[1] + point1]

  translate(0, point1)

  stroke("rgb(0, 128, 128)")
  drawCircle(point1center)
  let point2center = [center[0], center[1] + point2]
  push()
  translate(0, point2)
  randomSeed(seed2);
  noiseSeed(seed2);

  stroke("rgb(204, 0, 204)")
  drawCircle(point2center)
  let point3center = [center[0], center[1] + point3]
  push()
  translate(0, point3)
  randomSeed(seed3);
  noiseSeed(seed3);

  stroke("rgb(255, 204, 0)")
  drawCircle(point3center)
  let point4center = [center[0], center[1] + point4]
  push()
  translate(0, point4)
  randomSeed(seed4);
  noiseSeed(seed4);

  stroke("rgb(174, 234, 234)")
  drawCircle(point4center)
  push()
  translate(0, point5)

  let point5center = [center[0], center[1] + point5]
  randomSeed(seed5);
  noiseSeed(seed5);

  stroke("rgb(179, 0, 0)")
  drawCircle(point5center)

}

function drawCircle(middle) {
  for (let j = 0; j < lineCount; j++) {
    let line1Point = [[0,j*lineSpacing]];

    push()
    scale(1 + j*noiseScale)
    beginShape();
    for (var i = 0; i < 200; i++) {
      var ang = map(i, 0, 200, 0, TWO_PI);
      var rad = 200 * noise(i * noiseSize, j * noiseStrengh, i/100);
      var x = rad * cos(ang);
      var y = rad * sin(ang);
      curveVertex(x, y);
    }
    endShape(CLOSE);
    pop()
  }
}
