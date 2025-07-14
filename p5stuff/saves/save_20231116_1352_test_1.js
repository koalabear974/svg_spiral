var seed = 131;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;

var circleWidth = 250;
var circleWidthMin = 1;
var circleWidthMax = 1000;
var circleWidthStep = 1;
var circleHeight = 100;
var circleHeightMin = 1;
var circleHeightMax = 1000;
var circleHeightStep = 1;
var pointCount = 10;
var pointCountMin = 1;
var pointCountMax = 50;
var pointCountStep = 1;

var lineLength = 400;
var lineLengthMin = 0;
var lineLengthMax = 1000;
var lineLengthStep = 10;

var targetDistanceSample = .8;
var targetDistanceSampleMin = 0.1;
var targetDistanceSampleMax = 5;
var targetDistanceSampleStep = 0.1;


var noiseFactor = 0.0001;
var noiseFactorMin = 0;
var noiseFactorMax = 0.01;
var noiseFactorStep = 0.0001;
var noiseStrengh = 200;
var noiseStrenghMin = 0;
var noiseStrenghMax = 2000;
var noiseStrenghStep = 1;
var angleIncrement = 0.1;
var angleIncrementMin = 0;
var angleIncrementMax = 1;
var angleIncrementStep = 0.01;

var decreaseCircle = false;
var gui;

let socket;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  pixelDensity(1);
  gui = createGui('My awesome GUI');
  gui.addGlobals(
    'seed',
    'circleWidth',
    'circleHeight',
    'pointCount',
    'lineLength',
    'targetDistanceSample',
    'noiseFactor',
    'noiseStrengh',
    'angleIncrement',
    'decreaseCircle',
  );
  noLoop();

  socket = io();

  console.log(socket)

  socket.on('fromTD', function(data) {
    if (data.address === '/k1' && data.args.length > 0) {
      console.log(data.args[0].value)
      if (data.args[0].value === 1 ) {
        seed+=1;
        redraw();
      }
    }
  });
}

// function keyPressed() {
//   if (keyCode === 32) {
//     redraw();
//   }
//   if (keyCode === 83) {
//     const d = new Date();
//     let fileName = 'art_' + d.toISOString().split('.')[0].replaceAll(':', '-');
//     save(fileName+".svg");
//   }
// }

function draw() {
  randomSeed(seed);
  clear();
  noFill();
  background("black")

  stroke("white");
  strokeWeight(2);


  let randomPointsAnchor = [];
  for (let i = 0; i < pointCount; i++) {
    randomPointsAnchor.push(random());
  }
  randomPointsAnchor = randomPointsAnchor.sort();

  let lineStart = [width / 2, height / 2 - lineLength/2];
  let lineEnd = [width / 2, height / 2 + lineLength/2];

  // stroke("rgba(255,255,0,0.6)");
  randomPointsAnchor.forEach((p, i) => {
    randomPointsAnchor[i] = p + angleIncrement;
    if (p+angleIncrement >= 1) randomPointsAnchor[i] -= 1;
  })
  drawRandomCoil(lineStart, lineEnd, randomPointsAnchor);

  // stroke("rgba(0,255,255,0.6)");
  // randomPointsAnchor.forEach((p, i) => {
  //  randomPointsAnchor[i] = p + angleIncrement;
  //  if (p+angleIncrement >= 1) randomPointsAnchor[i] -= 1;
  // })
  // drawRandomCoil(lineStart, lineEnd, randomPointsAnchor);
  //
  // stroke("rgba(255,0,255,0.6)");
  // randomPointsAnchor.forEach((p, i) => {
  //   randomPointsAnchor[i] = p + angleIncrement;
  //   if (p+angleIncrement >= 1) randomPointsAnchor[i] -= 1;
  // })
  // drawRandomCoil(lineStart, lineEnd, randomPointsAnchor);
}

function drawRandomCoil(lineStart, lineEnd, randomPointsAnchor) {
  let pageCenter = [width / 2, height / 2];
  let heightRatio = circleHeight/circleWidth;

  let curvePoints = [];
  let coilPoints = [];
  for (let i = 0; i <= lineLength; i+=targetDistanceSample) {
    curvePoints.push(intersectLineCircle(lineStart, lineEnd, lineStart, i));
  }

  for (let i = 0; i < curvePoints.length; i++) {
    let shapeIndex = i % randomPointsAnchor.length;
    let curPercent = i/curvePoints.length;

    let degree = map(randomPointsAnchor[shapeIndex], 0, 1, 0, 360);
    let n = (noise(i * noiseFactor) - 0.5) * noiseStrengh;
    let intersectedPoint = pointOnCircle(degreesToRadians(degree + n), circleWidth/2, pageCenter);
    let curRanPoint = [intersectedPoint[0], ((intersectedPoint[1] - pageCenter[1])*heightRatio)+pageCenter[1]]

    curRanPoint = [curRanPoint[0]- pageCenter[0], curRanPoint[1] - pageCenter[1]];
    if (decreaseCircle) {
      curRanPoint = [curRanPoint[0] * (0 - curPercent ), curRanPoint[1] * (0 - curPercent )];
    }
    curRanPoint = [curRanPoint[0]+ curvePoints[i][0], curRanPoint[1] + curvePoints[i][1]];

    coilPoints.push(curRanPoint);
  }

  drawLine(coilPoints);
}

