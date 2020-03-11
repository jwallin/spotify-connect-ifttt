const request = require('request');

async function makeRequest(method, url, token, body) {
  const fn = request[method];
  if (!fn) {
    return Promise.reject('Method not supported');
  }

  return new Promise((resolve, reject) => {
    const options = {
      url,
      headers: { Authorization: `Bearer ${token}` },
      json: true,
      body,
    };
    fn(options, (error, response, responseBody) => {
      if (!error && (response.statusCode >= 200 && response.statusCode < 300)) {
        resolve(responseBody);
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

module.exports.put = async function put(url, token, body) {
  return makeRequest('put', url, token, body);
};

module.exports.post = async function post(url, token, body) {
  return makeRequest('post', url, token, body);
};

module.exports.get = async function get(url, token) {
  return makeRequest('get', url, token);
};
