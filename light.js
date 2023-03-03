//light.js would set a dmx rgb fill light based on the current room color of the mqtt-client middleware's 
//token-connected character at mudroom.rip
//the topic will be called dmx/set
const mqtt = require('mqtt');
const DMX = require('dmx');
const dmx = new DMX();
const universe = dmx.addUniverse('default', 'enttec-open-usb-dmx', '/dev/ttyUSB1');

client.on('connect', function () {
  console.log('Connected to MQTT broker');
  client.subscribe('dmx/set');
});

client.on('message', function (topic, message) {
  console.log('Received message: ' + message.toString());
  const hexColor = message.toString().substring(1); // remove the "#" character
  const red = parseInt(hexColor.substring(0, 2), 16);
  const green = parseInt(hexColor.substring(2, 4), 16);
  const blue = parseInt(hexColor.substring(4, 6), 16);

  if (isNaN(red) || isNaN(green) || isNaN(blue)) {
    console.error(`Invalid color value in message: "${message.toString()}"`);
    return;
  }

  console.log(`Converted RGB values: red=${red}, green=${green}, blue=${blue}`);
  universe.updateAll([red, green, blue]);
});