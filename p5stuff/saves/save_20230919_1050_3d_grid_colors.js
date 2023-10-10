var seed = 0;
var seedMin = 0;
var seedMax = 1000;
var seedStep = 1;
var horizontalLines = 10;
var horizontalLinesMin = 1;
var horizontalLinesMax = 100;
var horizontalLinesStep = 1;
var verticalLines = 10;
var verticalLinesMin = 1;
var verticalLinesMax = 100;
var verticalLinesStep = 1;
var lineDefinition = 450;
var lineDefinitionMin = 1;
var lineDefinitionMax = 1000;
var lineDefinitionStep = 1;
var lineItt = 1;
var lineIttMin = 1;
var lineIttMax = 1000;
var lineIttStep = 1;
var lineSpacing = 50;
var lineSpacingMin = 1;
var lineSpacingMax = 100;
var lineSpacingStep = 1;
var boxPointsCount = 50;
var boxPointsCountMin = 1;
var boxPointsCountMax = 100;
var boxPointsCountStep = 1;
var sinFrequency = 100;
var sinFrequencyMin = 1;
var sinFrequencyMax = 200;
var sinFrequencyStep = 1;
var sinFactor = 20;
var sinFactorMin = 1;
var sinFactorMax = 200;
var sinFactorStep = 1;
var smallBoxWidth = 10;
var smallBoxWidthMin = 1;
var smallBoxWidthMax = 100;
var smallBoxWidthStep = 1;
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
    'horizontalLines',
    'verticalLines',
    'lineDefinition',
    'lineItt',
    'lineSpacing',
    'boxPointsCount',
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

  let vertLines = [];
  for (let i = 0; i < verticalLines; i++) {
    for (let j = 0; j < lineDefinition; j++) {
      if (typeof vertLines[i] === "undefined") vertLines[i] = [];
      // vertLines[i][j] = [i * lineSpacing + Math.sin(j/sinFrequency)*sinFactor, j*lineItt];
      vertLines[i][j] = [i * lineSpacing, j*lineItt];
    }
  }
  let horiLines = [];
  for (let i = 0; i < horizontalLines; i++) {
    // let vertPoint = i*boxPointsCount === 450 ? 449 : i*boxPointsCount;
    // let vertOffset = vertLines[0][vertPoint][0];
    for (let j = 0; j < lineDefinition; j++) {
      if (typeof horiLines[i] === "undefined") horiLines[i] = [];
      // horiLines[i][j] = [j*lineItt + vertOffset , i * lineSpacing];
      horiLines[i][j] = [j*lineItt , i * lineSpacing  + (Math.sin(j/sinFrequency) - 0.5)*sinFactor];
    }
  }

  let shapeCenter = [lineSpacing * (horizontalLines/2) - lineSpacing/2, lineSpacing *(verticalLines/2) -  lineSpacing/2]
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

  stroke(randomColorString(0.2));
  noFill();
  vertLines.forEach((line) => {
    drawLine(line);
    line.forEach((point, i) => {
      // if(i%boxPointsCount === 0) circle(...point, 2)
    })
  })
  horiLines.forEach((line) => {
    drawLine(line);
  })

  stroke("black")
  strokeWeight(0);

  let boxes = []
  let boxCount = -1;
  vertLines.forEach((vertLine, vertI) => {
    if (vertI === vertLines.length -1 ) return;
    horiLines.forEach((horiLine, horiI) => {
      if (horiI >= horiLines.length - 1) return;
      boxCount++;
      if (horiI % 2 !== 0 && vertI % 2 === 0) return;
      if (horiI % 2 === 0 && vertI % 2 !== 0) return;
      // if (boxPointsCount * boxCount > vertLine.length) return;
      let boxPoints = []
      let curBoxCount = boxCount % 9;
      for (let i = boxPointsCount * curBoxCount; i < boxPointsCount * (curBoxCount+1); i++) {
        boxPoints.push(vertLine[i]);
        // circle(...vertLine[i], 2)
      }
      for (let i = vertI * boxPointsCount; i < vertI * boxPointsCount + boxPointsCount ; i++) {
        boxPoints.push(horiLines[horiI+1][i]);
        // circle(...horiLines[horiI+1][i], 2)
      }
      // console.log("3",boxPointsCount, curBoxCount,boxPointsCount * (curBoxCount+1)  , boxPointsCount * curBoxCount);
      for (let i = boxPointsCount * (curBoxCount+1) ; i >= boxPointsCount * curBoxCount ; i--) {
        if (i === 450) continue;
        boxPoints.push(vertLines[vertI+1][i]);
        // circle(...vertLines[vertI+1][i], 2)
      }
      for (let i = boxPointsCount + vertI * boxPointsCount; i > vertI * boxPointsCount ; i--) {
        boxPoints.push(horiLine[i]);
        // circle(...horiLine[i], 2)
      }
      fill("black")

      boxes.push(boxPoints.filter(function(x) {
        return x !== undefined;
      }));
    })
  })

    // boxes.forEach((box, i ) => {
    //   let secondLeftBox = []
    //   for (let j = 0; j <= boxPointsCount; j++) {
    //     secondLeftBox.push([box[j][0] - smallBoxWidth, box[j][1]]);
    //   }
    //   for (let j = boxPointsCount; j >= 0; j--) {
    //     secondLeftBox.push([box[j][0] - smallBoxWidth*2, box[j][1]]);
    //   }
    //   stroke("yellow")
    //   fill("yellow")
    //   drawLine(secondLeftBox, CLOSE, TESS);
    //
    //   let firstLeftBox = []
    //   for (let j = 0; j <= boxPointsCount; j++) {
    //     firstLeftBox.push(box[j]);
    //   }
    //   for (let j = boxPointsCount; j >= 0; j--) {
    //     firstLeftBox.push([box[j][0] - smallBoxWidth, box[j][1]]);
    //   }
    //   stroke("red")
    //   fill("red")
    //   drawLine(firstLeftBox, CLOSE, TESS);
    //
    //   let secondRightBox = []
    //   for (let j = boxPointsCount*2; j <= boxPointsCount*3; j++) {
    //     secondRightBox.push([box[j][0] + smallBoxWidth, box[j][1]]);
    //   }
    //   for (let j = boxPointsCount*3; j >= boxPointsCount*2; j--) {
    //     secondRightBox.push([box[j][0] + smallBoxWidth*2, box[j][1]]);
    //   }
    //   stroke("cyan")
    //   fill("cyan")
    //   drawLine(secondRightBox, CLOSE, TESS);
    //
    //   let firstRightBox = []
    //   for (let j = boxPointsCount*2; j <= boxPointsCount*3; j++) {
    //     firstRightBox.push(box[j]);
    //   }
    //   for (let j = boxPointsCount*3; j >= boxPointsCount*2; j--) {
    //     firstRightBox.push([box[j][0] + smallBoxWidth, box[j][1]]);
    //   }
    //   stroke("blue")
    //   fill("blue")
    //   drawLine(firstRightBox, CLOSE, TESS);
    // })

  // boxes.forEach((box) => {
  //   stroke("black")
  //   fill("black")
  //   drawCurve(box, CLOSE);
  // })
}
