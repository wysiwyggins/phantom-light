const mqtt = require('async-mqtt');
const axios = require('axios');
const fs = require('fs');

const MQTT_BROKER_URL = 'mqtt://localhost';
const LIGHT_TOPIC = 'dmx/set';
const DOORS_TOPIC = 'doors/set';
const KNEELS_TOPIC = 'kneels/get'; //the kneeling pad
const API_URL = 'https://grotto.wileywiggins.com/api/v1/game/tableau/';
const POLL_INTERVAL = 2000; // 2 seconds

const secrets = JSON.parse(fs.readFileSync('secrets.json'));
const authToken = secrets.authToken;

let lastColorHex = null;
let data;

let lastExits = [];

async function connect() {
  try {
    // Connect to the MQTT broker
    const client = await mqtt.connectAsync(MQTT_BROKER_URL);
    console.log('Connected to MQTT broker');

    // Load the auth token from the secrets file
    

    // Start polling the API
    setInterval(async () => {
      let response;
      try {
        // Retrieve data from the API
        response = await axios.get(API_URL, {
          headers: {
            Authorization: `${authToken}`
          }
        });
        data = response.data;
        //console.log(data);

        // Check if the color hex value has changed since last check
        let currentColorHex = data.room && data.room.color_hex;
        if (currentColorHex && currentColorHex !== lastColorHex) {
          // Publish data to the MQTT broker
          await client.publish(LIGHT_TOPIC, JSON.stringify(currentColorHex));
          console.log('Published data to MQTT broker:', currentColorHex);

          // Update the last color hex value
          lastColorHex = currentColorHex;
        }

        if (currentColorHex && currentColorHex !== lastColorHex) {
          // Publish data to the MQTT broker
          await client.publish(LIGHT_TOPIC, JSON.stringify(currentColorHex));
          console.log('Published data to MQTT broker:', currentColorHex);
          // Update the last color hex value
          lastColorHex = currentColorHex;

          await client.publish(DOORS_TOPIC, JSON.stringify(currentExits)); //i think mqtt makes you stringify, so I hope this doesn't wreck the receiver
          console.log('Published exits to MQTT broker');
          // Update the last exits array
          lastExits = currentExits;
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

