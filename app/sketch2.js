var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;

var numPoints = 15;
var numPointsMin = 10;
var numPointsMax = 200;
var numPointsStep = 1;

var showPoints = false;
var showStroke = true;
var fillCells = true;

var strokeWeightVar = 1;
var strokeWeightVarMin = 0.1;
var strokeWeightVarMax = 5;
var strokeWeightVarStep = 0.1;

var roundingRadius = 100;
var roundingRadiusMin = 0;
var roundingRadiusMax = 100;
var roundingRadiusStep = 1;

var pagePadding = 50;
var pagePaddingMin = 0;
var pagePaddingMax = 200;
var pagePaddingStep = 5;

var shrinkAmount = 0.2;
var shrinkAmountMin = 0;
var shrinkAmountMax = 1;
var shrinkAmountStep = 0.01;

var minAngle = 30;
var minAngleMin = 0;
var minAngleMax = 180;
var minAngleStep = 5;

var minVertexDistance = 10;
var minVertexDistanceMin = 0;
var minVertexDistanceMax = 50;
var minVertexDistanceStep = 2;

var gui;
var points = [];
var cells = [];

function setup() {
  if (typeof SVG === 'undefined') {
    createCanvas(...a4Format4);
  } else {
    createCanvas(...a4Format4, SVG);
  }
  pixelDensity(1);
  gui = createGui('Voronoi Pattern');
  let globals = [
    'seed',
    'numPoints',
    'showPoints',
    'showStroke',
    'fillCells',
    'roundingRadius',
    'pagePadding',
    'shrinkAmount',
    'minVertexDistance',
    'minAngle',
  ]
  gui.addGlobals(...globals);
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
  noiseSeed(seed);
  clear();
  background(255);

  // Generate random voronoi points within the padded area
  points = [];
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: random(pagePadding, width - pagePadding),
      y: random(pagePadding, height - pagePadding),
      color: color(random(100, 255), random(100, 255), random(100, 255))
    });
  }

  // Calculate voronoi cell vertices
  calculateVoronoiCells();

  // Draw rounded polygons for each cell
  drawRoundedCells();

  // Optionally draw the voronoi points
  if (showPoints) {
    fill(0);
    noStroke();
    for (let pt of points) {
      circle(pt.x, pt.y, 8);
    }
  }
}

function calculateVoronoiCells() {
  cells = [];

  // Use page padding as the boundary for voronoi calculation
  let bounds = {
    left: pagePadding,
    right: width - pagePadding,
    top: pagePadding,
    bottom: height - pagePadding
  };

  for (let i = 0; i < points.length; i++) {
    let vertices = [];

    // For each point, find vertices of its voronoi cell
    // by checking intersections of perpendicular bisectors
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;

      for (let k = j + 1; k < points.length; k++) {
        if (i === k) continue;

        // Find the circumcenter of the triangle formed by points i, j, k
        let vertex = getCircumcenter(points[i], points[j], points[k]);

        if (vertex && isClosestPoint(vertex, i) && isInsideBounds(vertex, bounds)) {
          vertices.push(vertex);
        }
      }
    }

    // Add edge intersections with inset boundaries
    vertices = vertices.concat(getEdgeIntersections(i, bounds));

    // Add inset corners if they belong to this cell
    let corners = [
      {x: bounds.left, y: bounds.top},
      {x: bounds.right, y: bounds.top},
      {x: bounds.right, y: bounds.bottom},
      {x: bounds.left, y: bounds.bottom}
    ];

    for (let corner of corners) {
      if (isClosestPoint(corner, i)) {
        vertices.push(corner);
      }
    }

    // Sort vertices by angle from center point
    vertices = sortVerticesByAngle(vertices, points[i]);

    // Remove duplicates
    vertices = removeDuplicates(vertices);

    // For edge cells, add interpolated vertices along the boundary
    vertices = addBoundaryVertices(vertices, points[i], bounds);

    // First pass: merge vertices that are too close together
    vertices = simplifyByDistance(vertices);

    // Second pass: adjust vertices that create sharp angles
    vertices = smoothSharpAngles(vertices, points[i]);

    cells.push({
      center: points[i],
      vertices: vertices,
      color: points[i].color
    });
  }
}

function isInsideBounds(v, bounds) {
  return v.x >= bounds.left && v.x <= bounds.right &&
         v.y >= bounds.top && v.y <= bounds.bottom;
}

function simplifyByDistance(vertices) {
  if (minVertexDistance === 0 || vertices.length < 3) {
    return vertices;
  }

  let simplified = [];
  let i = 0;

  while (i < vertices.length) {
    let curr = vertices[i];
    let next = vertices[(i + 1) % vertices.length];
    let d = dist(curr.x, curr.y, next.x, next.y);

    // If points are too close, merge them by averaging
    if (d < minVertexDistance && simplified.length < vertices.length - 2) {
      // Average the two points
      let merged = {
        x: (curr.x + next.x) / 2,
        y: (curr.y + next.y) / 2
      };
      simplified.push(merged);
      i += 2; // Skip both points
    } else {
      simplified.push(curr);
      i++;
    }
  }

  // Ensure we have at least 3 vertices
  if (simplified.length < 3) {
    return vertices;
  }

  return simplified;
}

function smoothSharpAngles(vertices, center) {
  if (minAngle === 0 || vertices.length < 3) {
    return vertices;
  }

  let smoothed = [];
  let minAngleRad = radians(minAngle);

  for (let i = 0; i < vertices.length; i++) {
    let prev = vertices[(i - 1 + vertices.length) % vertices.length];
    let curr = vertices[i];
    let next = vertices[(i + 1) % vertices.length];

    // Calculate vectors from current point to neighbors
    let v1x = prev.x - curr.x;
    let v1y = prev.y - curr.y;
    let v2x = next.x - curr.x;
    let v2y = next.y - curr.y;

    // Normalize vectors
    let len1 = sqrt(v1x * v1x + v1y * v1y);
    let len2 = sqrt(v2x * v2x + v2y * v2y);

    if (len1 > 0.001 && len2 > 0.001) {
      v1x /= len1;
      v1y /= len1;
      v2x /= len2;
      v2y /= len2;

      // Calculate angle using dot product
      let dotProduct = v1x * v2x + v1y * v2y;
      dotProduct = constrain(dotProduct, -1, 1);
      let angle = acos(dotProduct);

      // If angle is too sharp, move the vertex inward toward the center
      if (angle < minAngleRad) {
        // Calculate how much to pull inward based on how sharp the angle is
        let sharpness = 1 - (angle / minAngleRad);
        let pullFactor = sharpness * 0.5; // Pull up to 50% toward center

        smoothed.push({
          x: curr.x + (center.x - curr.x) * pullFactor,
          y: curr.y + (center.y - curr.y) * pullFactor
        });
      } else {
        // Angle is fine, keep the vertex as-is
        smoothed.push(curr);
      }
    } else {
      // Keep very close points (edge case)
      smoothed.push(curr);
    }
  }

  return smoothed;
}

function addBoundaryVertices(vertices, center, bounds) {
  if (vertices.length < 2) return vertices;

  let newVertices = [];

  for (let i = 0; i < vertices.length; i++) {
    let v1 = vertices[i];
    let v2 = vertices[(i + 1) % vertices.length];

    newVertices.push(v1);

    // Check if both vertices are on edges
    let v1OnEdge = isOnBoundary(v1, bounds);
    let v2OnEdge = isOnBoundary(v2, bounds);

    if (v1OnEdge && v2OnEdge) {
      // Get the path along the boundary from v1 to v2
      let boundaryPath = getBoundaryPath(v1, v2, bounds);

      for (let p of boundaryPath) {
        newVertices.push(p);
      }
    }
  }

  return newVertices;
}

function isOnBoundary(v, bounds) {
  let tolerance = 1;
  return abs(v.x - bounds.left) < tolerance ||
         abs(v.x - bounds.right) < tolerance ||
         abs(v.y - bounds.top) < tolerance ||
         abs(v.y - bounds.bottom) < tolerance;
}

function getBoundaryPath(v1, v2, bounds) {
  let path = [];

  // Check if they're on the same straight edge
  let v1Edges = getEdges(v1, bounds);
  let v2Edges = getEdges(v2, bounds);

  // Find common edge
  let commonEdge = null;
  for (let e1 of v1Edges) {
    for (let e2 of v2Edges) {
      if (e1 === e2) {
        commonEdge = e1;
        break;
      }
    }
    if (commonEdge) break;
  }

  if (commonEdge) {
    // Same edge - interpolate directly
    let d = dist(v1.x, v1.y, v2.x, v2.y);
    let numInterpolations = max(2, floor(d / 20));

    for (let j = 1; j < numInterpolations; j++) {
      let t = j / numInterpolations;
      path.push({
        x: v1.x + (v2.x - v1.x) * t,
        y: v1.y + (v2.y - v1.y) * t
      });
    }
  } else {
    // Different edges - need to go around corners
    path = path.concat(getCornerPath(v1, v2, v1Edges, v2Edges, bounds));
  }

  return path;
}

function getEdges(v, bounds) {
  let tolerance = 1;
  let edges = [];

  if (abs(v.x - bounds.left) < tolerance) edges.push('left');
  if (abs(v.x - bounds.right) < tolerance) edges.push('right');
  if (abs(v.y - bounds.top) < tolerance) edges.push('top');
  if (abs(v.y - bounds.bottom) < tolerance) edges.push('bottom');

  return edges;
}

function getCornerPath(v1, v2, v1Edges, v2Edges, bounds) {
  let path = [];

  // Determine which corner(s) to traverse using inset bounds
  let corners = [
    {x: bounds.left, y: bounds.top, edges: ['left', 'top']},
    {x: bounds.right, y: bounds.top, edges: ['right', 'top']},
    {x: bounds.right, y: bounds.bottom, edges: ['right', 'bottom']},
    {x: bounds.left, y: bounds.bottom, edges: ['left', 'bottom']}
  ];

  // Find which corner connects v1's edge to v2's edge
  for (let corner of corners) {
    let hasV1Edge = v1Edges.some(e => corner.edges.includes(e));
    let hasV2Edge = v2Edges.some(e => corner.edges.includes(e));

    if (hasV1Edge && hasV2Edge) {
      // Add interpolated points from v1 to corner
      let d1 = dist(v1.x, v1.y, corner.x, corner.y);
      let steps1 = max(2, floor(d1 / 20));
      for (let j = 1; j < steps1; j++) {
        let t = j / steps1;
        path.push({
          x: v1.x + (corner.x - v1.x) * t,
          y: v1.y + (corner.y - v1.y) * t
        });
      }

      // Add the corner itself
      path.push({x: corner.x, y: corner.y});

      // Add interpolated points from corner to v2
      let d2 = dist(corner.x, corner.y, v2.x, v2.y);
      let steps2 = max(2, floor(d2 / 20));
      for (let j = 1; j < steps2; j++) {
        let t = j / steps2;
        path.push({
          x: corner.x + (v2.x - corner.x) * t,
          y: corner.y + (v2.y - corner.y) * t
        });
      }

      break;
    }
  }

  return path;
}

function drawRoundedCells() {
  for (let cell of cells) {
    if (cell.vertices.length < 3) continue;

    if (fillCells) {
      fill(cell.color);
    } else {
      noFill();
    }

    if (showStroke) {
      stroke(0);
      strokeWeight(strokeWeightVar);
    } else {
      noStroke();
    }

    // Apply shrinking to create gaps between shapes
    let adjustedVertices = [];
    for (let v of cell.vertices) {
      let dx = v.x - cell.center.x;
      let dy = v.y - cell.center.y;

      // Shrink vertices toward center to create gaps
      let factor = 1 - shrinkAmount;

      adjustedVertices.push({
        x: cell.center.x + dx * factor,
        y: cell.center.y + dy * factor
      });
    }

    // Draw rounded polygon
    beginShape();
    for (let i = 0; i < adjustedVertices.length; i++) {
      let v1 = adjustedVertices[i];
      let v2 = adjustedVertices[(i + 1) % adjustedVertices.length];
      let v0 = adjustedVertices[(i - 1 + adjustedVertices.length) % adjustedVertices.length];

      // Calculate the rounding
      let d1 = dist(v1.x, v1.y, v0.x, v0.y);
      let d2 = dist(v1.x, v1.y, v2.x, v2.y);
      let radius = min(roundingRadius, d1 / 2, d2 / 2);

      if (radius > 0 && i === 0) {
        // Start with the rounded corner
        let angle1 = atan2(v0.y - v1.y, v0.x - v1.x);
        let px = v1.x + cos(angle1) * radius;
        let py = v1.y + sin(angle1) * radius;
        vertex(px, py);
      }

      if (radius > 0) {
        // Point before corner
        let angle1 = atan2(v0.y - v1.y, v0.x - v1.x);
        let px1 = v1.x + cos(angle1) * radius;
        let py1 = v1.y + sin(angle1) * radius;

        // Point after corner
        let angle2 = atan2(v2.y - v1.y, v2.x - v1.x);
        let px2 = v1.x + cos(angle2) * radius;
        let py2 = v1.y + sin(angle2) * radius;

        vertex(px1, py1);
        quadraticVertex(v1.x, v1.y, px2, py2);
      } else {
        vertex(v1.x, v1.y);
      }
    }
    endShape(CLOSE);
  }
}

function getCircumcenter(p1, p2, p3) {
  let d = 2 * (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y));
  if (abs(d) < 0.0001) return null;

  let x = ((p1.x * p1.x + p1.y * p1.y) * (p2.y - p3.y) +
           (p2.x * p2.x + p2.y * p2.y) * (p3.y - p1.y) +
           (p3.x * p3.x + p3.y * p3.y) * (p1.y - p2.y)) / d;

  let y = ((p1.x * p1.x + p1.y * p1.y) * (p3.x - p2.x) +
           (p2.x * p2.x + p2.y * p2.y) * (p1.x - p3.x) +
           (p3.x * p3.x + p3.y * p3.y) * (p2.x - p1.x)) / d;

  return {x: x, y: y};
}

function isClosestPoint(vertex, pointIndex) {
  let minDist = dist(vertex.x, vertex.y, points[pointIndex].x, points[pointIndex].y);

  for (let i = 0; i < points.length; i++) {
    if (i === pointIndex) continue;
    let d = dist(vertex.x, vertex.y, points[i].x, points[i].y);
    if (d < minDist - 0.01) return false;
  }

  return true;
}

function getEdgeIntersections(pointIndex, bounds) {
  let intersections = [];
  let p = points[pointIndex];

  for (let i = 0; i < points.length; i++) {
    if (i === pointIndex) continue;

    // Find intersections of perpendicular bisector with inset boundary edges
    let other = points[i];
    let mx = (p.x + other.x) / 2;
    let my = (p.y + other.y) / 2;

    let dx = other.x - p.x;
    let dy = other.y - p.y;

    // Perpendicular direction
    let px = -dy;
    let py = dx;

    // Check intersection with each inset edge
    let edges = [
      [{x: bounds.left, y: bounds.top}, {x: bounds.right, y: bounds.top}],
      [{x: bounds.right, y: bounds.top}, {x: bounds.right, y: bounds.bottom}],
      [{x: bounds.right, y: bounds.bottom}, {x: bounds.left, y: bounds.bottom}],
      [{x: bounds.left, y: bounds.bottom}, {x: bounds.left, y: bounds.top}]
    ];

    for (let edge of edges) {
      let intersection = lineIntersection(
        mx, my, mx + px, my + py,
        edge[0].x, edge[0].y, edge[1].x, edge[1].y
      );

      if (intersection && isClosestPoint(intersection, pointIndex)) {
        intersections.push(intersection);
      }
    }
  }

  return intersections;
}

function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  let denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (abs(denom) < 0.0001) return null;

  let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  if (u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    };
  }

  return null;
}

function sortVerticesByAngle(vertices, center) {
  return vertices.sort((a, b) => {
    let angleA = atan2(a.y - center.y, a.x - center.x);
    let angleB = atan2(b.y - center.y, b.x - center.x);
    return angleA - angleB;
  });
}

function removeDuplicates(vertices) {
  let unique = [];
  for (let v of vertices) {
    let isDuplicate = false;
    for (let u of unique) {
      if (dist(v.x, v.y, u.x, u.y) < 1) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      unique.push(v);
    }
  }
  return unique;
}
