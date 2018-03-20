const post = require('./post.js');
const getToken = require('./getToken.js');

const SKIP_NEXT_URL = 'https://api.spotify.com/v1/me/player/next';
const SKIP_PREVIOUS_URL = 'https://api.spotify.com/v1/me/player/previous';

exports.skipNext = function skipNext() {
  console.log('Skipping one track forward');
  return getToken()
    .then(token => post(SKIP_NEXT_URL, token));
};

exports.skipPrevious = function skipPrevious() {
  console.log('Skipping one track backward');
  return getToken()
    .then(token => post(SKIP_PREVIOUS_URL, token));
};

