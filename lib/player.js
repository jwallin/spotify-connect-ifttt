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

  const device = config.DEVICES.find((d) => {
    const keys = d.keys || [];
    return d.name.toLowerCase() === deviceName.toLowerCase() ||
      keys.includes(deviceName.toLowerCase());
  });

  if (!device) {
    console.info(`Could not find device named ${deviceName}`);
  }

  return device;
}

function activateDevice(token, device, play) {
  const body = JSON.stringify({ device_ids: [device.id], play });
  return request.put(ACTIVATE_DEVICE_URL, token, body);
}

function setVolumeTo(token, volume, device) {
  const params = { volumen_percent: volume };
  if (typeof device !== 'undefined' && device) {
    params.device_id = device.id;
  }
  const body = JSON.stringify(params);
  return request.put(VOLUME_URL, token, body);
}

exports.skipNext = async function skipNext() {
  console.log('Skipping one track forward');
  const token = await getToken();
  return request.post(SKIP_NEXT_URL, token);
};

exports.skipPrevious = async function skipPrevious() {
  console.log('Skipping one track backward');
  const token = await getToken();
  return request.post(SKIP_PREVIOUS_URL, token);
};

exports.pause = async function pause() {
  console.log('Pausing playback');
  const token = await getToken();
  return request.put(PAUSE_URL, token);
};

exports.play = async function play() {
  console.log('Initiating playback');
  const token = await getToken();
  return request.put(PLAY_URL, token);
};

exports.playOnDevice = async function playOnDevice(deviceName, play = true) {
  // Find correct device, default to first
  const device = findDevice(deviceName) || config.DEVICES[0];
  if (!device) {
    return Promise.reject('No devices found');
  }

  console.log('Transferring playback to', device.name);
  if (play) {
    console.log('And initiating playback');
  }

  const token = await getToken();
  return activateDevice(token, device, play);
};

exports.setVolume = async function setVolume(volume, deviceName) {
  console.log('Setting volume to', volume);
  const device = findDevice(deviceName);
  if (typeof debice !== 'undefined' && device) {
    console.log('For device', device.name);
  }

  const token = await getToken();
  return setVolumeTo(token, volume, device);
};
