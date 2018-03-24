const request = require('./request.js');
const getToken = require('./getToken.js');
const config = require('../config.json');

const ACTIVATE_DEVICE_URL = 'https://api.spotify.com/v1/me/player';
const SKIP_NEXT_URL = 'https://api.spotify.com/v1/me/player/next';
const SKIP_PREVIOUS_URL = 'https://api.spotify.com/v1/me/player/previous';
const PAUSE_URL = 'https://api.spotify.com/v1/me/player/pause';

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
  return request.put(ACTIVATE_DEVICE_URL, token, body);
}

exports.skipNext = function skipNext() {
  console.log('Skipping one track forward');
  return getToken()
    .then(token => request.post(SKIP_NEXT_URL, token));
};

exports.skipPrevious = function skipPrevious() {
  console.log('Skipping one track backward');
  return getToken()
    .then(token => request.post(SKIP_PREVIOUS_URL, token));
};

exports.pause = function pause() {
  console.log('Pausing playback');
  return getToken()
    .then(token => request.put(PAUSE_URL, token));
};


exports.playOnDevice = function playOnDevice(deviceName) {
  // Find correct device, default to first
  const device = findDevice(deviceName) || config.DEVICES[0];
  if (!device) {
    return Promise.reject('No devices found');
  }

  console.log('Transferring playback to', device.name);

  return getToken()
    .then(token => activateDevice(token, device));
};
