//light.js would set a dmx rgb fill light based on the current room color of the mqtt-client middleware's 
//token-connected character at mudroom.rip
//the topic will be called dmx/set

const opendmx = require('opendmx');
const mqtt = require('mqtt');

// DMX configuration
const universe = 0;
const channels = 3;

// MQTT configuration
const brokerUrl = 'mqtt://localhost:1883';
const topic = 'dmx/set';

// Connect to the DMX light
opendmx.init('/dev/ttyUSB0', universe);

// Connect to the MQTT broker
const client = mqtt.connect(brokerUrl);

// Subscribe to the topic
client.on('connect', () => {
  console.log(`Connected to MQTT broker at ${brokerUrl}`);
  client.subscribe(topic, (err) => {
    if (err) {
      console.error(`Error subscribing to topic ${topic}: ${err}`);
    } else {
      console.log(`Subscribed to topic ${topic}`);
    }
  });
});

// Handle incoming messages
client.on('message', (topic, message) => {
  const payload = JSON.parse(message.toString());
  if (Array.isArray(payload) && payload.length === channels) {
    opendmx.setChannel(universe, 1, payload[0]);
    opendmx.setChannel(universe, 2, payload[1]);
    opendmx.setChannel(universe, 3, payload[2]);
  } else {
    console.warn(`Invalid payload received: ${message}`);
  }
});
