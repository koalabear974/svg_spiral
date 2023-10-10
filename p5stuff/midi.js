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
  canCall = false;
  setTimeout(function () {
    canCall = true;
  }, 100);
  let curVar = window.midiMap[midiMessage.data[1] - 1];
  let curVal = midiMessage.data[2];
  let min = window[curVar + "Min"];
  let max = window[curVar + "Max"];
  let step = window[curVar + "Step"];
  let targetVal = map(curVal, 0, 127, min, max);
  if (step % 1 === 0) targetVal = Math.round(targetVal);
  console.log(curVar, curVal, min, max, targetVal);
  window[curVar] = targetVal;
  redraw();
}

function loadMIDIMapping(mappings) {
  window.midiMap = mappings;
}
