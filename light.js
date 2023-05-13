const mqtt = require('mqtt');
const DMX = require('dmx');
const dmx = new DMX();
const universe = dmx.addUniverse('demo', 'enttec-usb-dmx-pro', '/dev/ttyUSB1');
const client = mqtt.connect('mqtt://localhost');

client.on('connect', function () {
  console.log('Connected to MQTT broker');
  client.subscribe('dmx/set');
  client.subscribe('kneels/set'); // Subscribe to the kneels/set channel
});

client.on('message', function (topic, message) {
  console.log('Received message: ' + message);

  if (topic === 'dmx/set') {
    // Remove any extra quotation marks from the message
    message = message.toString().replace(/"/g, '');

    // Convert the hex color to RGB
    const hexColor = message.slice(1);
    if (hexColor.length !== 6 || isNaN(parseInt(hexColor, 16))) {
      console.log('Invalid color value in message: "' + message + '"');
      return;
    }
    let red = parseInt(hexColor.slice(0, 2), 16);
    let green = parseInt(hexColor.slice(2, 4), 16);
    let blue = parseInt(hexColor.slice(4, 6), 16);
    console.log('Converted to:', red.toString(), green.toString(), blue.toString());
    // Set the DMX value for the RGB light
    universe.update({1: 255, 2: red, 3: green, 4: blue});
  } else if (topic === 'kneels/set') {
    // Dim the lights by half
    while (message = 1) {
      dimLightsByHalf();
    } 
  }
});

function dimLightsByHalf() {
  const currentRed = universe.get(2);
  const currentGreen = universe.get(3);
  const currentBlue = universe.get(4);

  const dimmedRed = Math.floor(currentRed / 2);
  const dimmedGreen = Math.floor(currentGreen / 2);
  const dimmedBlue = Math.floor(currentBlue / 2);

  universe.update({1: 255, 2: dimmedRed, 3: dimmedGreen, 4: dimmedBlue});

  // Revert the light intensity back to normal after 3 seconds (3000 ms)
  setTimeout(() => {
    universe.update({1: 255, 2: currentRed, 3: currentGreen, 4: currentBlue});
  }, 3000);
}
