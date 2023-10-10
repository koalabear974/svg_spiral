var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var lines = 100;
var linesMin = 10;
var linesMax = 1000;
var linesStep = 10;
var linesAngle = 0;
var linesAngleMin = 0;
var linesAngleMax = 360;
var linesAngleStep = 1;
var gui;

function setup() {
  createCanvas(...a4Format4, SVG);
  pixelDensity(1);
  gui = createGui('My awesome GUI');
  gui.addGlobals(
    'seed',
    'lines',
    'linesAngle'
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
  background("black");

  strokeWeight(2);
  stroke("white");

  let diagonalCount = ceil(sqrt(sq(width) + sq(height)) / lines); // calculate number of diagonals needed to cover the canvas

  let angle = radians(linesAngle); // set the angle of the diagonal lines

  for (let i = -diagonalCount; i < diagonalCount; i++) {
    let x1 = map(i, -diagonalCount, diagonalCount, 0, width);
    let y1 = 0;
    let x2 = map(i + 1, -diagonalCount, diagonalCount, 0, width);
    let y2 = height;

    // rotate the coordinates around the center of the canvas
    x1 -= width / 2;
    y1 -= height / 2;
    x2 -= width / 2;
    y2 -= height / 2;
    let newX1 = x1 * cos(angle) - y1 * sin(angle);
    let newY1 = x1 * sin(angle) + y1 * cos(angle);
    let newX2 = x2 * cos(angle) - y2 * sin(angle);
    let newY2 = x2 * sin(angle) + y2 * cos(angle);
    newX1 += width / 2;
    newY1 += height / 2;
    newX2 += width / 2;
    newY2 += height / 2;

    line(newX1, newY1, newX2, newY2);
  }

}
