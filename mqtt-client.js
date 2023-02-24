const mqtt = require('async-mqtt');
const axios = require('axios');
const fs = require('fs');

const MQTT_BROKER_URL = 'mqtt://localhost';
const LIGHT_TOPIC = 'dmx/set';
const DOORS_TOPIC = 'doors/set';
const KNEELS_TOPIC = 'kneels/get'; //the kneeling pad
const API_URL = 'https://www.mudroom.rip/api/v1/game/tableau/';
const POLL_INTERVAL = 2000; // 2 seconds

let lastColorHex = null;

async function connect() {
  try {
    // Connect to the MQTT broker
    const client = await mqtt.connectAsync(MQTT_BROKER_URL);
    console.log('Connected to MQTT broker');

    // Load the auth token from the secrets file
    const secrets = JSON.parse(fs.readFileSync('secrets.json'));
    const authToken = secrets.authToken;

    // Start polling the API
    setInterval(async () => {
      try {
        // Retrieve data from the API
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
        const data = response.data;
        console.log(data);

        // Check if the color hex value has changed since last check
        const currentColorHex = data.room && data.room.color_hex;
        if (currentColorHex && currentColorHex !== lastColorHex) {
          // Publish data to the MQTT broker
          await client.publish(MQTT_TOPIC, JSON.stringify(currentColorHex));
          console.log('Published data to MQTT broker:', currentColorHex);

          // Update the last color hex value
          lastColorHex = currentColorHex;
        }
      } catch (error) {
        console.error(error);
      }
    }, POLL_INTERVAL);
  } catch (error) {
    console.error(error);
  }
}

connect();