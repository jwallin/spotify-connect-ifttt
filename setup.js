/*
1. Read client ID, client secret - err if nonexistent
2. Open website to retreive code, state (handle non-auth)
3. Request access and refresh token
4. Store refresh token
5. Fetch device list
6. Store devices in json
7. Generate random secret string and store in JSON
*/

const AUTH_CONFIG_PATH = './config.json';

const config = require(AUTH_CONFIG_PATH);

const fs = require('fs');
const request = require('request');
const express = require('express');
const querystring = require('querystring');
const opn = require('opn');
const randomstring = require('randomstring');

const ACCOUNTS_URL = 'https://accounts.spotify.com';

const app = express();

const PORT = process.env.PORT || 8888;

const host = `http://localhost:${PORT}`;
const redirectUri = `${host}/callback`;

const scope = 'user-read-playback-state user-modify-playback-state';

function clone(original, newProperties) {
  return Object.assign(original, newProperties);
}

function generateSecret(conf) {
  if (!conf.SECRET) {
    console.log('Generating secret');
    return Promise.resolve(clone(conf, { SECRET: randomstring.generate(32) }));
  }
  console.log('Already found secret, keeping that');
  return Promise.resolve(conf);
}

function fetchToken(code, oldConf) {
  console.log('Fetching access token');
  return new Promise((resolve, reject) => {
    const authOptions = {
      url: `${ACCOUNTS_URL}/api/token`,
      headers: { Authorization: `Basic ${new Buffer(`${config.CLIENT_ID}:${config.CLIENT_SECRET}`).toString('base64')}` },
      form: {
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      },
      json: true,
    };

    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const conf = clone(oldConf, {
          REFRESH_TOKEN: body.refresh_token,
          ACCESS_TOKEN: body.access_token,
        });
        console.log('Access token fetched successfully');
        resolve(conf);
      } else {
        reject(`Could not fetch refresh token: ${body.error_description}`);
      }
    });
  });
}

function findDevice(devices, id) {
  if (!devices) {
    return null;
  }
  return devices.find(el => el.id === id);
}

function listDevices(oldConf) {
  return new Promise((resolve, reject) => {
    const options = {
      url: 'https://api.spotify.com/v1/me/player/devices',
      headers: { Authorization: `Bearer ${oldConf.ACCESS_TOKEN}` },
      json: true,
    };

    request.get(options, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        if (Array.isArray(body.devices)) {
          const devices = body.devices.map((device) => {
            const oldDevice = findDevice(oldConf.DEVICES, device.id) || {};
            const oldKeys = oldDevice.keys || [];

            return {
              id: device.id,
              name: device.name,
              keys: oldKeys,
            };
          });
          resolve(clone(oldConf, { DEVICES: devices }));
        } else {
          reject('No active Spotify devices found');
        }
      } else {
        if (response.statusCode === 400) {
          reject('Invalid access token');
        } else if (response.statusCode === 401) {
          reject('Not sufficient scopes');
        }
        reject(body);
      }
    });
  });
}

function writeConfig(conf) {
  return new Promise((resolve, reject) => {
    fs.writeFile(AUTH_CONFIG_PATH, JSON.stringify(conf, null, 2), null, (err) => {
      if (err) {
        console.error('Error when writing configuration');
        reject(err);
      } else {
        console.log('Successfully wrote configuration');
        resolve(conf);
      }
    });
  });
}

app.get('/login', (req, res) => {
  res.redirect(`${ACCOUNTS_URL}/authorize?${
    querystring.stringify({
      response_type: 'code',
      client_id: config.CLIENT_ID,
      scope,
      redirect_uri: redirectUri,
    })}`);
});

app.get('/callback', (req, res) => {
  const code = req.query.code || null;
  fetchToken(code, config)
    .then(listDevices)
    .then(generateSecret)
    .then(writeConfig)
    .then(() => {
      const msg = 'Setup complete!';
      res.send(msg);
      console.log('');
      console.log(msg);
      console.log('Test configuration by running node test.js');
      process.exit();
    })
    .catch(console.error);
});

app.listen(PORT, () => {
  if (!config.CLIENT_ID || !config.CLIENT_SECRET) {
    console.error(`No client id or client secret in ${AUTH_CONFIG_PATH}`);
    process.exit(1);
  }

  const uri = `${host}/login`;
  opn(uri, { wait: false })
    .then(() => {
      console.log(`Opened ${uri} in a web browser window`);
    }).catch(() => {
      console.log(`Open ${uri} in a web browser window to begin setup`);
    });
});
