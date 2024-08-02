var seed = 30;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var xOffset = -500;
var xOffsetMin = -500;
var xOffsetMax = 500;
var xOffsetStep = 1;
var yOffset = 0;
var yOffsetMin = -500;
var yOffsetMax = 500;
var yOffsetStep = 1;
var pagePadding = 40;
var pagePaddingMin = 0;
var pagePaddingMax = 100;
var pagePaddingStep = 1;
var lineNumber = 140;
var lineNumberMin = 1;
var lineNumberMax = 500;
var lineNumberStep = 1;
var linePadding = 6;
var linePaddingMin = 1;
var linePaddingMax = 10;
var linePaddingStep = 0.1;
var noiseScale = 0.00142 ;
var noiseScaleMin = 0.00001;
var noiseScaleMax = 0.01;
var noiseScaleStep = 0.00001;
var noiseStrengh = 4 ;
var noiseStrenghMin = 1;
var noiseStrenghMax = 100;
var noiseStrenghStep = 0.01;
var xFactor = 0.75 ;
var xFactorMin = 0.08;
var xFactorMax = 10;
var xFactorStep = 0.01;
var yFactor = 1.4 ;
var yFactorMin = 0.01;
var yFactorMax = 3;
var yFactorStep = 0.01;
var cutOff1 = 444 ;
var cutOff1Min = 1;
var cutOff1Max = 2000;
var cutOff1Step = 1;
var cutOff2 = 898 ;
var cutOff2Min = 2;
var cutOff2Max = 2000;
var cutOff2Step = 1;
var rC1 = '#007AA2';
var rC2 = '#009DCF';
var rC3 = '#86BEDA';
var rC4 = '#AED3E3';
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
    'pagePadding',
    'xOffset',
    'yOffset',
    'lineNumber',
    'linePadding',
    'noiseScale',
    'noiseStrengh',
    'xFactor',
    'yFactor',
    'cutOff1',
    'cutOff2',
    'rC1',
    'rC2',
    'rC3',
    'rC4',
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
  randomSeed(seed + 1)
  noiseSeed(seed)
  background("white");
  let pageCenter = [width/2, height/2 + xOffset];
  let colors = [rC1, rC2, rC3, rC4];
  stroke("black");
  noFill();
  for (let i = 0; i < lineNumber; i++) {
    let offset = i * linePadding;

    let startPoint = [pagePadding, pageCenter[1] + offset];
    // let endPoint = [width - pagePadding, pageCenter[1] + offset];
    // let startPoint = [width - pagePadding, pageCenter[1] + offset];

    let points = [startPoint, startPoint]
    let isOnScreen = true;
    let lineLength = Math.floor(random(cutOff1, cutOff2));
    while(isOnScreen && points.length <= lineLength) {
      let lastPoint = points[points.length - 1];
      let n = noise(lastPoint[0] * noiseScale, (lastPoint[1] + yOffset) * noiseScale, i * noiseScale * noiseScale);
      n = map(n, 0, 1, 0.25, 0.75)
      let a = TAU * n;
      let newPoint = [lastPoint[0] - (cos(a)*noiseStrengh*xFactor), lastPoint[1] + (sin(a)*noiseStrengh*yFactor)];

      isOnScreen = onScreen(newPoint, pagePadding);
      if (isOnScreen) {
        points.push(newPoint);
      }
    }
    let colorPick = Math.floor(random(0, 3));
    stroke(colors[colorPick])
    drawCurve(points);
    addToGroupSVGNodes('path', 'color_'+colorPick);
  }

}
