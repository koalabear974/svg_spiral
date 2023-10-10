var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var circles = 60;
var circlesMin = 1;
var circlesMax = 1000;
var circlesStep = 1;
var circlesSkip = 10;
var circlesSkipMin = 1;
var circlesSkipMax = 100;
var circlesSkipStep = 1;
var circlesSkipEnd = 10;
var circlesSkipEndMin = 1;
var circlesSkipEndMax = 100;
var circlesSkipEndStep = 1;
var distance = 10;
var distanceMin = 1;
var distanceMax = 50;
var distanceStep = 0.1;
var power = 135;
var powerMin = 1;
var powerMax = 1000;
var powerStep = 1;
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
    'circles',
    'circlesSkip',
    'circlesSkipEnd',
    'distance',
    'power',
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

  let center = [width/2, height/2];
  stroke(randomColorString(0.5));
  // stroke("black");
  noFill();
  // const b = Math.pow(50, 1 / circles);
  // let max = Math.pow(circles, 0.8)*distance
  // for (let i = 0; i < circles ; i++) {
  //   if (i < circlesSkip) continue;
  //   // circle(...center, Math.pow(1 / i*20, 0.8) * 100 * distance -distance*20);
  //   circle(...center, Math.pow(b, i)*distance);
  // }
  for (let i = 0; i < circles ; i++) {
    circle(...center, i*(distance));
  }

  const b = Math.pow(power, 1 / circles);
  for (let i = 0; i < circles ; i++) {
      if (i > circles - circlesSkip) continue;
      if (i < circlesSkipEnd) continue;
      circle(...center, Math.pow(b, i)*distance);
      // circle(...center, Math.pow(b, i)*distance);
    }
  // for (let i = 0; i < circles/5*4 ; i++) {
  //   circle(...center, i*(distance)+distance/2);
  // }
  // for (let i = 0; i < circles/3 ; i++) {
  //   circle(...center, i*(distance));
  // }
}
