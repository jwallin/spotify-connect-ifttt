const request = require('request');
const config = require('../config.json');
const authHeader = require('./authorization.js');

module.exports = function getToken() {
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: authHeader(config.CLIENT_ID, config.CLIENT_SECRET),
    form: {
      grant_type: 'refresh_token',
      refresh_token: config.REFRESH_TOKEN,
    },
    json: true,
  };

  return new Promise((resolve, reject) => {
    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const token = body.access_token;
        resolve(token);
      } else {
        if (response.statusCode === 400) {
          // Do something
        }
        reject(body);
      }
    });
  });
};
