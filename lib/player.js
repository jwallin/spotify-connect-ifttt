const request = require('./request.js');
const getToken = require('./getToken.js');
const config = require('../config.json');

const ACTIVATE_DEVICE_URL = 'https://api.spotify.com/v1/me/player';
const SKIP_NEXT_URL = 'https://api.spotify.com/v1/me/player/next';
const SKIP_PREVIOUS_URL = 'https://api.spotify.com/v1/me/player/previous';
const PAUSE_URL = 'https://api.spotify.com/v1/me/player/pause';
const PLAY_URL = 'https://api.spotify.com/v1/me/player/play';
const VOLUME_URL = 'https://api.spotify.com/v1/me/player/volume';

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

function activateDevice(token, device, play) {
  const body = JSON.stringify({ device_ids: [device.id], play });
  return request.put(ACTIVATE_DEVICE_URL, token, body);
}

function setVolumeTo(token, volume, device) {
  let queryParams = `?volume_percent=${volume}`;
  if (typeof device !== 'undefined' && device) {
    queryParams += `&device_id=${device.id}`;
  }
  const url = VOLUME_URL + queryParams;
  console.log(url);
  return request.put(url, token);
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

exports.play = function play() {
  console.log('Initiating playback');
  return getToken()
    .then(token => request.put(PLAY_URL, token));
};

exports.playOnDevice = function playOnDevice(deviceName, play) {
  // Find correct device, default to first
  const device = findDevice(deviceName) || config.DEVICES[0];
  if (!device) {
    return Promise.reject('No devices found');
  }

  console.log('Transferring playback to', device.name);
  if (play) {
    console.log(play);
    console.log('And initiating playback');
  }

  return getToken()
    .then(token => activateDevice(token, device, play));
};

exports.setVolume = function setVolume(volume, deviceName) {
  console.log('Setting volume to', volume);
  const device = findDevice(deviceName);
  if (typeof debice !== 'undefined' && device) {
    console.log('For device', device.name);
  }

  return getToken()
    .then(token => setVolumeTo(token, volume, device));
};
