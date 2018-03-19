const request = require('request');
const config = require('../config.json');

function playOnDevice(token, device) {
  return new Promise((resolve, reject) => {
      var options = {
          url: 'https://api.spotify.com/v1/me/player',
          headers: { 'Authorization': 'Bearer ' + token },
          json: false,
          body: JSON.stringify({'device_ids':[device.id], 'play': true})
        };
        request.put(options, function(error, response, body) {
          if (!error && response.statusCode === 204) {
            resolve(body);
          //} else if (!error && response.statusCode === 202) {
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

const findDevice = function(deviceName) {
    if (!deviceName) {
        return undefined;
    }

    for (let device of config.DEVICES) {
      console.log(device.name, device.name.toLowerCase() === deviceName.toLowerCase());
        if (device.name.toLowerCase() === deviceName.toLowerCase() ||
            device.keys.includes(deviceName.toLowerCase())) {
            return device;
        }
    }
    console.info("Could not find device named " + deviceName);
    // Todo: Store these devices somewhere
    return undefined;
}

const getToken = function() {
  var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(config.CLIENT_ID + ':' + config.CLIENT_SECRET).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: config.REFRESH_TOKEN
      },
      json: true
    };

  return new Promise((resolve, reject) => {
        request.post(authOptions, function(error, response, body) {
          if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            resolve(access_token);
          } else {
              if (response.statusCode === 400) {
                  // Do something
              }
              reject(body);
          }
        });
  });
};

module.exports = function(deviceName) {

  //Find correct device, default to first
  const device = findDevice(deviceName) || config.DEVICES[0];
  if(!device) {
    console.error('No devices found');
    return;
  }

  console.log('Transferring playback to', device.name);

  return getToken()
    .then(token => {
        return playOnDevice(token, device);
    })
}
