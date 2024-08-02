var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var wormCount = 1;
var wormCountMin = 1;
var wormCountMax = 3;
var wormCountStep = 1;
var bezierSteps = 500;
var bezierStepsMin = 100;
var bezierStepsMax = 800;
var bezierStepsStep = 100;
var angleIncrement = 0.5;
var angleIncrementMin = 0;
var angleIncrementMax = 5;
var angleIncrementStep = 0.5;
var coilXFactor = 40;
var coilXFactorMin = 0;
var coilXFactorMax = 100;
var coilXFactorStep = 1;
var coilYFactor = 20;
var coilYFactorMin = 0;
var coilYFactorMax = 100;
var coilYFactorStep = 1;

var gui;

function setup() {
  createCanvas(...a6Format, SVG);
  pixelDensity(1);
  frameRate(1);
  noLoop();
}

function loadMidiSetting() {
  let map = [
    'wormCount',
    'bezierSteps',
    'coilXFactor',
    'coilYFactor',
  ];

  loadMIDIMapping(map);
}

function draw() {
  clear();
  noFill();
  randomSeed(seed)

  for (let w = 0; w < wormCount; w++) {
    const points = generateRandomPoints(4, [width, height]);

    const startPoint = points[0];
    const endPoint = points[3];
    const c1 = points[1];
    const c2 = points[2];

    let curvePoints = [];
    let coilPoints = [];

    let tempBezierSteps = bezierSteps / map(wormCount, 1, 3, 1, 1.5)

    for (let i = 0; i <= tempBezierSteps; i++) {
      let t = i / tempBezierSteps;
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

    drawCurve(coilPoints);
  }
}
