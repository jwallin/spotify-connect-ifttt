const player = require('./lib/player.js');

const deviceName = process.argv[2];
const play = process.argv[3];

player
  .playOnDevice(deviceName, play)
  .then(() => console.log('Playback started successfully'))
  .catch((err) => { console.error(err); });
