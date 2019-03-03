const config = require('./config.json');
const player = require('./lib/player.js');

function isAuthenticated(req, res) {
  if (req.body.secret && req.body.secret === config.SECRET) {
    return true;
  }
  console.error('Authentication failed for client');
  res.end();
  return false;
}

function handleRequest(handler, req, res) {
  // Ensure authentication
  if (!isAuthenticated(req, res)) return;

  handler()
    .then(res.end())
    .catch((body) => {
      console.error(body);
      res.end();
    });
}

function playOnDevice(req) {
  let deviceName;
  if (req.get('content-type') === 'application/json') {
    deviceName = req.body.device;
  }
  // Start playback on device
  return player.playOnDevice(deviceName);
}

exports.skipNext = (req, res) => handleRequest(player.skipNext, req, res);
exports.skipPrevious = (req, res) => handleRequest(player.skipPrevious, req, res);
exports.pause = (req, res) => handleRequest(player.pause, req, res);
exports.playOnDevice = (req, res) => handleRequest(playOnDevice.bind(this, req), req, res);
