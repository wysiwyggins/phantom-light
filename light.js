//light.js would set a dmx rgb fill light based on the current room color of the mqtt-client middleware's 
//token-connected character at mudroom.rip
//the topic will be called dmx/setconst mqtt = require('mqtt');

const mqtt = require('mqtt');
const DMX = require('dmx');
const dmx = new DMX();
const universe = dmx.addUniverse('default', 'enttec-open-usb-dmx', '/dev/ttyUSB1');

const client  = mqtt.connect('mqtt://localhost');
client.on('connect', function () {
  client.subscribe('dmx/set', function (err) {
    if (err) {
      console.log('Error subscribing to MQTT topic:', err);
    } else {
      console.log('Subscribed to MQTT topic: dmx/set');
    }
  })
})


client.on('message', function (topic, message) {
  if (topic === 'dmx/set') {
    const hexColor = message.toString().replace(/#/g, '');
    console.log('Received message:', hexColor);

    // Convert hex color to RGB
    const red = parseInt(hexColor.slice(0, 1), 16);
    const green = parseInt(hexColor.slice(1, 3), 16);
    const blue = parseInt(hexColor.slice(3, 5), 16);
    console.log('Converted to:', red.toString(), green.toString(), blue.toString());
    // Set DMX values for RGB fill light
    universe.update({1: red, 2: green, 3: blue}, function (err) {
      if (err) {
        console.log('Error setting DMX values:', err);
      } else {
        console.log('DMX values updated:', {red, green, blue});
      }
    });
  }
});


