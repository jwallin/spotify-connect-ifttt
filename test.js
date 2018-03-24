const player = require('./lib/player.js');

const deviceName = process.argv[2];

player.playOnDevice(deviceName);
