const dgram = require('dgram');           // For UDP
const udpServer = dgram.createSocket('udp4');
const osc = require('osc'); // OSC decoder
const express = require('express');
const path = require('path');             // For serving index.html
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve index.html and static assets
app.use(express.static(path.join(__dirname, '')));

// Optional: Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '', 'index.html'));
});


app.get('/2', (req, res) => {
  res.sendFile(path.join(__dirname, '', 'index.html'));
});

// Set up OSC UDP listener
const udpPort = new osc.UDPPort({
  localAddress: "127.0.0.1",
  localPort: 12346,
  metadata: true
});

udpPort.on("message", function (oscMsg, timeTag, info) {
  console.log("OSC message from TD:", oscMsg);
  io.emit('fromTD', oscMsg); // Forward parsed OSC to p5.js
});

udpPort.open();

udpServer.bind(12345); // Match this port with TD UDP Out

// Start web + socket.io server
http.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
