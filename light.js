//light.js would set a dmx rgb fill light based on the current room color of the mqtt-client middleware's 
//token-connected character at mudroom.rip
//the topic will be called dmx/setconst mqtt = require('mqtt');
const mqtt = require('mqtt');
const DMX = require('dmx');
const dmx = new DMX();
const universe = dmx.addUniverse('default', 'enttec-open-usb-dmx', '/dev/ttyUSB1');


const client = mqtt.connect('mqtt://localhost');
client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe('dmx/set');
});

client.on('message', (topic, message) => {
  console.log('Received message:', message.toString());

  const hex = message.toString().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    console.error(`Invalid color value in message: "${message.toString()}"`);
    return;
  }

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  
  console.log(`RGB values: red=${red}, green=${green}, blue=${blue}`);

  universe.update(1, { r: red, g: green, b: blue });
});