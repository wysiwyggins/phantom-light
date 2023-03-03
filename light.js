const mqtt = require('mqtt');
const DMX = require('dmx');
const dmx = new DMX();
const universe = dmx.addUniverse('demo', 'enttec-open-usb-dmx', '/dev/ttyUSB0');
const client = mqtt.connect('mqtt://localhost');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const parser = new Readline();

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe('dmx/set');
});

client.on('message', (topic, message) => {
  console.log('Received message:', message.toString());
  let hexColor = message.toString().replace('#', '');
  console.log('Hex color:', hexColor);
  let rgbColor = hexToRgb(hexColor);
  console.log('RGB color:', rgbColor);

  if (isNaN(rgbColor.red) || isNaN(rgbColor.green) || isNaN(rgbColor.blue)) {
    console.error('Invalid color value in message:', message.toString());
    return;
  }

  console.log('Setting DMX values:', rgbColor.red, rgbColor.green, rgbColor.blue);
  universe.update({ 1: rgbColor.red, 2: rgbColor.green, 3: rgbColor.blue });
});

function hexToRgb(hex) {
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { red: r, green: g, blue: b };
}

parser.on('data', (data) => {
  console.log('Received DMX data:', data);
});

const port = new SerialPort('/dev/ttyUSB1', { baudRate: 115200 });
port.pipe(parser);
