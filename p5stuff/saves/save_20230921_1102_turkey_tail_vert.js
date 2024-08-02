var seed = 494;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var sourceWidth = 10;
var sourceWidthMin = 10;
var sourceWidthMax = 1000;
var sourceWidthStep = 1;
var border = 50;
var borderMin = 10;
var borderMax = 1000;
var borderStep = 1;
var sourceHeight = 10;
var sourceHeightMin = 10;
var sourceHeightMax = 200;
var sourceHeightStep = 1;
var lineArc = 0;
var lineArcMin = 0;
var lineArcMax = 10;
var lineArcStep = 1;
var bezierSteps = 100;
var bezierStepsMin = 0;
var bezierStepsMax = 1000;
var bezierStepsStep = 100;
var noiseStrentgh = 550;
var noiseStrentghMin = 0;
var noiseStrentghMax = 1000;
var noiseStrentghStep = 1;
var spacingFactor = 2;
var spacingFactorMin = 1;
var spacingFactorMax = 10;
var spacingFactorStep = 0.1;
var itteration = 100;
var itterationMin = 1;
var itterationMax = 300;
var itterationStep = 1;

// var noiseFactor = 0.00142 ;
// var noiseFactorMin = 0.00001;
// var noiseFactorMax = 0.01;
// var noiseFactorStep = 0.00001;

var noiseFactor = 0.175;
var noiseFactorMin = 0.01;
var noiseFactorMax = 0.5;
var noiseFactorStep = 0.0001;
var connectingLines = false;

var rC1 = '#762B18';
var rC2 = '#C9592E';
var rC3 = '#CF933E';
var rC4 = '#FBCD98';
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
    'sourceWidth',
    'sourceHeight',
    'border',
    'lineArc',
    'bezierSteps',
    'noiseStrentgh',
    'noiseFactor',
    'spacingFactor',
    'itteration',
    'connectingLines',
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
  clear();

  // let border = 100
  let bottomPos = height/2;
  let colors = [rC1, rC2, rC3, rC4];

  let p1 = [border, bottomPos];
  let p2 = [border + sourceWidth, bottomPos - lineArc];
  let p3 = [border + sourceWidth, bottomPos + sourceHeight + lineArc];
  let p4 = [border, bottomPos + sourceHeight];
  stroke('black');
  noFill();
  strokeWeight(1);
  // circle(...p1, 2)
  // circle(...p2, 2)
  // circle(...p3, 2)
  // circle(...p4, 2)
  // bezier(...p1, ...p2, ...p3, ...p4);

  stroke(randomColorString("0.7"));
  drawTurkeyTail(p1,p2,p3,p4);

  p1 = [width-border, bottomPos];
  p2 = [width-border - sourceWidth, bottomPos + lineArc];
  p3 = [width-border - sourceWidth, bottomPos + sourceHeight + lineArc];
  p4 = [width-border, bottomPos + sourceHeight];

  // circle(...p1, 2)
  // circle(...p2, 2)
  // circle(...p3, 2)
  // circle(...p4, 2)
  // bezier(...p1, ...p2, ...p3, ...p4);
  stroke(randomColorString("0.7"));
  drawTurkeyTail(p1,p2,p3,p4, -1);

}

function drawTurkeyTail(p1,p2,p3,p4, xFactor = 1) {
  // let initialCurve = [];
  let curves = []
  for (let j = 0; j < itteration; j++) {
    if (curves[j] === undefined) curves[j] = [];
    // let colorPick = Math.floor(random(0, 3));
    // stroke(colors[colorPick])
    // beginShape();
    let lastPoint = null;
    for (let i = 0; i <= bezierSteps; i++) {
      let t = i / bezierSteps;
      // curveVertex(tx + (noise(tx) * noiseStrentgh), ty + (noise(ty) * noiseStrentgh));

      let x = bezierPoint(p1[0], p2[0], p3[0], p4[0], t);
      let y = bezierPoint(p1[1], p2[1], p3[1], p4[1], t);

      let tx = bezierTangent(p1[0], p2[0], p3[0], p4[0], t);
      let ty = bezierTangent(p1[1], p2[1], p3[1], p4[1], t);
      let a = atan2(ty, tx);
      a -= xFactor * HALF_PI;

      let noisePercent = j/itteration;
      // let nx = cos(a) * ((spacingFactor * j) + ((noise(x*noiseFactor, y*noiseFactor) * noiseStrentgh) * noisePercent)) + x;
      // let ny = sin(a) * ((spacingFactor * j) + ((noise(x*noiseFactor, y*noiseFactor) * noiseStrentgh) * noisePercent)) + y;
      let nx = cos(a) * ((spacingFactor * j) + ((noise(x * noiseFactor, y * noiseFactor) * noiseStrentgh) * noisePercent)) + x;
      let ny = sin(a) * ((spacingFactor * j) + ((noise(x * noiseFactor, y * noiseFactor) * noiseStrentgh) * noisePercent)) + y;
      // let nx = cos(a) * ((spacingFactor * j)) + x;
      // let ny = sin(a) * ((spacingFactor * j)) + y;
      //
      // // initialCurve.push([nx, ny]);
      // if (connectingLines) {
      //   line(x, y, nx, ny)
      // }
      lastPoint = [x, y];
      if (i === 0 || i === bezierSteps) {
        curves[j].push([nx, ny]);
        // curveVertex(nx, ny);
      }
      curves[j].push([nx, ny]);
      // curveVertex(nx, ny);
    }
    // endShape();
  }

  // curves.forEach((c, ci) => {
  //   for (let i = 0; i < c.length; i++) {
  //     let lastPoint = c[i];
  //     // let n = noise(lastPoint[0] * noiseFactor, (lastPoint[1]) * noiseFactor, i * noiseFactor * noiseFactor);
  //     let n = noise(lastPoint[0] * noiseFactor, (lastPoint[1]) * noiseFactor);
  //     n = map(n, 0, 1, 0.25, 0.75);
  //     let a = TAU * n;
  //     let newPoint = [lastPoint[0] - (cos(a) * noiseStrentgh), lastPoint[1] + (sin(a) * noiseStrentgh)];
  //     curves[ci][i] = newPoint;
  //   }
  // })

  curves.forEach((c) => {
    drawCurve(c, null, null, false);
  })
}
