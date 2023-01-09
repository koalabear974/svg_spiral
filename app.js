Element.prototype.remove = function() {
  this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
  for(var i = this.length - 1; i >= 0; i--) {
    if(this[i] && this[i].parentElement) {
      this[i].parentElement.removeChild(this[i]);
    }
  }
}

const recordPosition = (ctx) => {
  let m = ctx.rect.getScreenCTM();
  ctx.points.push({ x: m.e, y: m.f });
};

const beginRecording = (ctx) => {
  let m = ctx.rect.getScreenCTM();
  ctx.points.push({ x: m.e, y: m.f });
  ctx.interval = setInterval(recordPosition.bind(this, ctx), 1000 * 3 / ctx.resolution);
};

const stopRecording = (ctx) => {
  clearInterval(ctx.interval);
  ctx.rect.remove();
  ctx.onDone(ctx.points);
};

const pathToPoints = (path, resolution, onDone) => {
  let ctx = {};
  ctx.resolution = resolution;
  ctx.onDone = onDone;
  ctx.points = [];
  ctx.interval = null;

  // Walk up nodes until we find the root svg node
  let svg = path;
  while (!(svg instanceof SVGSVGElement)) {
    svg = svg.parentElement;
  }
  // Create a rect, which will be used to trace the path

  let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  ctx.rect = rect;
  svg.appendChild(rect);

  let motion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
  motion.setAttribute("path", path.getAttribute("d"));
  motion.setAttribute("begin", "0");
  motion.setAttribute("dur", "3"); // TODO: set this to some larger value, e.g. 10 seconds?
  motion.setAttribute("repeatCount", "1");
  motion.onbegin = beginRecording.bind(this, ctx);
  motion.onend = stopRecording.bind(this, ctx);

  // Add rect
  rect.appendChild(motion);
};

const pointsToPath = (points) => {
  let pathString = "";
  points.forEach((point, i) => {
    pathString = pathString + `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y} `;
  });
  // pathString = pathString + 'z';

  return pathString;
};

function Point(x, y) {
  this.x = x;
  this.y = y;
}

function Region(points) {
  this.points = points || [];
  this.length = points.length;
}

Region.prototype.area = function () {
  var area = 0, i, j, point1, point2;

  for (i = 0, j = this.length - 1; i < this.length; j = i, i++) {
    point1 = this.points[i];
    point2 = this.points[j];
    area += point1.x * point2.y;
    area -= point1.y * point2.x;
  }
  area /= 2;

  return area;
};

Region.prototype.centroid = function () {
  var x = 0, y = 0, i, j, f, point1, point2;

  for (i = 0, j = this.length - 1; i < this.length; j = i, i++) {
    point1 = this.points[i];
    point2 = this.points[j];
    f = point1.x * point2.y - point2.x * point1.y;
    x += (point1.x + point2.x) * f;
    y += (point1.y + point2.y) * f;
  }

  f = this.area() * 6;

  return new Point(x / f, y / f);
};

function getDistance(point1, point2) {
  let y = point2.x - point1.x;
  let x = point2.y - point1.y;

  return Math.sqrt(x * x + y * y);
}

const movePoint = (originalPoint, destination, distance) => {
  let vector = new Point(destination.x - originalPoint.x, destination.y - originalPoint.y);
  let length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  let unitVector = new Point(vector.x / length, vector.y / length);
  return { x: originalPoint.x + unitVector.x * distance, y: originalPoint.y + unitVector.y * distance};
};

const getDeltaToCenter = () => {
  let smallestDistance = 10000;
  let biggestDistance = 0;
  for (let i = 0; i < window.originalPoints.length; i++) {
    let distance = getDistance(window.originalPoints[i], window.originalCenter);
    if (distance > biggestDistance) biggestDistance = distance;
    if (distance < smallestDistance) smallestDistance = distance;
  }

  return { smallestDistance, biggestDistance };
}

const getIncrementRatioDistance = ({ smallestDistance, biggestDistance }, distance) => {
  // Biggest = 1
  // distance =
  // Smallest = 0.1
  // y2-y1/x2-x1
  return (2-0.5)/(biggestDistance - smallestDistance) * distance;
}
const getIncrementRatioEnd = (position) => {
  // Biggest = 1
  // distance =
  // Smallest = 0.1
  // y2-y1/x2-x1
  return (1-0.1)/(window.originalPoints.length) * position;
}

const rotatePoint = (center, { x, y }, angle)  =>{
  let radians = (Math.PI / 180) * angle,
    cos = Math.cos(radians),
    sin = Math.sin(radians),
    nx = (cos * (x - center.x)) + (sin * (y - center.y)) + center.x,
    ny = (cos * (y - center.y)) - (sin * (x - center.x)) + center.y;
  return { x: nx, y: ny };
}

/*
* Calculates the angle ABC (in radians)
*
* A first point, ex: {x: 0, y: 0}
* C second point
* B center point
*/
function getAngle(A,B,C) {
  let AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));
  let BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2));
  let AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
  return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
}

const setShapeRotation = (p1, p2) => {
  if (window.originalRotation) return;
  const rot1 = rotatePoint(p1, p2, 90);
  const rot2 = rotatePoint(p1, p2, -90);
  window.originalRotation = getDistance(rot1, window.originalCenter) > getDistance(rot2, window.originalCenter) ? -1 : 1;
};

const getBiggestDistance = (originalPoints, center) => {
  if (window.biggestDistance) return window.biggestDistance;
  let tempDistance = 0;
  for (let i = 0; i < originalPoints.length; i++) {
    let d = getDistance(originalPoints[i], center);
    if (d > tempDistance) tempDistance = d;
  }
  window.biggestDistance = tempDistance;
  return tempDistance;
};

function isPointInsideShape(point, vs) {
  // ray-casting algorithm based on
  // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

  var x = point.x, y = point.y;

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i].x, yi = vs[i].y;
    var xj = vs[j].x, yj = vs[j].y;

    var intersect = ((yi > y) != (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
};

const generateSpiral = (
  originalPoints,
  center,
  drawMethod= "1",
  increment = 5,
  centerDistance = 10,
  fillToEnd = false,
  preventLoops = true,
  maxTotalCircleItteration = 1000,
) => {
  let points = [];
  let i = 0;
  let circleItteration = 0;
  let allPointsDistance = false;
  window.lastDeletedPoint = 0;
  const deltaDistances = getDeltaToCenter();

  do {
    let circleI = 0;
    do {
      const previousPointIndex = circleItteration < 1 ? 0 : Math.abs(((circleItteration - 1) * originalPoints.length) + circleI);
      const previousPointIndex2 = circleItteration < 2 ? 0 : Math.abs(((circleItteration - 2) * originalPoints.length) + circleI);
      const originalPointIndex = circleI;
      const originalPointIndex2 = circleI + 1;
      // Normal increment -> may run away from the center fast
      // points[i] = movePoint(originalPoints[circleI], center, increment*i);

      // Try of increment proportional to number of points (need to add base increment based on circleitt)
      if (drawMethod === "1") {
        points[i] = movePoint(
          originalPoints[circleI],
          center,
          increment * circleItteration + increment*((circleI+1)/originalPoints.length)
        );
      }

      // Take point from previous itteration to continue increment and add weigthed increment ratio
      if (drawMethod === "2") {
        if (circleItteration > 0) {
          points[i] = movePoint(
            points[previousPointIndex],
            center,
            // increment  // without ratio
            (increment * getIncrementRatioDistance(deltaDistances, getDistance(points[previousPointIndex], window.originalCenter)))
          );
        } else {
          points[i] = movePoint(
            originalPoints[circleI],
            center,
            increment * circleItteration + increment*((circleI+1)/originalPoints.length)
          );
        }
      }


      // Perpendicular concept (make a line with previous 2 points) rotate 2nd point 90* from 1st point toward center then add increment
      if (drawMethod === "3") {
        if (circleItteration > 0 && !window.firstPoints) {
          window.firstPoints = points.slice(0, window.originalPoints.length-1);
        }

        let p1, p2, hadLastPoint;
        if (circleItteration > 0) {
          setShapeRotation(points[previousPointIndex], points[previousPointIndex + 1]);
          p1 = points[previousPointIndex];
          hadLastPoint = false;
          p2 = points[previousPointIndex + 1];
          if (!p2) {
            // We have to know if we used last point instead of forward point to reverse rotation
            hadLastPoint = true;
            p2 = points[previousPointIndex - 1];
          }
        } else {
          p1 = originalPoints[originalPointIndex];
          hadLastPoint = false;
          p2 = originalPoints[originalPointIndex2];
          setShapeRotation(p1, p2);
          if (!p2) {
            // We have to know if we used last point instead of forward point to reverse rotation
            hadLastPoint = true;
            p2 = originalPoints[originalPointIndex -1 ];
          }
        }

        let tempIncrement = circleItteration > 0 ? increment : increment * circleItteration + increment*((circleI+1)/originalPoints.length);
        points[i] = movePoint(p1, p2, tempIncrement);
        points[i] = rotatePoint(p1, points[i], window.originalRotation * 90 * (hadLastPoint ? -1 : 1))
      }

      // From center
      if (drawMethod === "4") {
        if (circleItteration > 0) {
          const biggestDistance = getBiggestDistance(originalPoints, center)
          // biggest = 1
          // current =

          // center distance = 150
          // point distance =
          let ratio = getDistance(center, originalPoints[circleI]) / biggestDistance;
          points[i] = movePoint(
            points[previousPointIndex],
            originalPoints[circleI],
            // increment  // without ratio
            (increment * ratio)
          );
        } else {
          points[i] = movePoint(
            center,
            originalPoints[circleI],
            increment * circleItteration + increment*((circleI+1)/originalPoints.length)
          );
        }
      }


      // Try deletion part
      // if (circleItteration > 0) {
      //   let angle1 = getAngle(points[i], points[i - 1], points[i - 2]);
      //   let angle2 = getAngle(points[i - 1], points[i - 2], points[i - 3]);
      //   if ((angle2-angle1) > 0.5 && window.lastDeletedPoint !== i - 1) {
      //     console.log("DELETE POINT", circleI, points[i], points[i - 1]);
      //     plotPoints([points[i], points[i - 1]]);
      //     points[i] = points[i - 1];
      //     window.lastDeletedPoint = i;
      //   }
      //
      //   if (getDistance(points[i], points[i - 1]) < 0.5 && window.lastDeletedPoint !== i - 1) {
      //     console.log("DELETE POINT", points[i], points[i - 1]);
      //     plotPoints([points[i], points[i - 1]]);
      //     points[i] = points[i - 1];
      //     window.lastDeletedPoint = i;
      //     // i = i -1;
      //   }
      //
      //   const average = arr => arr.reduce( ( p, c ) => p + c, 0) / arr.length;
      //   const averageDistance = average([
      //       getDistance(points[i - 1], points[i - 2]),
      //       getDistance(points[i - 2], points[i - 3]),
      //       getDistance(points[i - 3], points[i - 4]),
      //       getDistance(points[i - 4], points[i - 5]),
      //       getDistance(points[i - 5], points[i - 6]),
      //       getDistance(points[i - 6], points[i - 7])
      //     ]);
      //
      //   if (getDistance(points[i], points[i - 1]) > (averageDistance + 100) && window.lastDeletedPoint !== i - 1) {
      //     console.log("DELETE POINT", points[i], points[i - 1]);
      //     plotPoints([points[i], points[i - 1]]);
      //     points[i] = points[i - 1];
      //     window.lastDeletedPoint = i;
      //     // i = i -1;
      //   }
      // }
      // if (circleItteration > 0) {
      //   if (!isPointInsideShape(points[i], window.firstPoints ? window.firstPoints: [])) {
      //     console.log(circleItteration, circleI, i , points[i]);
      //     console.log("---------");
      //     let p1 = points[previousPointIndex];
      //     let p2 = points[previousPointIndex + 1];
      //     let p3 = movePoint(
      //       p1,
      //       p2,
      //       increment * circleItteration + increment*((circleI+1)/originalPoints.length)
      //     )
      //     let p4 = points[i] = rotatePoint(p1, points[i], window.originalRotation * 90);
      //     console.log(p1, p2, getDistance(p1,p2), p3, p4, getDistance(p1,p3));
      //     plotPoints([p1, p2, p3, p4]);
      //     console.log("---------");
      //     // points.slice(i-1, 1);
      //   }
      // }

      // ------------------------------


      // Prevent loops
      if (circleItteration > 0 && preventLoops) {
        if (getDistance(points[i], center) > getDistance(points[previousPointIndex], center)) {
          points[i]=points[previousPointIndex];
        }
      }

      i = i + 1;
      circleI = circleI + 1;
    } while (circleI < originalPoints.length);
    circleItteration = circleItteration + 1;
    console.log("INFO - Circle itteration: "+circleItteration+", Point itteration: "+ i);

    if (fillToEnd) {
      allPointsDistance = true;
      for (let j = i-circleI; j < i; j++) {
        if (!allPointsDistance) continue;
        if (getDistance(points[j], center) > centerDistance) allPointsDistance = false;
      }
    } else {
      if (drawMethod === "4") {
        allPointsDistance = getDistance(points[i - 1], originalPoints[circleI -1]) < centerDistance;
      } else {
        allPointsDistance = getDistance(points[i - 1], center) < centerDistance
      }
    }
  } while (circleItteration < maxTotalCircleItteration && !allPointsDistance);
  return points;
};

const deleteDrawnShape = () => {
  document.getElementById("rep_svg") && document.getElementById("rep_svg").remove();
  document.getElementById("rep_svg_2") && document.getElementById("rep_svg_2").remove();
}

const loadOriginalPoints = () => {
  return new Promise((resolve, reject) => {
    const mypath = document.getElementById('Layer_1');
    console.log("INFO - Loaded path");
    pathToPoints(mypath, 800, function (points) {
      console.log("INFO - Path converted to points");
      let cleanPoints = [];
      for (let i = 0; i < points.length; i++) {
        if (points[i +1] && getDistance(points[i], points[i + 1]) < 0.01) {
          continue;
        }
        cleanPoints[cleanPoints.length] = points[i];
      }
      window.originalPoints = cleanPoints;
      resolve(true);
    });
  });
}

const locateCenter = () => {
  console.log("INFO - Get Center");
  const region = new Region(window.originalPoints);
  window.originalCenter = region.centroid();
  document.getElementById("centerPosition").value = window.originalCenter.x + "," + window.originalCenter.y
  console.log("INFO - Center: ", window.originalCenter);
}

const drawNewShape = () => {
  deleteDrawnShape();
  const drawMethod = document.getElementById('drawMethod').value;
  const increment = document.getElementById('increment').value;
  const centerDistance = document.getElementById('centerDistance').value;
  const fillToEnd = document.getElementById('fillToEnd').checked;
  const preventLoops = document.getElementById('preventLoops').checked;
  const maxTotalCircleItteration = document.getElementById('maxTotalCircleItteration').value;
  // window.originalCenter = new Point(Number(document.getElementById("centerPosition").value.split(',')[0]), Number(document.getElementById("centerPosition").value.split(',')[1]));

  const spiralPoints = generateSpiral(
    window.originalPoints,
    window.originalCenter,
    drawMethod,
    increment,
    centerDistance,
    fillToEnd,
    preventLoops,
    maxTotalCircleItteration
  );

  const pathString = pointsToPath(spiralPoints);
  console.log("INFO - Points converted to path");

  let draw = SVG().addTo('#svgs').size(1200, 1200).id('rep_svg');
  draw.fill('none').stroke({ width: 1, color: '#000' });
  draw.path(pathString);

  const pathString2 = pointsToPath(window.originalPoints);
  console.log("INFO - Points converted to path");

  let draw2 = SVG().addTo('#svgs').size(1200, 1200).id('rep_svg_2');
  draw2.fill('none').stroke({ width: 1, color: '#ff0000' });
  draw2.path(pathString2);
  console.log("INFO - Path drawn");
};

window.drawNewShape = drawNewShape;

const hideOriginalShape = () => {
  const mypath = document.getElementById('Layer_1');
  mypath.style.display = mypath.style.display === 'none' ? 'block' : 'none';
  const mypath2 = document.getElementById('rep_svg_2');
  mypath2.style.display = mypath2.style.display === 'none' ? 'block' : 'none';
}
window.hideOriginalShape = hideOriginalShape;

const showCenter = () => {
  const centerpath = document.getElementById('centerpath');
  if (centerpath) {
    centerpath.remove();
    return;
  }

  let draw = SVG().addTo('#svgs').size(1200, 1200).id('centerpath');
  draw.circle(10).fill('#ff0000').x(window.originalCenter.x).y(window.originalCenter.y)
}
window.showCenter = showCenter;

const plotPoints = (pointsArray) => {
  let draw = SVG().addTo('#svgs').size(1200, 1200).id('pointArray');
  for (let i = 0; i < pointsArray.length; i++) {
    draw.circle(2).fill('#0000ff').x(pointsArray[i].x).y(pointsArray[i].y)
  }
}
window.plotPoints = plotPoints;

const addTransformToShape = () => {
  const transform = document.getElementById('transform').value;
  const centerpath = document.getElementById('centerpath');
  if (centerpath && centerpath.childNodes[0].getAttribute("transform")) {
    centerpath.childNodes[0].setAttribute("transform", "");
  } else {
    centerpath && centerpath.childNodes[0].setAttribute("transform", transform);
  }
  const svg = document.getElementById('rep_svg');
  if (svg && svg.childNodes[0].getAttribute("transform")) {
    svg.childNodes[0].setAttribute("transform", "");
  } else {
    svg && svg.childNodes[0].setAttribute("transform", transform);
  }
  const svg_2 = document.getElementById('rep_svg_2');
  if (svg_2 && svg_2.childNodes[0].getAttribute("transform")) {
    svg_2.childNodes[0].setAttribute("transform", "");
  } else {
    svg_2 && svg_2.childNodes[0].setAttribute("transform", transform);
  }
}
window.addTransformToShape = addTransformToShape;

(function () {
  window.originalPoints = [];
  window.originalCenter = {x:0, y:0};
  loadOriginalPoints().then(() => {

    console.log(window.originalPoints.length);

    // window.originalPoints = JSON.parse("[{\"x\":502.84063720703125,\"y\":1101.851318359375},{\"x\":501.32830810546875,\"y\":1091.5550537109375},{\"x\":457.1069030761719,\"y\":1005.8093872070312},{\"x\":442.2850036621094,\"y\":989.3954467773438},{\"x\":434.9823913574219,\"y\":981.9781494140625},{\"x\":426.5632629394531,\"y\":973.839111328125},{\"x\":418.9242858886719,\"y\":966.7684936523438},{\"x\":411.15985107421875,\"y\":959.8358154296875},{\"x\":402.2965087890625,\"y\":952.1826782226562},{\"x\":394.32049560546875,\"y\":945.4944458007812},{\"x\":386.2666931152344,\"y\":938.9000244140625},{\"x\":377.12786865234375,\"y\":931.578125},{\"x\":368.94635009765625,\"y\":925.142822265625},{\"x\":359.68902587890625,\"y\":917.9710693359375},{\"x\":351.4225158691406,\"y\":911.645263671875},{\"x\":343.1286926269531,\"y\":905.3553466796875},{\"x\":334.81475830078125,\"y\":899.092041015625},{\"x\":325.446044921875,\"y\":892.0662841796875},{\"x\":317.11175537109375,\"y\":885.8298950195312},{\"x\":308.77777099609375,\"y\":879.59326171875},{\"x\":299.4097900390625,\"y\":872.5667114257812},{\"x\":291.095947265625,\"y\":866.3031005859375},{\"x\":281.765625,\"y\":859.2266235351562},{\"x\":273.4984436035156,\"y\":852.9017333984375},{\"x\":265.26239013671875,\"y\":846.5363159179688},{\"x\":256.041259765625,\"y\":839.3180541992188},{\"x\":247.89108276367188,\"y\":832.8431396484375},{\"x\":239.79124450683594,\"y\":826.305419921875},{\"x\":231.748046875,\"y\":819.6980590820312},{\"x\":222.77587890625,\"y\":812.1727294921875},{\"x\":214.87657165527344,\"y\":805.39404296875},{\"x\":206.08517456054688,\"y\":797.658447265625},{\"x\":199.32424926757812,\"y\":791.5555419921875},{\"x\":190.74041748046875,\"y\":783.59033203125},{\"x\":182.29092407226562,\"y\":775.4825439453125},{\"x\":174.90420532226562,\"y\":768.1487426757812},{\"x\":167.64500427246094,\"y\":760.688720703125},{\"x\":159.64437866210938,\"y\":752.1378173828125},{\"x\":152.69320678710938,\"y\":744.39013671875},{\"x\":145.90576171875,\"y\":736.49853515625},{\"x\":138.48190307617188,\"y\":727.4425659179688},{\"x\":132.0862274169922,\"y\":719.2301025390625},{\"x\":125.89705657958984,\"y\":710.861328125},{\"x\":119.9288101196289,\"y\":702.3335571289062},{\"x\":113.49715423583984,\"y\":692.5479736328125},{\"x\":108.04832458496094,\"y\":683.6792602539062},{\"x\":102.86778259277344,\"y\":674.6512451171875},{\"x\":97.37909698486328,\"y\":664.3076782226562},{\"x\":92.8048324584961,\"y\":654.957763671875},{\"x\":88.34098815917969,\"y\":645.5542602539062},{\"x\":83.93008422851562,\"y\":636.1259765625},{\"x\":79.03389739990234,\"y\":625.48828125},{\"x\":74.74369812011719,\"y\":616.00439453125},{\"x\":70.5147933959961,\"y\":606.4929809570312},{\"x\":66.3505859375,\"y\":596.953125},{\"x\":62.254302978515625,\"y\":587.3838500976562},{\"x\":57.73221206665039,\"y\":576.5819091796875},{\"x\":53.79373550415039,\"y\":566.9466552734375},{\"x\":49.46015167236328,\"y\":556.0676879882812},{\"x\":45.70012664794922,\"y\":546.3613891601562},{\"x\":42.03255081176758,\"y\":536.619873046875},{\"x\":38.46352767944336,\"y\":526.8416748046875},{\"x\":34.99993896484375,\"y\":517.0255126953125},{\"x\":31.238985061645508,\"y\":505.93560791015625},{\"x\":28.025907516479492,\"y\":496.03485107421875},{\"x\":24.569843292236328,\"y\":484.8463134765625},{\"x\":21.650917053222656,\"y\":474.85491943359375},{\"x\":18.555322647094727,\"y\":463.56134033203125},{\"x\":15.986889839172363,\"y\":453.47418212890625},{\"x\":14.183863639831543,\"y\":445.87847900390625},{\"x\":11.958841323852539,\"y\":435.71002197265625},{\"x\":9.957855224609375,\"y\":425.49517822265625},{\"x\":8.204852104187012,\"y\":415.23486328125},{\"x\":7.069591999053955,\"y\":407.51116943359375},{\"x\":5.8207478523254395,\"y\":397.17767333984375},{\"x\":5.002732753753662,\"y\":388.1065673828125},{\"x\":4.4202165603637695,\"y\":377.71435546875},{\"x\":4.273576259613037,\"y\":366.00616455078125},{\"x\":4.659902572631836,\"y\":355.6051025390625},{\"x\":5.603096961975098,\"y\":345.2401123046875},{\"x\":7.4265618324279785,\"y\":333.67529296875},{\"x\":9.819541931152344,\"y\":323.547607421875},{\"x\":13.031347274780273,\"y\":313.64959716796875},{\"x\":17.142839431762695,\"y\":304.09130859375},{\"x\":22.916038513183594,\"y\":293.9112548828125},{\"x\":29.085920333862305,\"y\":285.534912109375},{\"x\":36.19172286987305,\"y\":277.9366455078125},{\"x\":45.18333435058594,\"y\":270.447021484375},{\"x\":53.912513732910156,\"y\":264.78509521484375},{\"x\":63.179710388183594,\"y\":260.05419921875},{\"x\":74.07798767089844,\"y\":255.7818603515625},{\"x\":84.05892181396484,\"y\":252.8349609375},{\"x\":94.22369384765625,\"y\":250.60198974609375},{\"x\":105.79837036132812,\"y\":248.8411865234375},{\"x\":116.1597900390625,\"y\":247.86090087890625},{\"x\":126.55612182617188,\"y\":247.36181640625},{\"x\":136.9643096923828,\"y\":247.28717041015625},{\"x\":148.668212890625,\"y\":247.64923095703125},{\"x\":159.0556182861328,\"y\":248.32147216796875},{\"x\":169.4197540283203,\"y\":249.2862548828125},{\"x\":181.0460662841797,\"y\":250.68389892578125},{\"x\":191.34779357910156,\"y\":252.17498779296875},{\"x\":201.61671447753906,\"y\":253.87689208984375},{\"x\":211.85208129882812,\"y\":255.77032470703125},{\"x\":223.3265380859375,\"y\":258.1082763671875},{\"x\":233.4903564453125,\"y\":260.35504150390625},{\"x\":244.88441467285156,\"y\":263.0552978515625},{\"x\":254.9787139892578,\"y\":265.59686279296875},{\"x\":265.0411376953125,\"y\":268.2606201171875},{\"x\":276.32489013671875,\"y\":271.3924560546875},{\"x\":286.323486328125,\"y\":274.28741455078125},{\"x\":296.2934265136719,\"y\":277.27947998046875},{\"x\":307.4765319824219,\"y\":280.75335693359375},{\"x\":317.388916015625,\"y\":283.93084716796875},{\"x\":327.27593994140625,\"y\":287.186767578125},{\"x\":337.13812255859375,\"y\":290.516357421875},{\"x\":348.2049560546875,\"y\":294.344482421875},{\"x\":358.0181884765625,\"y\":297.81610107421875},{\"x\":367.8100280761719,\"y\":301.34820556640625},{\"x\":377.5809326171875,\"y\":304.9373779296875},{\"x\":388.54925537109375,\"y\":309.03936767578125},{\"x\":398.27874755859375,\"y\":312.73907470703125},{\"x\":407.99029541015625,\"y\":316.486083984375},{\"x\":417.6840515136719,\"y\":320.277587890625},{\"x\":427.3614501953125,\"y\":324.111328125},{\"x\":438.2299499511719,\"y\":328.47149658203125},{\"x\":447.8744812011719,\"y\":332.38629150390625},{\"x\":458.7078552246094,\"y\":336.83203125},{\"x\":468.3238830566406,\"y\":340.8184814453125},{\"x\":477.9268798828125,\"y\":344.83489990234375},{\"x\":487.5179748535156,\"y\":348.8797607421875},{\"x\":498.2947082519531,\"y\":353.46136474609375},{\"x\":507.86285400390625,\"y\":357.5595703125},{\"x\":517.4217529296875,\"y\":361.68017578125},{\"x\":526.9716186523438,\"y\":365.8209228515625},{\"x\":537.7056274414062,\"y\":370.5013427734375},{\"x\":547.2394409179688,\"y\":374.67926025390625},{\"x\":556.7667236328125,\"y\":378.871337890625},{\"x\":566.2886962890625,\"y\":383.07586669921875},{\"x\":578.1851806640625,\"y\":388.34613037109375},{\"x\":586.5093383789062,\"y\":392.042724609375},{\"x\":597.2093505859375,\"y\":396.80181884765625},{\"x\":609.0958251953125,\"y\":402.0938720703125},{\"x\":618.6053466796875,\"y\":406.32763671875},{\"x\":628.1158447265625,\"y\":410.55853271484375},{\"x\":637.62890625,\"y\":414.78338623046875},{\"x\":648.3363037109375,\"y\":419.52447509765625},{\"x\":656.6697387695312,\"y\":423.200439453125},{\"x\":667.3929443359375,\"y\":427.90625},{\"x\":676.9351806640625,\"y\":432.06439208984375},{\"x\":687.6862182617188,\"y\":436.70703125},{\"x\":697.2594604492188,\"y\":440.7943115234375},{\"x\":706.8521728515625,\"y\":444.835205078125},{\"x\":716.468994140625,\"y\":448.819091796875},{\"x\":727.3226318359375,\"y\":453.21533203125},{\"x\":737.0086669921875,\"y\":457.0269775390625},{\"x\":746.7394409179688,\"y\":460.722412109375},{\"x\":756.5265502929688,\"y\":464.2667236328125},{\"x\":767.6229858398438,\"y\":468.0079345703125},{\"x\":777.5862426757812,\"y\":471.0198974609375},{\"x\":788.9476318359375,\"y\":473.84942626953125},{\"x\":799.2240600585938,\"y\":475.4708251953125},{\"x\":810.839599609375,\"y\":474.75927734375},{\"x\":820.9719848632812,\"y\":468.9425048828125},{\"x\":829.3652954101562,\"y\":462.7916259765625},{\"x\":838.1002197265625,\"y\":454.99951171875},{\"x\":845.1461791992188,\"y\":447.3427734375},{\"x\":852.1958618164062,\"y\":437.99859619140625},{\"x\":857.0205078125,\"y\":430.27593994140625},{\"x\":862.39501953125,\"y\":419.87579345703125},{\"x\":866.89501953125,\"y\":409.06787109375},{\"x\":870.2316284179688,\"y\":399.20947265625},{\"x\":873.017333984375,\"y\":389.18133544921875},{\"x\":875.5819091796875,\"y\":377.75653076171875},{\"x\":877.2206420898438,\"y\":368.79742431640625},{\"x\":878.9450073242188,\"y\":357.21490478515625},{\"x\":880.3165893554688,\"y\":345.585693359375},{\"x\":881.301513671875,\"y\":335.223388671875},{\"x\":882.1168212890625,\"y\":324.8463134765625},{\"x\":882.886962890625,\"y\":313.16156005859375},{\"x\":883.4874267578125,\"y\":302.76910400390625},{\"x\":884.050048828125,\"y\":292.3751220703125},{\"x\":884.6132202148438,\"y\":281.98211669921875},{\"x\":885.294677734375,\"y\":270.29095458984375},{\"x\":885.98486328125,\"y\":259.9046630859375},{\"x\":886.7949829101562,\"y\":249.52691650390625},{\"x\":887.8995361328125,\"y\":237.86871337890625},{\"x\":889.0997924804688,\"y\":227.529052734375},{\"x\":890.5521240234375,\"y\":217.22119140625},{\"x\":892.5458374023438,\"y\":205.68310546875},{\"x\":894.6934814453125,\"y\":195.49847412109375},{\"x\":897.2485961914062,\"y\":185.408447265625},{\"x\":900.6763305664062,\"y\":174.2127685546875},{\"x\":904.2721557617188,\"y\":164.446044921875},{\"x\":908.4342041015625,\"y\":154.9066162109375},{\"x\":913.8404541015625,\"y\":144.52197265625},{\"x\":918.5972900390625,\"y\":136.7559814453125},{\"x\":925.4306030273438,\"y\":127.2503662109375},{\"x\":932.1683959960938,\"y\":119.3184814453125},{\"x\":940.449951171875,\"y\":111.04443359375},{\"x\":948.3792724609375,\"y\":104.30419921875},{\"x\":956.7782592773438,\"y\":98.15966796875},{\"x\":966.706787109375,\"y\":91.9556884765625},{\"x\":975.883056640625,\"y\":87.04443359375},{\"x\":985.3416748046875,\"y\":82.70361328125},{\"x\":995.0758666992188,\"y\":79.02099609375},{\"x\":1006.3275756835938,\"y\":75.7919921875},{\"x\":1016.5505981445312,\"y\":73.852294921875},{\"x\":1026.9114990234375,\"y\":72.89501953125},{\"x\":1038.6131591796875,\"y\":73.0955810546875},{\"x\":1048.9276123046875,\"y\":74.4610595703125},{\"x\":1059.031494140625,\"y\":76.9429931640625},{\"x\":1070.0068359375,\"y\":81.006103515625},{\"x\":1079.318603515625,\"y\":85.6480712890625},{\"x\":1088.1541748046875,\"y\":91.143798828125},{\"x\":1111.6483154296875,\"y\":111.617919921875},{\"x\":1119.3343505859375,\"y\":120.4503173828125},{\"x\":1126.4573974609375,\"y\":129.7425537109375},{\"x\":1131.6334228515625,\"y\":137.23681640625},{\"x\":1137.848876953125,\"y\":147.16015625},{\"x\":1142.984619140625,\"y\":156.21337890625},{\"x\":1148.352294921875,\"y\":166.62109375},{\"x\":1153.3104248046875,\"y\":177.22906494140625},{\"x\":1157.396484375,\"y\":186.802490234375},{\"x\":1161.2470703125,\"y\":196.47320556640625},{\"x\":1165.3177490234375,\"y\":207.45318603515625},{\"x\":1168.7015380859375,\"y\":217.2969970703125},{\"x\":1171.479736328125,\"y\":225.97064208984375},{\"x\":1175.1512451171875,\"y\":238.45281982421875},{\"x\":1177.8355712890625,\"y\":248.5096435546875},{\"x\":1180.294921875,\"y\":258.62469482421875},{\"x\":1182.5289306640625,\"y\":268.79180908203125},{\"x\":1184.773193359375,\"y\":280.284423828125},{\"x\":1186.530029296875,\"y\":290.54376220703125},{\"x\":1188.064208984375,\"y\":300.83892822265625},{\"x\":1189.376953125,\"y\":311.16455078125},{\"x\":1190.4705810546875,\"y\":321.51605224609375},{\"x\":1191.441162109375,\"y\":333.18609619140625},{\"x\":1192.075927734375,\"y\":343.57586669921875},{\"x\":1192.4989013671875,\"y\":353.9759521484375},{\"x\":1192.7254638671875,\"y\":365.68402099609375},{\"x\":1192.721923828125,\"y\":374.79193115234375},{\"x\":1192.4898681640625,\"y\":386.49981689453125},{\"x\":1192.007080078125,\"y\":398.1995849609375},{\"x\":1191.3712158203125,\"y\":408.58953857421875},{\"x\":1190.5447998046875,\"y\":418.9654541015625},{\"x\":1189.5316162109375,\"y\":429.32501220703125},{\"x\":1188.17333984375,\"y\":440.95562744140625},{\"x\":1186.7760009765625,\"y\":451.27020263671875},{\"x\":1185.2041015625,\"y\":461.5599365234375},{\"x\":1183.4615478515625,\"y\":471.8212890625},{\"x\":1181.5518798828125,\"y\":482.0533447265625},{\"x\":1179.208984375,\"y\":493.52630615234375},{\"x\":1176.95751953125,\"y\":503.688232421875},{\"x\":1174.2393798828125,\"y\":515.0782470703125},{\"x\":1171.6629638671875,\"y\":525.1627807617188},{\"x\":1168.588134765625,\"y\":536.4629516601562},{\"x\":1165.332275390625,\"y\":547.7108154296875},{\"x\":1162.2900390625,\"y\":557.6650390625},{\"x\":1158.70458984375,\"y\":568.813720703125},{\"x\":1155.376708984375,\"y\":578.677490234375},{\"x\":1151.4788818359375,\"y\":589.7197875976562},{\"x\":1147.8804931640625,\"y\":599.4867553710938},{\"x\":1144.1593017578125,\"y\":609.208251953125},{\"x\":1139.82958984375,\"y\":620.0894165039062},{\"x\":1135.8570556640625,\"y\":629.7106323242188},{\"x\":1131.770751953125,\"y\":639.2838134765625},{\"x\":1127.5728759765625,\"y\":648.8089599609375},{\"x\":1122.720458984375,\"y\":659.4664916992188},{\"x\":1118.29443359375,\"y\":668.8870239257812},{\"x\":1113.7647705078125,\"y\":678.2586669921875},{\"x\":1109.133056640625,\"y\":687.5807495117188},{\"x\":1104.40234375,\"y\":696.8530883789062},{\"x\":1098.9649658203125,\"y\":707.2222290039062},{\"x\":1094.02978515625,\"y\":716.3876953125},{\"x\":1088.3663330078125,\"y\":726.6387939453125},{\"x\":1083.23583984375,\"y\":735.6956787109375},{\"x\":1078.0164794921875,\"y\":744.700927734375},{\"x\":1072.0394287109375,\"y\":754.77197265625},{\"x\":1067.3157958984375,\"y\":762.5594482421875},{\"x\":1061.14794921875,\"y\":772.5133666992188},{\"x\":1055.577392578125,\"y\":781.3064575195312},{\"x\":1049.2130126953125,\"y\":791.1373291015625},{\"x\":1043.4715576171875,\"y\":799.8194580078125},{\"x\":1037.6510009765625,\"y\":808.4500122070312},{\"x\":1031.75341796875,\"y\":817.0276489257812},{\"x\":1025.0283203125,\"y\":826.6133422851562},{\"x\":1019.7312622070312,\"y\":834.0235595703125},{\"x\":1012.8384399414062,\"y\":843.48974609375},{\"x\":1005.8531494140625,\"y\":852.888427734375},{\"x\":1000.3572998046875,\"y\":860.1510009765625},{\"x\":993.2109375,\"y\":869.4280395507812},{\"x\":986.7841796875,\"y\":877.6158447265625},{\"x\":979.4707641601562,\"y\":886.7615966796875},{\"x\":972.896728515625,\"y\":894.8323974609375},{\"x\":966.2550659179688,\"y\":902.8466796875},{\"x\":959.545654296875,\"y\":910.8045654296875},{\"x\":952.76904296875,\"y\":918.7056884765625},{\"x\":945.0658569335938,\"y\":927.5254516601562},{\"x\":938.1478271484375,\"y\":935.3037109375},{\"x\":930.2869873046875,\"y\":943.983154296875},{\"x\":923.2299194335938,\"y\":951.634521484375},{\"x\":916.107177734375,\"y\":959.2255859375},{\"x\":908.9195556640625,\"y\":966.7548217773438},{\"x\":901.6666259765625,\"y\":974.2216186523438},{\"x\":893.4301147460938,\"y\":982.544921875},{\"x\":885.1109619140625,\"y\":990.7864990234375},{\"x\":876.7091064453125,\"y\":998.9439697265625},{\"x\":867.27685546875,\"y\":1007.9068603515625},{\"x\":860.6128540039062,\"y\":1014.116455078125},{\"x\":851.971435546875,\"y\":1022.0189819335938},{\"x\":844.2195434570312,\"y\":1028.9654541015625},{\"x\":835.41845703125,\"y\":1036.6900634765625},{\"x\":827.5230102539062,\"y\":1043.4739990234375},{\"x\":818.5592041015625,\"y\":1051.00927734375},{\"x\":810.5171508789062,\"y\":1057.6192626953125},{\"x\":802.4055786132812,\"y\":1064.142333984375},{\"x\":794.222412109375,\"y\":1070.57568359375},{\"x\":785.9669189453125,\"y\":1076.915771484375},{\"x\":776.5910034179688,\"y\":1083.9317626953125},{\"x\":768.1771240234375,\"y\":1090.059326171875},{\"x\":758.618408203125,\"y\":1096.82470703125},{\"x\":750.0380859375,\"y\":1102.717529296875},{\"x\":741.3760986328125,\"y\":1108.490478515625},{\"x\":732.6306762695312,\"y\":1114.135986328125},{\"x\":722.689697265625,\"y\":1120.3243408203125},{\"x\":713.758544921875,\"y\":1125.670654296875},{\"x\":704.7349853515625,\"y\":1130.860107421875},{\"x\":695.6167602539062,\"y\":1135.880126953125},{\"x\":685.2398681640625,\"y\":1141.3074951171875},{\"x\":675.907470703125,\"y\":1145.9168701171875},{\"x\":666.4678344726562,\"y\":1150.3033447265625},{\"x\":656.9178466796875,\"y\":1154.442626953125},{\"x\":646.0361328125,\"y\":1158.7681884765625},{\"x\":637.4691772460938,\"y\":1161.8594970703125},{\"x\":626.318359375,\"y\":1165.4324951171875},{\"x\":616.2767333984375,\"y\":1168.1728515625},{\"x\":604.8389892578125,\"y\":1170.6781005859375},{\"x\":594.558349609375,\"y\":1172.297119140625},{\"x\":582.894287109375,\"y\":1173.2928466796875},{\"x\":572.4884033203125,\"y\":1173.29052734375},{\"x\":562.1337280273438,\"y\":1172.2762451171875},{\"x\":551.9711303710938,\"y\":1170.0576171875},{\"x\":542.2177734375,\"y\":1166.448974609375},{\"x\":519.12451171875,\"y\":1147.90087890625},{\"x\":517.5973510742188,\"y\":1145.794677734375},{\"x\":511.7568664550781,\"y\":1135.6593017578125},{\"x\":507.8999938964844,\"y\":1125.998291015625},{\"x\":505.1410827636719,\"y\":1115.9658203125},{\"x\":503.1451721191406,\"y\":1104.430908203125}]");

    console.log(window.originalPoints.length);
    // Hexagonal
    // window.originalPoints = [
    //   {x: 600, y: 850},
    //   {x: 800, y: 500},
    //   {x: 600, y: 150},
    //   {x: 200, y: 150},
    //   {x: 0, y: 500},
    //   {x: 200, y: 850},
    // ];

    locateCenter();
    drawNewShape()
  });
})();
