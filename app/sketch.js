// Two Motif Composer
// Place two imported motifs on canvas with position, color, and overlap blend controls.

var cellSize = 8;
var cellSizeMin = 2; var cellSizeMax = 40; var cellSizeStep = 1;

var useCross = false;
var crossWeight = 3;
var crossWeightMin = 0.3; var crossWeightMax = 6; var crossWeightStep = 0.1;

var overlapMode = 'full'; // 'full', 'mix', 'half'

var showMotifA = true;
var motifAName = '';
var motifAX = 300; var motifAXMin = 0; var motifAXMax = 1122; var motifAXStep = 1;
var motifAY = 600; var motifAYMin = 0; var motifAYMax = 1587; var motifAYStep = 1;
var motifAColor1 = '#ed1c25';
var motifAColor2 = '#020202';

var showMotifB = true;
var motifBName = '';
var motifBX = 800; var motifBXMin = 0; var motifBXMax = 1122; var motifBXStep = 1;
var motifBY = 1000; var motifBYMin = 0; var motifBYMax = 1587; var motifBYStep = 1;
var motifBColor1 = '#1c5aed';
var motifBColor2 = '#0a0a8c';

var guiA, guiB, guiCanvas;

function setup() {
  if (typeof SVG === 'undefined') {
    createCanvas(...a3Format);
  } else {
    createCanvas(...a3Format, SVG);
  }
  pixelDensity(1);

  var names = (window.IMPORTED_MOTIFS || []).map(function(m) { return m.name; });
  if (names.length === 0) names = ['(no motifs)'];
  motifAName = names[0];
  motifBName = names[Math.min(1, names.length - 1)];

  guiA = createGui('Motif A');
  guiA.addGlobals('showMotifA');
  guiA.prototype.addDropDown('motif', names, function(v) {
    motifAName = v.value; redraw();
  });
  guiA.prototype.addColor('color 1', motifAColor1, function(v) {
    motifAColor1 = v; redraw();
  });
  guiA.prototype.addColor('color 2', motifAColor2, function(v) {
    motifAColor2 = v; redraw();
  });
  guiA.addGlobals('motifAX', 'motifAY');
  guiA.setPosition(10, 10);

  guiB = createGui('Motif B');
  guiB.addGlobals('showMotifB');
  guiB.prototype.addDropDown('motif', names, function(v) {
    motifBName = v.value; redraw();
  });
  guiB.prototype.addColor('color 1', motifBColor1, function(v) {
    motifBColor1 = v; redraw();
  });
  guiB.prototype.addColor('color 2', motifBColor2, function(v) {
    motifBColor2 = v; redraw();
  });
  guiB.addGlobals('motifBX', 'motifBY');
  guiB.setPosition(240, 10);

  guiCanvas = createGui('Canvas');
  guiCanvas.prototype.addDropDown('overlap', ['full', 'mix', 'half'], function(v) {
    overlapMode = v.value; redraw();
  });
  guiCanvas.addGlobals('cellSize', 'useCross', 'crossWeight');
  guiCanvas.setPosition(470, 10);

  noLoop();
}

function keyPressed() {
  if (keyCode === 32) redraw();
  if (keyCode === 83) {
    const d = new Date();
    save('art_' + d.toISOString().split('.')[0].replaceAll(':', '-') + '.svg');
  }
}

function draw() {
  clear();
  background(243, 238, 225);

  var all = window.IMPORTED_MOTIFS || [];
  var mA = all.find(function(m) { return m.name === motifAName; });
  var mB = all.find(function(m) { return m.name === motifBName; });

  var pixelsA = (mA && showMotifA) ? getMotifPixels(mA, motifAX, motifAY, motifAColor1, motifAColor2) : new Map();
  var pixelsB = (mB && showMotifB) ? getMotifPixels(mB, motifBX, motifBY, motifBColor1, motifBColor2) : new Map();

  if (overlapMode === 'full') {
    pixelsA.forEach(function(hex, key) {
      var p = splitKey(key); drawCell(p[0], p[1], hex, 'full');
    });
    pixelsB.forEach(function(hex, key) {
      var p = splitKey(key); drawCell(p[0], p[1], hex, 'full');
    });
  } else if (overlapMode === 'mix') {
    pixelsA.forEach(function(hex, key) {
      var p = splitKey(key);
      drawCell(p[0], p[1], hex, pixelsB.has(key) ? 'left' : 'full');
    });
    pixelsB.forEach(function(hex, key) {
      var p = splitKey(key);
      drawCell(p[0], p[1], hex, pixelsA.has(key) ? 'right' : 'full');
    });
  } else if (overlapMode === 'half') {
    pixelsA.forEach(function(hex, key) {
      var p = splitKey(key); drawCell(p[0], p[1], hex, 'left');
    });
    pixelsB.forEach(function(hex, key) {
      var p = splitKey(key); drawCell(p[0], p[1], hex, 'right');
    });
  }
}

// Returns a Map from "px,py" canvas coord → hex color for all non-zero cells
function getMotifPixels(motif, cx, cy, color1, color2) {
  var map = new Map();
  var hw = floor(motif.stitchWidth / 2);
  var hh = floor(motif.stitchHeight / 2);
  var snappedX = floor(cx / cellSize) * cellSize;
  var snappedY = floor(cy / cellSize) * cellSize;
  for (var gr = 0; gr < motif.stitchHeight; gr++) {
    for (var gc = 0; gc < motif.stitchWidth; gc++) {
      var cid = motif.grid[gr][gc];
      if (cid === 0) continue;
      var hex;
      if (cid === 1) {
        hex = color1;
      } else if (cid === 2) {
        hex = color2;
      } else {
        var cd = motif.colors.find(function(c) { return c.colorId === cid; });
        hex = cd ? cd.hexValue : '#000000';
      }
      var px = snappedX + (gc - hw) * cellSize;
      var py = snappedY + (gr - hh) * cellSize;
      map.set(px + ',' + py, hex);
    }
  }
  return map;
}

function splitKey(key) {
  var i = key.indexOf(',');
  return [parseInt(key.slice(0, i)), parseInt(key.slice(i + 1))];
}

// style: 'full' | 'left' (backslash / left-half) | 'right' (fwd-slash / right-half)
function drawCell(px, py, hex, style) {
  if (useCross) {
    noFill(); stroke(hex); strokeWeight(crossWeight);
    var m = cellSize * 0.18;
    var x1 = px + m, y1 = py + m;
    var x2 = px + cellSize - m, y2 = py + cellSize - m;
    if (style === 'full' || style === 'left')  line(x1, y1, x2, y2); // backslash
    if (style === 'full' || style === 'right') line(x2, y1, x1, y2); // fwd-slash
  } else {
    noStroke(); fill(hex);
    if (style === 'full')  rect(px, py, cellSize, cellSize);
    if (style === 'left')  rect(px, py, cellSize / 2, cellSize);
    if (style === 'right') rect(px + cellSize / 2, py, cellSize / 2, cellSize);
  }
}
