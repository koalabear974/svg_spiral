var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;

var verticalPadding = 200;
var verticalPaddingMin = 10;
var verticalPaddingMax = 1000;
var verticalPaddingStep = 1;
var horizontalPadding = 150;
var horizontalPaddingMin = 10;
var horizontalPaddingMax = 1000;
var horizontalPaddingStep = 1;

var numberOfCircles = 50;
var numberOfCirclesMin = 10;
var numberOfCirclesMax = 200;
var numberOfCirclesStep = 1;

var circleSizeS = 10;
var circleSizeSMin = 10;
var circleSizeSMax = 1000;
var circleSizeSStep = 1;

var circleSizeE = 150;
var circleSizeEMin = 10;
var circleSizeEMax = 1000;
var circleSizeEStep = 1;
var circleResolution = 130;
var circleResolutionMin = 10;
var circleResolutionMax = 1000;
var circleResolutionStep = 1;

var radiusDecrease = 50;
var radiusDecreaseMin = 1;
var radiusDecreaseMax = 200;
var radiusDecreaseStep = 1;

var showCircles = false


var numberOfLines = 200;
var numberOfLinesMin = 10;
var numberOfLinesMax = 1000;
var numberOfLinesStep = 1;
var lineResolution = 200;
var lineResolutionMin = 10;
var lineResolutionMax = 1000;
var lineResolutionStep = 1;
var scoreScale = 2;
var scoreScaleMin = 1;
var scoreScaleMax = 10;
var scoreScaleStep = 0.1;
var modScale = 2;
var modScaleMin = 1;
var modScaleMax = 10;
var modScaleStep = 0.1;
var modDistance = 2;
var modDistanceMin = 1;
var modDistanceMax = 10;
var modDistanceStep = 0.1;
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
    'verticalPadding',
    'horizontalPadding',
    'numberOfCircles',
    'circleSizeS',
    'circleSizeE',
    'radiusDecrease',
    'circleResolution',
    'showCircles',
    'numberOfLines',
    'lineResolution',
    'scoreScale',
    'modScale',
    'modDistance',
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


function generateRandomCircles() {
  let circles = [];
  for (let i = 0; i < numberOfCircles; i++) {
    let point = [
      Math.round(random() * (width - (2 * horizontalPadding))) + horizontalPadding,
      Math.round(random() * (height - (2 * verticalPadding))) + verticalPadding,
    ];
    let radius = random() * (circleSizeE - circleSizeS + 1) + circleSizeS;

    circles.push({ point, radius });
  }

  circles.forEach((c, i) => {
    circles.forEach((c2, u) => {
      if (c === c2) return;
      if (isCircleContained(c2, c)) {
        delete circles[u];
      }
    });
  });

  
  return circles.filter((c) => c);
}

// group circles by their center points
function generateGroups(circles) {
  let visited = new Array(circles.length).fill(false);
  let connectedCircles = [];

  // Depth-first search (DFS) algorithm to find connected components
  function dfs(circleIndex, circles, visited, currentGroup) {
    visited[circleIndex] = true;
    currentGroup.push(circleIndex);

    for (let i = 0; i < circles.length; i++) {
      if (!visited[i] && doCirclesIntersect(circles[circleIndex], circles[i])) {
        dfs(i, circles, visited, currentGroup);
      }
    }
  }

  for (let i = 0; i < circles.length; i++) {
    if (!visited[i]) {
      let currentGroup = [];
      dfs(i, circles, visited, currentGroup);
      connectedCircles.push(currentGroup);
    }
  }
  return connectedCircles;
}

function drawOuterShell(circles, connectedCircles) {
  let outerShells = [];
  connectedCircles.forEach(group => {
    let allPoints = [];

    // Generate all points from all circles in the group
    group.forEach(circleIndex => {
      let circle = circles[circleIndex];
      let circlePoints = generateCirclePoints(circle, circleResolution);
      allPoints.push(...circlePoints);
    });

    // Remove points that are strictly inside any circle in the group
    let outerShape = allPoints.filter(point => {
      return !group.some(circleIndex => isPointInsideCircle(point, circles[circleIndex]));
    });

    let neigh = nearestNeighbor(outerShape);
    let sortedOuterShape = [];
    neigh.tour.forEach((pIndex) => {
      sortedOuterShape.push(outerShape[pIndex]);
    });

    outerShells.push(sortedOuterShape);
  });

  return outerShells;
}

function draw() {
  randomSeed(seed);
  clear();
  noFill();


  let circles = generateRandomCircles();
  let connectedCircles = generateGroups(circles);
  stroke("blue");
  let outerShells = drawOuterShell(circles, connectedCircles);
  let circles2 = circles.map((c) => {
    if (c.radius - radiusDecrease > 0) {
      return { point: c.point, radius: c.radius - radiusDecrease}
    }
    return null
  }).filter((c) => c)
  let connectedCircles2 = generateGroups(circles2);
  let outerShells2 = drawOuterShell(circles2, connectedCircles2);
  // push()
  // scale(1, 0.5);


  let flatOuterShells = outerShells.flat(1);
  let flatOuterShells2 = outerShells2.flat(1);
  flatOuterShells = [...flatOuterShells, ...flatOuterShells2]
  flatOuterShells.forEach((p, i) => {
    flatOuterShells[i] = [p[0], Math.round(p[1] * 1) / 1];
  });
  flatOuterShells.sort((a, b) => a[1] - b[1]);

  if (showCircles) {
    outerShells.forEach((os) => {
      drawCurve(os, CLOSE);
    });
  }
  // pop()

  let lineSpacing = (height - (2 * verticalPadding)) / numberOfLines;
  let lineVertSpacing = (width - (2 * horizontalPadding)) / lineResolution;
  let roundedSpacing = Math.round(lineSpacing / 2);
  let lines = [];
  for (let i = 0; i < numberOfLines; i++) {
    let line = [];
    let curY = verticalPadding + (i * lineSpacing);
    let startPoint = [horizontalPadding, curY];
    let endPoint = [width - horizontalPadding, curY];
    line.push(startPoint);

    let roundedX = Math.round(startPoint[1]);
    let lookupArray = Array.from({ length: (roundedX + roundedSpacing) - (roundedX - roundedSpacing) + 1 }, (_, index) => index + (roundedX - roundedSpacing));
    let pointsOnThisLine = flatOuterShells.filter((p) => lookupArray.includes(p[1]));

    for (let j = 0; j < lineResolution; j++) {
      let curX = horizontalPadding + (j * lineVertSpacing);
      let score = calculateCombinedScore(curX, pointsOnThisLine)

      let newPoint = [curX, curY - (score * scoreScale)];
      line.push(newPoint);
    }

    line.push(endPoint);

    lines.push(line);
  }

  stroke("black");
  lines.forEach((l) => {
    drawLine(l);
  });
}

function calculateScore(cursorX, pointX) {
  // Calculate the distance between cursorX and pointX on the x-axis
  let distance = Math.abs(cursorX - pointX);
  let modulation = Math.sin((Math.PI / 2) * (distance / modDistance));

  // Assign a score based on the reciprocal of the distance
  // Add 1 to avoid division by zero and ensure non-zero scores
  // return Math.abs(1 / (distance + 1) * (modScale*modulation));
  return (1 / (distance + 1) * (modScale*modulation));
}

function calculateCombinedScore(cursorX, points) {
  let combinedScore = 0;

  points.forEach(point => {
    combinedScore += calculateScore(cursorX, point[0]); // Assuming point[0] represents the x-coordinate
  });

  // Normalize the combined score based on the number of nearby points
  // combinedScore /= points.length; // Adjust normalization factor as needed

  return combinedScore > 10 ? 10 : combinedScore;
}

function isPointInsideCircle(point, circle) {
  let distanceSquared = (point[0] - circle.point[0]) ** 2 + (point[1] - circle.point[1]) ** 2;
  return distanceSquared < ((circle.radius - 0.2) / 2) ** 2;
}

// Function to calculate the cross product of vectors p1p2 and p1p3
function crossProduct(p1, p2, p3) {
  return (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0]);
}

// Function to find the point with the lowest y-coordinate (and if tie, lowest x-coordinate)
function findLowestPoint(points) {
  let lowestPoint = points[0];
  for (let i = 1; i < points.length; i++) {
    if (points[i][1] < lowestPoint[1] || (points[i][1] === lowestPoint[1] && points[i][0] < lowestPoint[0])) {
      lowestPoint = points[i];
    }
  }
  return lowestPoint;
}

function nearestNeighbor(points) {
  const numPoints = points.length;
  let visited = new Array(numPoints).fill(false);
  let tour = [];
  let totalDistance = 0;

  // Start from the first point
  let currentPoint = points[0];
  visited[0] = true;
  tour.push(0);

  for (let i = 1; i < numPoints; i++) {
    let nearestIndex = -1;
    let minDistance = Infinity;

    // Find the nearest unvisited point
    for (let j = 0; j < numPoints; j++) {
      if (!visited[j]) {
        let dis = distance(currentPoint, points[j]);
        if (dis < minDistance) {
          minDistance = dis;
          nearestIndex = j;
        }
      }
    }

    // Mark the nearest point as visited and update the tour
    visited[nearestIndex] = true;
    tour.push(nearestIndex);
    totalDistance += minDistance;
    currentPoint = points[nearestIndex];
  }

  // Return to the starting point
  totalDistance += distance(currentPoint, points[0]);
  tour.push(0);

  return { tour: tour, totalDistance: totalDistance };
}
