const config = require('../config.json');
const getToken = require('./getToken.js');
const post = require('./post.js');

const ACTIVATE_DEVICE_URL = 'https://api.spotify.com/v1/me/player';

function findDevice(deviceName) {
  if (!deviceName) {
    return undefined;
  }

  for (const device of config.DEVICES) {
    console.log(device.name, device.name.toLowerCase() === deviceName.toLowerCase());
    if (device.name.toLowerCase() === deviceName.toLowerCase() ||
            device.keys.includes(deviceName.toLowerCase())) {
      return device;
    }
  }
  console.info(`Could not find device named ${deviceName}`);
  // Todo: Store these devices somewhere
  return undefined;
}

function activateDevice(token, device) {
  const body = JSON.stringify({ device_ids: [device.id], play: true });
  return post(ACTIVATE_DEVICE_URL, token, body);
}

module.exports = function playOnDevice(deviceName) {
  // Find correct device, default to first
  const device = findDevice(deviceName) || config.DEVICES[0];
  if (!device) {
    return Promise.reject('No devices found');
  }

  console.log('Transferring playback to', device.name);

  return getToken()
    .then(token => activateDevice(token, device));
};
