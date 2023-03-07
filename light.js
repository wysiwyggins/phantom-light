const mqtt = require('mqtt');
const DMX = require('dmx');
const dmx = new DMX();
const universe = dmx.addUniverse('demo', 'enttec-usb-dmx-pro', '/dev/ttyUSB1');
const client = mqtt.connect('mqtt://localhost');

client.on('connect', function () {
  console.log('Connected to MQTT broker');
  client.subscribe('dmx/set');
});

client.on('message', function (topic, message) {
  console.log('Received message: ' + message);

  // Remove any extra quotation marks from the message
  message = message.toString().replace(/"/g, '');

  // Convert the hex color to RGB
  const hexColor = message.slice(1);
  if (hexColor.length !== 6 || isNaN(parseInt(hexColor, 16))) {
    console.log('Invalid color value in message: "' + message + '"');
    return;
  }
  const red = parseInt(hexColor.slice(0, 2), 16);
  const green = parseInt(hexColor.slice(2, 4), 16);
  const blue = parseInt(hexColor.slice(4, 6), 16);
  console.log('Converted to:', red.toString(), green.toString(), blue.toString());
  // Set the DMX value for the RGB light
  universe.update({ 2: red, 3: green, 4: blue });
  //universe.update({ 8: 255 });
  universe.update({1: 255, 2: 128, 3: 128, 4: 0, 5: 0,6:0,7:0,8:0});
});
