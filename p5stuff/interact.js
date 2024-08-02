window.availableDesigns = [
  "interactScripts/perlinSpiral.js",
  "interactScripts/perlinPlane.js",
  "interactScripts/voronoiPlane.js",
  "interactScripts/pointCylender.js",
  "interactScripts/worm.js"
];
window.currentDesign = window.availableDesigns.length - 1;

function keyPressed(input) {
  console.log("keyCode : ", keyCode);
  console.log("input.keyCode : ", input.keyCode);
  if (keyCode === 32) {
    if(redraw !== undefined) redraw();
  }
  if (keyCode === 83 || input.keyCode === 83) {
    const d = new Date();
    let fileName = 'interact_art_' + d.toISOString().split('.')[0].replaceAll(':', '-');
    save(fileName+".svg");
  }
}

function loadJs(filename) {
  // Get the existing script element
  var oldScript = document.getElementById('designScript');
  // Create a new script element
  var newScript = document.createElement('script');
  newScript.id = "designScript";
  newScript.src = filename;

  newScript.onload = () => {
    loadMidiSetting();
    if(redraw) redraw();
  }
  if (!oldScript) {
    document.body.appendChild(newScript);
    return;
  }

  // Replace the old script with the new one
  oldScript.parentNode.replaceChild(newScript, oldScript);
}

function loadCurrentDesign() {
  loadJs(window.availableDesigns[window.currentDesign]);
}
window.loadCurrentDesign = loadCurrentDesign;

window.animationParams = [
  [
    'pointNumber',
    'noiseAmplitude'
  ],
  [
    'noiseAmplitude',
    'size'
  ],
  [
    'wrinkles',
    'frequency',
    'waveSize'
  ],
  [
    'circleWidth',
    'circleHeight',
    'pointCount',
    'lineLength',
    'noiseFactor',
    'noiseStrengh'
  ],
  [
    'bezierSteps',
    'coilXFactor',
    'coilYFactor',
  ],
]
function startDesignAnimation(param = null) {
  if(window.isAnimatingDesign) {
    let curParam = !param ? window.animationParams[window.currentDesign][0] : param;

    let curVal = window[curParam];
    let min = window[curParam + "Min"];
    let max = window[curParam + "Max"];
    let step = window[curParam + "Step"];
    if (curVal < max) {
      window[curParam] = curVal + step;
    } else {
      console.log(window.animationParams[window.currentDesign].findIndex((p) => p === curParam));
      let curParamId = window.animationParams[window.currentDesign].findIndex((p) => p === curParam);
      if (window.animationParams[window.currentDesign][curParamId + 1]) {
        curParam = window.animationParams[window.currentDesign][curParamId + 1];
      } else {
        getMIDIMessage({data: [null, 37]})
        window[curParam] = window[curParam] + 1;
      }
    }

    redraw();
    setTimeout(() => {
      startDesignAnimation(curParam);
    }, 100)
  }
}
window.startDesignAnimation = startDesignAnimation;

window.animateDesgin = true;
window.animateDesignTimerTime = 10000;
loadCurrentDesign();
//
setTimeout(() => {
  window.isAnimatingDesign = true;
  startDesignAnimation()
}, 10000)


//vpypecrop6 filename 8
