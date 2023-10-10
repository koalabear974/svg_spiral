var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var wormCount = 1;
var wormCountMin = 0;
var wormCountMax = 10;
var wormCountStep = 1;
var bezierSteps = 1500;
var bezierStepsMin = 0;
var bezierStepsMax = 10000;
var bezierStepsStep = 100;
var angleIncrement = 0.5;
var angleIncrementMin = 0;
var angleIncrementMax = 5;
var angleIncrementStep = 0.05;
var coilXFactor = 40;
var coilXFactorMin = 0;
var coilXFactorMax = 200;
var coilXFactorStep = 1;
var coilYFactor = 20;
var coilYFactorMin = 0;
var coilYFactorMax = 200;
var coilYFactorStep = 1;

var gui;

function setup() {
  createCanvas(...a4Format4, SVG);
  pixelDensity(1);
  frameRate(1);
  gui = createGui('My awesome GUI');
  gui.addGlobals(
    'seed',
    'wormCount',
    'bezierSteps',
    'angleIncrement',
    'coilXFactor',
    'coilYFactor',
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
  randomSeed(seed)
  background("white");
  frameRate(1);
  stroke(0);
  noFill();
  for (let w = 0; w < wormCount; w++) {
    const points = generateRandomPoints(4, [width, height]);

    const startPoint = points[0];
    const endPoint = points[3];
    const c1 = points[1];
    const c2 = points[2];
    // stroke(...randomColor());
    // const curve = bezier(...startPoint, ...c1, ...c2, ...endPoint);

    let curvePoints = [];
    let coilPoints = [];


    for (let i = 0; i <= bezierSteps; i++) {
      let t = i / bezierSteps;
      let tx = bezierPoint(startPoint[0], c1[0], c2[0], endPoint[0], t);
      let ty = bezierPoint(startPoint[1], c1[1], c2[1], endPoint[1], t);

      // stroke("blue");
      // fill("blue");
      // circle(tx, ty, 5);
      curvePoints.push([tx, ty]);
    }

    let angle = 0;
    for (let i = 0; i < curvePoints.length; i++) {
      let x1 = curvePoints[i][0] + cos(angle) * coilXFactor;
      let y1 = curvePoints[i][1] + sin(angle) * coilYFactor;
      coilPoints.push([x1, y1]);
      // stroke("black");
      // fill("black");
      // circle(...[x1, y1], 1);
      angle += angleIncrement;
    }

    stroke(randomColor());
    noFill();
    drawCurve(coilPoints);
  }
}
