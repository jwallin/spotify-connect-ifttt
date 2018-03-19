'use strict';

const config = require('./config.json');
const playOnDevice = require('./lib/playOnDevice');

const isAuthenticated = function(req, res) {
  if (req.body.secret && req.body.secret === config.SECRET) {
      return true;
  } else {
      console.error('Authentication failed for client');
      res.end();
      return false;
  }
}

exports.playOnDevice = function(req, res) {
  let deviceName;
  // Ensure authentication
  if (!isAuthenticated(req, res)) return;
  if (req.get('content-type') === 'application/json') {
      deviceName = req.body.device;
  }

  // Start playback on device
  playOnDevice()
    .then(res.end())
    .catch(body => {
      console.error(body);
      res.end();
    });
}
