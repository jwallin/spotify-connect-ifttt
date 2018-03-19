module.exports = function authHeader(clientId, clientSecret) {
  return {
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
  };
};
