var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var horizontalLines = 15;
var horizontalLinesMin = 1;
var horizontalLinesMax = 100;
var horizontalLinesStep = 1;
var verticalLines = 10;
var verticalLinesMin = 1;
var verticalLinesMax = 100;
var verticalLinesStep = 1;
var lineDefinition = 70;
var lineDefinitionMin = 1;
var lineDefinitionMax = 100;
var lineDefinitionStep = 1;
var sinFrequency = 100;
var sinFrequencyMin = 1;
var sinFrequencyMax = 500;
var sinFrequencyStep = 1;
var sinFactor = 20;
var sinFactorMin = 1;
var sinFactorMax = 500;
var sinFactorStep = 1;
var smallBoxWidth = 10;
var smallBoxWidthMin = 1;
var smallBoxWidthMax = 20;
var smallBoxWidthStep = 1;
var gui;

function setup() {
  if (typeof SVG === 'undefined') {
    createCanvas(...a3Format);
  } else {
    createCanvas(...a3Format, SVG);
  }
  pixelDensity(1);
  gui = createGui('My awesome GUI');
  gui.addGlobals(
    'seed',
    'horizontalLines',
    'verticalLines',
    'lineDefinition',
    'sinFrequency',
    'sinFactor',
    'smallBoxWidth',
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

  let allLineDefVert = lineDefinition * verticalLines;
  let allLineDefHori = lineDefinition * horizontalLines;

  let vertLines = [];
  for (let i = 0; i <= verticalLines; i++) {
    for (let j = 0; j <= allLineDefHori; j++) {
      if (typeof vertLines[i] === "undefined") vertLines[i] = [];
      // vertLines[i][j] = [i * lineSpacing + Math.sin(j/sinFrequency)*sinFactor, j*lineItt];
      vertLines[i][j] = [i * lineDefinition + Math.sin(j/sinFrequency)*sinFactor, j];
      // vertLines[i][j] = [i * lineSpacing, j*lineItt];
    }
  }
  let horiSpacing = lineDefinition;
  let horiLines = [];
  for (let i = 0; i <= horizontalLines; i++) {
    // let vertPoint = i*boxPointsCount === 450 ? 449 : i*boxPointsCount;
    let vertPoint = i*horiSpacing;
    let vertStartPoint = vertLines[0][vertPoint][0];
    for (let j = 0; j <= allLineDefVert; j++) {
      if (typeof horiLines[i] === "undefined") horiLines[i] = [];
      horiLines[i][j] = [j + vertStartPoint , i * horiSpacing];
      // horiLines[i][j] = [j*lineItt , i * lineSpacing  + (Math.sin(j/sinFrequency) - 0.5)*sinFactor];
    }
  }

  let firstPoint = vertLines[0][0];
  let lastPoint = vertLines[vertLines.length -1 ][vertLines[vertLines.length -1].length -1 ];
  let shapeCenter = [
    (firstPoint[0] + lastPoint[0]) / 2,
    (firstPoint[1] + lastPoint[1]) / 2,
  ];
  let center = getPageCenter();
  let widthOffset = Math.round(center[0] - shapeCenter[0]);
  let heightOffset = Math.round(center[1] - shapeCenter[1]);
  vertLines.forEach((lines, i) => {
    lines.forEach((point, j) => {
      vertLines[i][j] = [point[0] + widthOffset, point[1] + heightOffset]
    })
  })
  horiLines.forEach((lines, i) => {
    lines.forEach((point, j) => {
      horiLines[i][j] = [point[0] + widthOffset, point[1] + heightOffset]
    })
  })

  // stroke(randomColorString(0.2));
  // noFill();
  // vertLines.forEach((line) => {
  //   drawLine(line);
  //   line.forEach((point, i) => {
  //     // if(i%lineDefinition === 0) circle(...point, 2)
  //   })
  // })
  // horiLines.forEach((line) => {
  //   drawLine(line);
  // })

  // stroke("black")
  // strokeWeight(0);

  let boxes = []
  let boxCount = -1;
  vertLines.forEach((vertLine, vertI) => {
    // if (vertI >= 3 ) return;
    if (vertI === vertLines.length -1 ) return;
    horiLines.forEach((horiLine, horiI) => {
      // if (horiI >= 2 ) return;
      if (horiI >= horiLines.length - 1) return;
      boxCount++;
      if (horiI % 2 !== 0 && vertI % 2 === 0) return;
      if (horiI % 2 === 0 && vertI % 2 !== 0) return;
      // if (boxPointsCount * boxCount > vertLine.length) return;
      let boxPoints = []
      let curBoxCount = boxCount % (verticalLines - 1);
      // console.log("curBoxCount",curBoxCount, vertI, horiI);
      // console.log("vertline 1", lineDefinition * horiI, lineDefinition * (horiI+1));
      for (let i = lineDefinition * horiI; i < lineDefinition * (horiI+1); i++) {
        boxPoints.push(vertLine[i]);
        // circle(...vertLine[i], 2)
      }
      // console.log("hori 1", vertI * lineDefinition, vertI * lineDefinition + lineDefinition);
      for (let i = vertI * lineDefinition; i < vertI * lineDefinition + lineDefinition ; i++) {
        boxPoints.push(horiLines[horiI+1][i]);
        // circle(...horiLines[horiI+1][i], 2)
      }
      // console.log("vert 2", lineDefinition * (horiI+1), lineDefinition * horiI);
      for (let i = lineDefinition * (horiI+1) ; i >= lineDefinition * horiI ; i--) {
        boxPoints.push(vertLines[vertI+1][i]);
        // circle(...vertLines[vertI+1][i], 2)
      }
      // console.log("hori 2", lineDefinition + vertI * lineDefinition, vertI * lineDefinition);
      for (let i = lineDefinition + vertI * lineDefinition; i > vertI * lineDefinition ; i--) {
        boxPoints.push(horiLine[i]);
        // circle(...horiLine[i], 2)
      }
      fill("black")

      boxes.push(boxPoints.filter(function(x) {
        return x !== undefined;
      }));
    })
  })

    boxes.forEach((box, i ) => {
      let secondLeftBox = []
      for (let j = 0; j <= lineDefinition; j++) {
        secondLeftBox.push([box[j][0] - smallBoxWidth, box[j][1]]);
      }
      for (let j = lineDefinition; j >= 0; j--) {
        secondLeftBox.push([box[j][0] - smallBoxWidth*2, box[j][1]]);
      }
      stroke("yellow")
      fill("yellow")
      drawLine(secondLeftBox, CLOSE);

      let firstLeftBox = []
      for (let j = 0; j <= lineDefinition; j++) {
        firstLeftBox.push(box[j]);
      }
      for (let j = lineDefinition; j >= 0; j--) {
        firstLeftBox.push([box[j][0] - smallBoxWidth, box[j][1]]);
      }
      stroke("red")
      fill("red")
      drawLine(firstLeftBox, CLOSE);

      let secondRightBox = []
      for (let j = lineDefinition*2; j <= lineDefinition*3; j++) {
        secondRightBox.push([box[j][0] + smallBoxWidth, box[j][1]]);
      }
      for (let j = lineDefinition*3; j >= lineDefinition*2; j--) {
        secondRightBox.push([box[j][0] + smallBoxWidth*2, box[j][1]]);
      }
      stroke("cyan")
      fill("cyan")
      drawLine(secondRightBox, CLOSE);

      let firstRightBox = []
      for (let j = lineDefinition*2; j <= lineDefinition*3; j++) {
        firstRightBox.push(box[j]);
      }
      for (let j = lineDefinition*3; j >= lineDefinition*2; j--) {
        firstRightBox.push([box[j][0] + smallBoxWidth, box[j][1]]);
      }
      stroke("blue")
      fill("blue")
      drawLine(firstRightBox, CLOSE);
    })

  boxes.forEach((box) => {
    stroke("black")
    fill("black")
    drawCurve(box, CLOSE);
  })
}
