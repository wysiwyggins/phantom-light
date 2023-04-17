const mqtt = require('async-mqtt');
const axios = require('axios');
const fs = require('fs');

const MQTT_BROKER_URL = 'mqtt://localhost';
const LIGHT_TOPIC = 'dmx/set';
const DOORS_TOPIC = 'doors/set';
const KNEELS_TOPIC = 'kneels/get';
const DEATH_TOPIC = 'death/set'; // Added death topic
const API_URL = 'https://grotto.wileywiggins.com/api/v1/game/tableau/';
const POLL_INTERVAL = 2000; // 2 seconds

const secrets = JSON.parse(fs.readFileSync('secrets.json'));
const authToken = secrets.authToken;

let lastColorHex = null;
let data;

let lastExits = null;

async function connect() {
  try {
    const client = await mqtt.connectAsync(MQTT_BROKER_URL);
    console.log('Connected to MQTT broker');

    setInterval(async () => {
      let response;
      try {
        response = await axios.get(API_URL, {
          headers: {
            Authorization: `${authToken}`
          }
        });
        data = response.data;

        let currentExits = data.room.exits;
        let currentColorHex = data.room && data.room.color_hex;
        if (currentColorHex && currentColorHex !== lastColorHex) {
          await client.publish(LIGHT_TOPIC, JSON.stringify(currentColorHex));
          console.log('Published data to MQTT broker:', currentColorHex);

          lastColorHex = currentColorHex;

          await client.publish(DOORS_TOPIC, JSON.stringify(currentExits));
          console.log('Published exits to MQTT broker');

          lastExits = currentExits;
        }

        // Check if character is dead and publish death note to death/set topic
        if (data.character && data.character.dead) {
          await client.publish(DEATH_TOPIC, JSON.stringify(data.character['death note']));
          console.log('Published death note to MQTT broker:', data.character['death note']);
        }

      } catch (error) {
        console.error(error);
      }
    }, POLL_INTERVAL);
  } catch (error) {
    console.error(error);
  }

  client.on('connect', async () => {
    console.log('Connected to Mosquitto broker');
    await client.subscribe('kneels/get');
    console.log('Subscribed to "kneels/get" topic');
    await client.subscribe('doorknob/get');
    console.log('Subscribed to "doorknob/get" topic');
  });

  client.on('message', async (topic, message) => {
    let data = message.toString();
    console.log(`Received message "${data}" on topic "${topic}"`);
    try {
      await axios.post('https://grotto.wileywiggins.com/api/v1/game/rooms/kneel/', { message: data }, {
        headers: {
          Authorization: `${authToken}`
        }
      });
      console.log('Posted to API endpoint');
    } catch (error) {
      console.error('Error posting to API endpoint:', error);
    }
  });

  client.on('error', (error) => {
    console.error('Error connecting to Mosquitto broker:', error);
  });

  process.on('SIGINT', async () => {
    console.log('Closing Mosquitto client');
    await client.end();
    process.exit();
  });
}

connect();
