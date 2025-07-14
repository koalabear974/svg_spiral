var number = 120;


var oscPort = new osc.WebSocketPort({
    url: "ws://localhost:8080", // URL to your Web Socket server.
    metadata: true
});


oscPort.open();



// LISTENING:

oscPort.on("message", function (oscMsg) {
    console.log("An OSC message just arrived!", oscMsg);
});



  
  // var message = new osc.Message('/pose/' + 1);
  
  // message.add (keypoint.part);
  //         message.add (x);
  //         message.add (y);
  //         osc.send (message);
  
  

// SENDING BUNDLES:

