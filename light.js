//light.js would set a dmx rgb fill light based on the current room color of the mqtt-client middleware's 
//token-connected character at mudroom.rip
//the topic will be called dmx/setconst mqtt = require('mqtt');
const mqtt = require('mqtt');
const DMX = require('dmx');
const dmx = new DMX();
const universe = dmx.addUniverse('default', 'enttec-open-usb-dmx', '/dev/ttyUSB1');

const client = mqtt.connect('mqtt://localhost');
client.on('connect', function () {
  client.subscribe('dmx/set');
});

client.on('message', function (topic, message) {
  console.log('Received message:', message.toString());
  let color = message.toString().substring(1); // Remove the # character
  let red = parseInt(color.substring(0, 2), 16);
  let green = parseInt(color.substring(2, 4), 16);
  let blue = parseInt(color.substring(4, 6), 16);

  if (isNaN(red) || isNaN(green) || isNaN(blue)) {
    console.error('Invalid color value in message:', message.toString());
    return;
  }

  console.log('RGB values:', red, green, blue);
  universe.update({ 1: red, 2: green, 3: blue });
});