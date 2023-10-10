window.stopCheck = true;
window.stopCheck = false;
window.checkingLog = false;
window.xSave = false;
window.ySave = false;
window.zSave = false;
function checkButton() {
  const isDisabled = !!document.getElementsByClassName('btn-secondary')[0].attributes?.disabled;
  const isResume = document.getElementsByClassName('btn-secondary')[0].innerHTML.includes('Resume')
  if (!window.checkingLog) {
    console.log("Button state: " + (isDisabled ? 'Disabled' : 'Available'));
    window.checkingLog = true;
  }
  if (!isDisabled && isResume) {
    console.log("CLICK !");
    document.getElementsByClassName('btn-secondary')[0].click();
    window.checkingLog = false;
  }
  if (window.stopCheck) console.log("Stop Checking.");
  !window.stopCheck && setTimeout(checkButton, 500);
}
checkButton();


// --------------------------------------
window.stopCheck = true;
window.stopCheck = false;
window.checkingLog = false;
function checkButton() {
  let curState = document.getElementsByClassName("widgets-Visualizer-index__controller-state--joHU3")[0].innerHTML;
  let isHold = curState === 'Hold';
  if (!window.checkingLog) {
    console.info("Button state: " + curState);
    window.checkingLog = true;
  }
  if (isHold) {
    console.info("CLICK !");
    document.querySelector('button[title="Cycle Start"]').click();
    window.checkingLog = false;
  }
  if (window.stopCheck) console.log("Stop Checking.");
  !window.stopCheck && setTimeout(checkButton, 100);
}
checkButton();
