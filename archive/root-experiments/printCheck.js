window.stopCheck = true;
window.stopCheck = false;
window.checkingLog = false;
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
