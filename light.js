//light.js would set a dmx rgb fill light based on the current room color of the mqtt-client middleware's 
//token-connected character at mudroom.rip
//the topic will be called dmx/setconst mqtt = require('mqtt');
const mqtt = require('mqtt');
const DMX = require('dmx');

// Connect to Mosquitto Broker
const client = mqtt.connect('mqtt://localhost');

// Initialize DMX universe and device
const dmx = new DMX();
const universe = dmx.addUniverse('myUniverse', 'enttec-open-usb-dmx', '/dev/ttyUSB1');

// Subscribe to Mosquitto topic
client.on('connect', () => {
  client.subscribe('dmx/set');
});

// Handle messages received from Mosquitto topic
client.on('message', (topic, message) => {
  if (topic === 'dmx/set') {
    // Parse message to get hex color value
    const hexColor = message.toString();

    // Convert hex color value to RGB values
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Set DMX channels for RGB values
    universe.update({
      1: r,
      2: g,
      3: b
    });
  }
});