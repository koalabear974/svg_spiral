var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
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
var noiseScale = 0.06 ;
var noiseScaleMin = 0.00001;
var noiseScaleMax = 0.1;
var noiseScaleStep = 0.00001;
var noiseStrengh = 0.02 ;
var noiseStrenghMin = 0.00001;
var noiseStrenghMax = 0.1;
var noiseStrenghStep = 0.00001;
var noiseSize = 0.02 ;
var noiseSizeMin = 0.00001;
var noiseSizeMax = 0.1;
var noiseSizeStep = 0.00001;
var lineCount = 50;
var lineCountMin = 1;
var lineCountMax = 1000;
var lineCountStep = 1;
var lineSpacing = 5;
var lineSpacingMin = 1;
var lineSpacingMax = 10;
var lineSpacingStep = 1;
var gui;

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
    // 'size',
    // 'perlinSize',
    // 'noiseAmplitude',
    // 'pointNumber',
    'noiseScale',
    'noiseStrengh',
    'noiseSize',
    // 'lineCount',
    // 'lineSpacing',
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

  // let line1Point = [[0,0]];
  let line2Point = [[0,0]];
  // let perlin = new Perlin(size, perlinSize);

  translate(width/2, height/2);
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
