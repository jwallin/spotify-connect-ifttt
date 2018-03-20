const request = require('request');

module.exports = function post(url, token, body) {
  return new Promise((resolve, reject) => {
    const options = {
      url,
      headers: { Authorization: `Bearer ${token}` },
      json: false,
      body,
    };
    request.put(options, (error, response, responseBody) => {
      if (!error && (response.statusCode === 204 || response.statusCode === 200)) {
        resolve(responseBody);
        // } else if (!error && response.statusCode === 202) {
        // TODO: Retry after 5s
      } else {
        if (response.statusCode === 400) {
          // Access token invalid
          console.error(`Invalid access token when requesting ${url}`);
        } else if (response.statusCode === 401) {
          // Insufficient scope
          console.error(`Insufficient scope when requesting ${url}`);
        }
        reject(responseBody);
      }
    });
  });
};
