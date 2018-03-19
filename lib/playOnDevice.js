const request = require('request');
const config = require('../config.json');

function activateDevice(token, device) {
  return new Promise((resolve, reject) => {
    const options = {
      url: 'https://api.spotify.com/v1/me/player',
      headers: { Authorization: `Bearer ${token}` },
      json: false,
      body: JSON.stringify({ device_ids: [device.id], play: true }),
    };
    request.put(options, (error, response, body) => {
      if (!error && response.statusCode === 204) {
        resolve(body);
        // } else if (!error && response.statusCode === 202) {
        // Retry after 5s
      } else {
        if (response.statusCode === 400) {
          // Do something -- access token invalid
        } else if (response.statusCode === 401) {
          // Do something -- not sufficient scope
        }
        reject(body);
      }
    });
  });
}

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

function getToken() {
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { Authorization: `Basic ${new Buffer(`${config.CLIENT_ID}:${config.CLIENT_SECRET}`).toString('base64')}` },
    form: {
      grant_type: 'refresh_token',
      refresh_token: config.REFRESH_TOKEN,
    },
    json: true,
  };

  return new Promise((resolve, reject) => {
    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const token = body.access_token;
        resolve(token);
      } else {
        if (response.statusCode === 400) {
          // Do something
        }
        reject(body);
      }
    });
  });
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
