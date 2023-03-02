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
  const hexColor = message.toString();
  if (hexColor[0] === '#') {
    hexColor = hexColor.slice(1);
  }
  if (!/^[0-9A-F]{6}$/i.test(hexColor)) {
    console.error(`Invalid color value in message: ${message}`);
    return;
  }

  const red = parseInt(hexColor.slice(0, 2), 16);
  const green = parseInt(hexColor.slice(2, 4), 16);
  const blue = parseInt(hexColor.slice(4, 6), 16);

  if (isNaN(red) || isNaN(green) || isNaN(blue)) {
    console.error(`Invalid color value in message: ${message}`);
    return;
  }

  universe.update({ 1: red, 2: green, 3: blue });
});