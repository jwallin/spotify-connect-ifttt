const config = require('./config.json');
const playOnDevice = require('./lib/playOnDevice');
const player = require('./lib/player.js');

function isAuthenticated(req, res) {
  if (req.body.secret && req.body.secret === config.SECRET) {
    return true;
  }
  console.error('Authentication failed for client');
  res.end();
  return false;
}

exports.playOnDevice = function p(req, res) {
  let deviceName;
  // Ensure authentication
  if (!isAuthenticated(req, res)) return;
  if (req.get('content-type') === 'application/json') {
    deviceName = req.body.device;
  }

  // Start playback on device
  playOnDevice(deviceName)
    .then(res.end())
    .catch((body) => {
      console.error(body);
      res.end();
    });
};

exports.skipNext = function skipNext(req, res) {
  // Ensure authentication
  if (!isAuthenticated(req, res)) return;

  player.skipNext()
    .then(res.end())
    .catch((body) => {
      console.error(body);
      res.end();
    });
};

exports.skipPrevious = function skipPrevious(req, res) {
  // Ensure authentication
  if (!isAuthenticated(req, res)) return;

  player.skipPrevious()
    .then(res.end())
    .catch((body) => {
      console.error(body);
      res.end();
    });
};

exports.pause = function pause(req, res) {
  // Ensure authentication
  if (!isAuthenticated(req, res)) return;

  player.skipPrevious()
    .then(res.end())
    .catch((body) => {
      console.error(body);
      res.end();
    });
};
