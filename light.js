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
client.on('message', (topic, message) => {
  const hexColor = message.toString().trim();
  console.log('Received message:', hexColor);
  if (!/^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/g.test(hexColor)) {
    console.error(`Invalid color value in message: ${hexColor}`);
    return;
  }

  const red = parseInt(hexColor.slice(1, 3), 16);
  const green = parseInt(hexColor.slice(3, 5), 16);
  const blue = parseInt(hexColor.slice(5, 7), 16);

  console.log(`Received message: ${hexColor}`);
  console.log(`Setting DMX value to: ${red}, ${green}, ${blue}`);

  universe.update(1, [red, green, blue]);
});