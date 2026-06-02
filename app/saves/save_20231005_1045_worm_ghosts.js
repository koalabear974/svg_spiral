var seed = 590;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var wormCount = 7;
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
    save(fileName + ".svg");
  }
}

function draw() {
  randomSeed(seed);
  clear();
  frameRate(1);
  stroke(0);
  noFill();
  let worms = [
    [
      [313.63436117907986, 986.516038632486],
      [193.65581303462386, 205.71418617619202],
      [301.23594570253044, 363.2314509465359],
      [157.3371309232898, 499.5262728673406]
    ],
    [
      [368.5260565460194, 790.6305341348052],
      [519.8709546762984, 91.05759547185153],
      [632.3496512600686, 469.4405643651262],
      [475.1413768942002, 765.307794528082]
    ],
    [
      [245.70466580800712, 763.2015189561062],
      [569.66073366673663, 617.26023655058816],
      [650.4103337316774, 1193.1845280439593],
      [886.5377167547122, 897.7949187620543]
    ],
    [
      [646.8922992113512, 657.2778958333656],
      [419.35340459202416, 315.4906120374799],
      [864.9025913218502, 154.25293517298996],
      [293.56405678926967, 656.2625562110916]
    ],
    [
      [218.41471097315662, 754.1092112129554],
      [267.7221200403292, 48.193693835288286],
      [791.6018664708827, 585.7453328501433],
      [168.98918259493075, 410.82564764935523]

    ],
    [
      [186.8475418561138, 1027.4360205088742],
      [178.47863765526563, 444.1305517940782],
      [157.37285081483424, 976.3510833340697],
      [41.06728138541803, 942.4583369330503]
    ],
    [
      [683.6406983712222, 650.3613733062521],
      [323.0413534885738, 414.7261061947793],
      [762.9955002397764, 123.43204962462187],
      [365.2479763745796, 32.650906822644174]
    ],
  ];
  for (let w = 0; w < wormCount; w++) {
    const points = generateRandomPoints(4, [width, height]);

    // let startPoint = points[0];
    // let endPoint = points[3];
    // let c1 = points[1];
    // let c2 = points[2];
    // if (startPoint[1] < endPoint[1]) {
    //   endPoint = points[0];
    //   startPoint = points[3];
    //   c2 = points[1];
    //   c1 = points[2];
    // }

    let [startPoint, endPoint, c1, c2] = worms[w];

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

    angleMode(RADIANS);
    let angle = 0;
    let eyePercentIndex = Math.round((curvePoints.length / 100) * 90);
    let threshholdPercentIndex = Math.round((curvePoints.length / 100) * 90);
    let threshholdPercentRange = (curvePoints.length - threshholdPercentIndex);
    for (let i = 0; i < curvePoints.length; i++) {
      let x1 = curvePoints[i][0] + cos(angle) * coilXFactor;
      let y1 = curvePoints[i][1] + sin(angle) * coilYFactor;

      if (i > threshholdPercentIndex) {
        let curPercent = 1 - (i - threshholdPercentIndex) * 1 / threshholdPercentRange;
        let coef = 1 - Math.exp(-20 * curPercent);
        x1 = curvePoints[i][0] + cos(angle) * (coilXFactor * coef);
        y1 = curvePoints[i][1] + sin(angle) * (coilYFactor * coef);
      }
      coilPoints.push([x1, y1]);
      // stroke("black");
      // fill("black");
      // circle(...[x1, y1], 1);
      angle += angleIncrement;
    }
    let rc = randomColor();
    stroke(rc);
    noFill();
    drawCurve(coilPoints);
    let eyeLvlPoint1 = curvePoints[eyePercentIndex-1];
    let eyeLvlPoint2 = curvePoints[eyePercentIndex+1];
    let centrePointX = ((eyeLvlPoint1[0] + eyeLvlPoint2[0]) / 2);
    let centrePointY = ((eyeLvlPoint1[1] + eyeLvlPoint2[1]) / 2);
    let eyeAngle = Math.atan2(eyeLvlPoint2[1] - eyeLvlPoint1[1], eyeLvlPoint2[0] - eyeLvlPoint1[0]);
    let dist = coilXFactor/2.4;
    push();
    strokeWeight(1);
    fill("black");
    stroke("black");
    translate(centrePointX, centrePointY);
    // let p1 = [(Math.sin(eyeAngle) * dist + centrePointX) - centrePointX, (-Math.cos(eyeAngle) * dist + centrePointY)- centrePointY]
    // let p2 = [(-Math.sin(eyeAngle) * dist + centrePointX) - centrePointX, (Math.cos(eyeAngle) * dist + centrePointY)- centrePointY]
    // // translate(-centrePointX, -centrePointY);
    // ellipse(...p1, 10, 17);
    // ellipse(...p2, 10, 17);
    // rotate(eyeAngle * (180 / Math.PI));
    angleMode(DEGREES);
    rotate(eyeAngle * (180 / Math.PI) + 90);
    ellipse(eyeLvlPoint1[0] - dist -centrePointX, eyeLvlPoint1[1]-centrePointY, 10, 17);
    ellipse(eyeLvlPoint1[0] + dist -centrePointX, eyeLvlPoint1[1]-centrePointY, 10, 17);
    let ghostLength = startPoint[1] - endPoint[1];
    ellipse(0, dist*3, 10, ghostLength/20);
    // console.log(eyeAngle * (180 / Math.PI));
    pop();
  }
}
