'use strict';

const request = require('request'); // "Request" library
const settings = require('./config.json');

const isAuthenticated = function(req, res) {
    if (req.body.secret && req.body.secret === settings.secret) {
        return true;
    } else {
        console.error('Authentication failed for client');
        res.end();
        return false;
    }
}

const getToken = function() {
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(settings.clientId + ':' + settings.clientSecret).toString('base64')) },
        form: {
          grant_type: 'refresh_token',
          refresh_token: settings.refreshToken
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
  
const listDevices = function(token) {
    return new Promise((resolve, reject) => {
        var options = {
            url: 'https://api.spotify.com/v1/me/player/devices',
            headers: { 'Authorization': 'Bearer ' + token },
            json: true
          };
          request.get(options, function(error, response, body) {
            if (!error && response.statusCode === 200) {
              resolve(body);
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

const playOnDevice = function(token, device) {
    return new Promise((resolve, reject) => {
        var options = {
            url: 'https://api.spotify.com/v1/me/player',
            headers: { 'Authorization': 'Bearer ' + token },
            json: false,
            //body: '{"device_ids":["0717737c81c224fcf7bf43f3b06b003b791a92c5"]}'
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

const findDevice = function(req) {
    let deviceName;
    if (req.get('content-type') === 'application/json') {
        deviceName = req.body.device;
    }
    if (!deviceName) {
        return undefined;
    }
    for (let device of settings.devices) {
        if (device.keys.includes(deviceName.toLowerCase())) {
            return device;
        }
    }
    console.info("Could not find device named " + deviceName);
    // Todo: Store these devices somewhere
    return undefined;
}

exports.playOnDevice = function(req, res) {
    // Ensure authentication
    if (!isAuthenticated(req, res)) return;

    //Find correct device, default to first
    const device = findDevice(req) || settings.devices[0];
    console.log('Transferring playback to', device.name);
    // Start playback on device
    getToken()
        .then(token => {
            return playOnDevice(token, device);   
        })
        .then(res.end())
    .catch(body => {
        console.error(body);
        res.end();
    });
}

// To not export this to production
exports.listDevices = function(req, res) {
    getToken()
        .then(listDevices)
        .then(response => {
            res.send(response);
        })
    .catch((body) => {
        console.error(body);
        res.end();
    });
}