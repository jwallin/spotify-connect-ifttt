const qs = require('querystring');

const request = require('./request.js');
const getToken = require('./getToken.js');
const config = require('../config.json');

const PLAYER_STATE_URL = 'https://api.spotify.com/v1/me/player';
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

function getPlayerState(token) {
  return request.get(PLAYER_STATE_URL, token);
}

function activateDevice(token, device, play) {
  return request.put(PLAYER_STATE_URL, token, { device_ids: [device.id], play });
}

function setVolumeTo(token, volume, device) {
  const params = { volume_percent: volume };
  if (typeof device !== 'undefined' && device) {
    params.device_id = device.id;
  }
  const querystring = qs.stringify(params);
  return request.put(`${VOLUME_URL}?${querystring}`, token);
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

exports.adjustVolume = async function adjustVolume(volumeChange) {
  const token = await getToken();
  const playerState = await getPlayerState(token);
  if (!playerState || !playerState.device) {
    console.log('Could not adjust volume on playerState', playerState);
    return false;
  }
  const currentVolume = playerState.device.volume_percent;
  if (typeof currentVolume !== 'number' || typeof volumeChange !== 'number') {
    console.error('Could not read volume levels from', currentVolume, volumeChange);
    return false;
  }
  const newVolume = Math.min(Math.max(currentVolume + volumeChange, 0), 100);
  return setVolumeTo(token, newVolume, playerState.device);
};
