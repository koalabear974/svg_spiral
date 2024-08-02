navigator.requestMIDIAccess()
  .then(onMIDISuccess, onMIDIFailure);


function onMIDIFailure() {
  console.log('Could not access your MIDI devices.');
}

function onMIDISuccess(midiAccess) {
  for (var input of midiAccess.inputs.values()) {
    input.onmidimessage = getMIDIMessage;
  }
}

window.canCall = true;

function getMIDIMessage(midiMessage) {
  if (!window.canCall)
    return;
  window.canCall = false;
  let longDelayedKeys = [36,37,40];
  let shortDelayedKeys = [38,39];
  let padId = midiMessage.data[1];
  let padValue = midiMessage.data[2];
  let timeout = longDelayedKeys.includes(padId) ? 500 : 10;
  if( timeout === 10 ) timeout = shortDelayedKeys.includes(padId) ? 200 : 10;

  setTimeout(function () {
    window.canCall = true;
  }, timeout);

  if (window.animateDesgin) {
    clearTimeout(window.animateDesginTimer);
    window.isAnimatingDesign = false;
    window.animateDesginTimer = setTimeout(() => {
      window.isAnimatingDesign = true;
      window.startDesignAnimation()
    }, window.animateDesignTimerTime)
  }

  // Scroll through designs
  if (padId === 37) {
    window.currentDesign = window.currentDesign + 1;
    if (window.currentDesign >= window.availableDesigns.length) window.currentDesign = 0;
    window.loadCurrentDesign();
    return;
  }
  if (padId === 36) {
    window.currentDesign = window.currentDesign - 1;
    if (window.currentDesign < 0) window.currentDesign = window.availableDesigns.length - 1;
    window.loadCurrentDesign();
    return;
  }

  // Save button
  if (padId === 40) {
    document.getElementById("canvasOverlay").classList.remove("saving");
    document.getElementById("canvasOverlay").classList.remove("saved");
    document.getElementById("canvasOverlay").classList.add("saving");
    setTimeout(() => {
      document.getElementById("canvasOverlay").classList.add("saved");
    }, 500)
    keyPressed({keyCode: 83 });
    return;
  }

  // Seed button
  if (padId === 38) {
    window["seed"] = Number(window["seed"]) + 1 ;
    redraw();
    return;
  }
  if (padId === 39) {
    window["seed"] = Number(window["seed"]) - 1 ;
    redraw();
    return;
  }

  let curVar = window.midiMap[padId -1];
  if (curVar === undefined) return;

  let curVal = padValue;
  let min = window[curVar + "Min"];
  let max = window[curVar + "Max"];
  let step = window[curVar + "Step"];
  let targetVal = map(curVal, 0, 127, min, max);
  if (step % 1 === 0) targetVal = Math.round(targetVal);
  window[curVar] = targetVal;
  redraw();
}

function loadMIDIMapping(mappings) {
  window.midiMap = mappings;
}
