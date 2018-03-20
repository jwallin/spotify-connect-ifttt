const request = require('request');

function makeRequest(method, url, token, body) {
  const fn = request[method];
  if (!fn) {
    return Promise.reject('Method not supported');
  }

  return new Promise((resolve, reject) => {
    const options = {
      url,
      headers: { Authorization: `Bearer ${token}` },
      json: false,
      body,
    };
    fn(options, (error, response, responseBody) => {
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
        } else {
          console.error(`Error code ${response.statusCode} when requesting ${url}`);
        }

        reject(responseBody);
      }
    });
  });
}

module.exports.put = function put(url, token, body) {
  return makeRequest('put', url, token, body);
};

module.exports.post = function post(url, token, body) {
  return makeRequest('post', url, token, body);
};
