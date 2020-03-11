const config = require('./config.json');
const player = require('./lib/player.js');

function isAuthenticated(req, res) {
  if (req.body.secret && req.body.secret === config.SECRET) {
    return true;
  }
  console.error('Authentication failed for client');
  res(403).send('Authentication failed for client');
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
  let device;
  let play;
  if (req.get('content-type') === 'application/json') {
    ({ device, play } = req.body);
  }

  // Start playback on device
  return player.playOnDevice(device, play);
}

function setVolume(req) {
  let volume;
  let device;
  if (req.get('content-type') === 'application/json') {
    ({ volume, device } = req.body);
  }
  return player.setVolume(volume, device);
}

exports.skipNext = (req, res) => handleRequest(player.skipNext, req, res);
exports.skipPrevious = (req, res) => handleRequest(player.skipPrevious, req, res);
exports.pause = (req, res) => handleRequest(player.pause, req, res);
exports.play = (req, res) => handleRequest(player.play, req, res);
exports.playOnDevice = (req, res) => handleRequest(playOnDevice.bind(this, req), req, res);
exports.setVolume = (req, res) => handleRequest(setVolume.bind(this, req), req, res);
