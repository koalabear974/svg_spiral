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

function generateRandomPoints(amount, [width, height], [addedWidth, addedHeight] = [0, 0]) {
  const points = [];
  for (let ii = 0; ii < amount; ii++) {
    points.push([width * random(0, 1) + addedWidth, height * random(0, 1) + addedHeight]);
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

function drawCurve(points, shape=null, start = null, debug = false) {
  if (debug) {
    for (let i in points) {
      if (typeof points[i] === "undefined") continue;
      point(...points[i]);
    }
    return;
  }
  beginShape(start);
  for (let i in points) {
    if (typeof points[i] === "undefined") continue;
    curveVertex(...points[i]);
  }
  endShape(shape);
}

function drawBezierCurve(points, shape=null, start = null, debug = false) {
  if (debug) {
    for (let i in points) {
      if (typeof points[i] === "undefined") continue;
      point(...points[i]);
    }
    return;
  }
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

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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
    return [p1.x, p1.y];
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

function doCirclesIntersect(circleA, circleB) {
  // Calculate distance between centers of two circles
  let distanceBetweenCenters = distance(circleA.point, circleB.point);

  // Check if distance is less than the sum of radii
  return distanceBetweenCenters < (circleA.radius/2) + (circleB.radius/2);
}

function distance(p1, p2) {
  var a = p1[0] - p2[0];
  var b = p1[1] - p2[1];

  return Math.sqrt(a * a + b * b);
}

function isCircleContained(circleA, circleB) {
  // Calculate distance between centers of two circles
  let distanceBetweenCenters = distance(circleA.point, circleB.point);

  // Check if distance is less than the difference of radii
  return distanceBetweenCenters + (circleA.radius/2) <= (circleB.radius/2);
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

const range = (start, stop, step = 1) =>
  Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)

const rangeCount = (start, count, step = 1) => {
  let r = [];
  for (let i = 0; i < count; i++) {
    r.push(start + (step * i));
  }
  return r;
}

const pointOnCircle = (angle = 0, circleRadius, centerPoint) => {
  let x = circleRadius * Math.cos(angle) + centerPoint[0];
  let y = circleRadius * Math.sin(angle) + centerPoint[1];
  return [x,y]
}

function degreesToRadians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

function getBezierPointDistance (bezierPoints, targetDist) {
  let returnArray = [bezierPoints[0]];
  let curDist = 0;
  bezierPoints.forEach((p, i) => {
    if (bezierPoints[i + 1] === undefined) return;
    curDist += distance(p, bezierPoints[i + 1]);
    // console.log("curDist", curDist);
    if(curDist < targetDist) {2
      return;
    }
    console.log("found point at:", curDist);
    returnArray.push(p);
    curDist = 0;
  })
  return returnArray;
}

function SimplexNoise(seed = 1) {
  const grad = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
  const const1 = 255;
  const const2 = 512;
  const const3 = 256;
  const perm = new Uint8Array(const2);

  const F2 = (Math.sqrt(3) - 1) / 2, F3 = 1 / 3;
  const G2 = (3 - Math.sqrt(3)) / 6, G3 = 1 / 6;

  const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];
  const sub2 = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

  class SimplexNoise {
    constructor(seed = 1) {
      for (let i = 0; i < const2; i++) {
        perm[i] = i & const1;
      }
      for (let i = 0; i < const1; i++) {
        const r = (seed = this.hash(i + seed)) % (const3 - i) + i;
        const swp = perm[i];
        perm[i + const3] = perm[i] = perm[r];
        perm[r + const3] = perm[r] = swp;
      }
    }

    noise2D(p) {
      const s = dot2(p, [F2, F2]);
      const c = [Math.floor(p[0] + s), Math.floor(p[1] + s)];
      const i = c[0] & const1, j = c[1] & const1;
      const t = dot2(c, [G2, G2]);

      const p0 = sub2(p, sub2(c, [t, t]));
      const o = p0[0] > p0[1] ? [1, 0] : [0, 1];
      const p1 = sub2(sub2(p0, o), [-G2, -G2]);
      const p2 = sub2(p0, [1 - 2 * G2, 1 - 2 * G2]);

      let n = Math.max(0, 0.5 - dot2(p0, p0)) ** 4 * dot2(grad[perm[i + perm[j]] % 12], p0);
      n += Math.max(0, 0.5 - dot2(p1, p1)) ** 4 * dot2(grad[perm[i + o[0] + perm[j + o[1]]] % 12], p1);
      n += Math.max(0, 0.5 - dot2(p2, p2)) ** 4 * dot2(grad[perm[i + 1 + perm[j + 1]] % 12], p2);

      return 70 * n;
    }

    hash(i) {
      i = 1103515245 * ((i >> 1) ^ i);
      const h32 = 1103515245 * (i ^ (i >> 3));
      return h32 ^ (h32 >> 16);
    }
  }

  return new SimplexNoise(seed);
}

function wrinkleNoise(noise, wrinkles, x, y) {
  let n = noise.noise2D([x, y]);
  return Math.sin(n * 3. * wrinkles) * ((.5 + .5 * n) ** 2);
}

function generateCirclePoints(circle, numPoints) {
  let points = [];
  for (let i = 0; i < numPoints; i++) {
    let angle = (i / numPoints) * 2 * Math.PI + (Math.PI / 2);
    let x = circle.point[0] + (circle.radius / 2) * Math.cos(angle);
    let y = circle.point[1] + (circle.radius / 2) * Math.sin(angle);
    points.push([x, y]);
  }
  return points;
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
const a3Format = [1122, 1587];
const a6Format = [397, 559];

