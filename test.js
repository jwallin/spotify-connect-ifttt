const player = require('./lib/player.js');

const deviceName = process.argv[2];

player
  .playOnDevice(deviceName)
  .then(() => console.log('Playback started successfully'))
  .catch((err) => { console.error(err); });
