function getMidpoint(x1, y1, x2, y2) {
  return [(x1 + x2) / 2, (y1 + y2) / 2];
}

function getEquidistantPoints(startPoint, endPoint) {
  let [x1, y1] = startPoint;
  let [x2, y2] = endPoint;

  // calculate the midpoint of the line segment joining A and B
  let midpoint = getMidpoint(...startPoint, ...endPoint);

  // calculate the slope of the line segment joining A and B
  let slope = -(x2 - x1) / (y2 - y1);

  // calculate the distance from the midpoint to each of the equidistant points
  let d1 = Math.sqrt((distance ** 2) / (slope ** 2 + 1));
  let d2 = -d1;

  // calculate the x- and y-coordinates of the two equidistant points
  let x3 = midpoint[0] + d1 / Math.sqrt(1 + slope ** 2);
  let y3 = midpoint[1] + slope * d1 / Math.sqrt(1 + slope ** 2);
  let x4 = midpoint[0] + d2 / Math.sqrt(1 + slope ** 2);
  let y4 = midpoint[1] + slope * d2 / Math.sqrt(1 + slope ** 2);

  // point X could be either (x3, y3) or (x4, y4)
  let pointX1 = [x3, y3];
  let pointX2 = [x4, y4];

  return [pointX1, pointX2];
}

function generateRandomPoints(amount, [width, height]) {
  const points = [];
  for (let ii = 0; ii < amount; ii++) {
    points.push([width * random(0, 1), height * random(0, 1)]);
  }
  return points;
}

function randomColor() {
  return [random(0, 255), random(0, 255), random(0, 255)];
}

function getPageCenter() {
  return [width / 2, height / 2];
}

function randomColorString(alpha) {
  return "rgba("+Math.round(random(0, 255))+","+Math.round(random(0, 255))+", "+Math.round(random(0, 255))+","+alpha+")";
}

function drawCurve(points, shape=null, start = null) {
  beginShape(start);
  for (let i in points) {
    if (typeof points[i] === "undefined") continue;
    curveVertex(...points[i]);
  }
  endShape(shape);
}

function drawLine(points , shape=null, start = null) {
  beginShape(start);
  for (let i in points) {
    vertex(...points[i]);
  }
  endShape(shape);
}


function getIntersectPoint(point1, point2, point3, point4) {
  const ua = ((point4[0] - point3[0]) * (point1[1] - point3[1]) -
      (point4[1] - point3[1]) * (point1[0] - point3[0])) /
    ((point4[1] - point3[1]) * (point2[0] - point1[0]) -
      (point4[0] - point3[0]) * (point2[1] - point1[1]));

  const ub = ((point2[0] - point1[0]) * (point1[1] - point3[1]) -
      (point2[1] - point1[1]) * (point1[0] - point3[0])) /
    ((point4[1] - point3[1]) * (point2[0] - point1[0]) -
      (point4[0] - point3[0]) * (point2[1] - point1[1]));

  const x = point1[0] + ua * (point2[0] - point1[0]);
  const y = point1[1] + ua * (point2[1] - point1[1]);

  return [Math.round(x), Math.round(y)];
}

function isOnLine(point, p1, p2) {
  let a = parseFloat(distance(p1, point) + distance(point, p2)).toFixed(4);
  let b = parseFloat(distance(p1, p2)).toFixed(4);
  return a === b;
}

function intersectLineCircle(p1, p2, cpt, r) {
  p1 = createVector(...p1);
  p2 = createVector(...p2);
  cpt = createVector(...cpt);

  let sign = function (x) {
    return x < 0.0 ? -1 : 1;
  };

  let x1 = p1.copy().sub(cpt);
  let x2 = p2.copy().sub(cpt);

  let dv = x2.copy().sub(x1);
  let dr = dv.mag();
  let D = x1.x * x2.y - x2.x * x1.y;

  // evaluate if there is an intersection
  let di = r * r * dr * dr - D * D;
  if (di < 0.0)
    return [];

  let t = sqrt(di);

  const ip = [];
  if (di === 0.0) {
    ip.push(new p5.Vector(D * dv.y + sign(dv.y) * dv.x * t, -D * dv.x + Math.abs(dv.y) * t).div(dr * dr).add(cpt));
    return ip;
  }

  let firstPoint = new p5.Vector(D * dv.y + sign(dv.y) * dv.x * t, -D * dv.x + Math.abs(dv.y) * t).div(dr * dr).add(cpt);
  let secPoint = new p5.Vector(D * dv.y - sign(dv.y) * dv.x * t, -D * dv.x - Math.abs(dv.y) * t).div(dr * dr).add(cpt);
  // console.log("1",[firstPoint.x, firstPoint.y], isOnLine([firstPoint.x, firstPoint.y], [p1.x,p1.y], [p2.x,p2.y]));
  if (isOnLine([firstPoint.x, firstPoint.y], [p1.x, p1.y], [p2.x, p2.y])) {
    return [firstPoint.x, firstPoint.y];
  }

  // console.log("2",[firstPoint.x, firstPoint.y], isOnLine([firstPoint.x, firstPoint.y], [p1.x,p1.y], [p2.x,p2.y]));
  if (isOnLine([secPoint.x, secPoint.y], [p1.x, p1.y], [p2.x, p2.y])) {
    return [secPoint.x, secPoint.y];
  }

  return null;
}

function distance(p1, p2) {
  var a = p1[0] - p2[0];
  var b = p1[1] - p2[1];

  return Math.sqrt(a * a + b * b);
}

const midpoint = ([x1, y1], [x2, y2]) => [(x1 + x2) / 2, (y1 + y2) / 2];

function groupSVGNodes(nodeType, groupName) {
  if (typeof SVG === 'undefined') return;
  let svg = document.getElementsByClassName("p5Canvas")[0].children[0];
  let originalGroup = svg.querySelector('g[name=baseGroup]');
  let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("name", groupName);
  originalGroup.appendChild(g);
  let el = originalGroup.querySelectorAll(":scope > " + nodeType);
  g.append(...el);
}

function addToGroupSVGNodes(nodeType, groupName) {
  if (typeof SVG === 'undefined') return;
  let svg = document.getElementsByClassName("p5Canvas")[0].children[0];
  let originalGroup = svg.querySelector('g[name=baseGroup]');
  let destGroup = svg.querySelector('g[name=' + groupName + ']');
  if (!destGroup) {
    destGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    destGroup.setAttribute("name", groupName);
    originalGroup.appendChild(destGroup);
  }
  let el = originalGroup.querySelectorAll(":scope > " + nodeType);
  destGroup.append(...el);
}

function onScreen(v, pagePadding = 0) {
  return v[0] >= pagePadding && v[0] <= width - pagePadding && v[1] >= pagePadding && v[1] <= height - pagePadding;
}

class Perlin{
  constructor(size, gridSize){
    this.size = size;
    this.gridSize = gridSize;

    this.grid = [];

    // For each grid intersection, compute a random unit vector
    for(let i = 0; i <= gridSize; i++){
      let table = [];
      for(let j = 0; j <= gridSize; j++){

        let angle = random() * 2 * Math.PI;
        let x = cos(angle);
        let y = sin(angle);

        table.push([x, y]);
      }
      this.grid.push(table);
    }
  }

  get(x, y){
    x = x / 2 + this.size / 2;
    y = y / 2 + this.size / 2;
    if(x < 0) x = 0;
    if(x >= this.size) x = this.size - 0.01;
    if(y < 0) y = 0;
    if(y >= this.size) y = this.size - 0.01;

    let posx = x * this.gridSize / this.size;
    let posy = y * this.gridSize / this.size;

    let x1 = Math.floor(posx);
    let x2 = x1 + 1;
    let y1 = Math.floor(posy);
    let y2 = y1 + 1;

    let scal = [];

    scal.push()

    scal.push(this.scalar(posx, posy, x1, y1));
    scal.push(this.scalar(posx, posy, x2, y1));
    scal.push(this.scalar(posx, posy, x1, y2));
    scal.push(this.scalar(posx, posy, x2, y2));
    let int1 = this.interpolate(posx - x1, scal[0], scal[1]);
    let int2 = this.interpolate(posx - x1, scal[2], scal[3]);

    return this.interpolate(posy - y1, int1, int2);
  }

  scalar(x, y, vx, vy){
    x -= vx;
    y -= vy;
    return x * this.grid[vx][vy][0] + y * this.grid[vx][vy][1];
  }

  smooth(v){
    if(v < 0) v = 0;
    if(v > 1) v = 1;
    return v**2 * (3 - 2*v);

  }

  interpolate(x, a, b){
    return a + (b - a) * this.smooth(x)
  }
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Variables
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

const a4Format = [2480, 3508];
const a4Format2 = [1240, 1754];
const a4Format3 = [826, 1169];
// const a4Format4 = [620, 877];
const a4Format4 = [793, 1122];
const a4Format4Vert = [1122, 793];

