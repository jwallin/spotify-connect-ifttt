# IFTTT support for Spotify Connect (using Webhook)
Transfer playback between your devices using [Spotify Connect](https://beta.developer.spotify.com/documentation/web-api/reference/player/). To be used with Google Assistant, Flic button etc.

This example uses Google Cloud Functions, but can be deployed elsewhere too.

## Enable Google Cloud Functions
Install and initialize Google Cloud Functions as described on https://cloud.google.com/functions/docs/tutorials/http

## Configuration

1. Install dependencies with
```sh
npm install
```
2. Create an application on [Spotify for Developers](https://beta.developer.spotify.com/dashboard/applications).
3. Add redirect uri `http://localhost:8888/callback`
4. Create a `config.json` file (based on `config.default.json`) and update `CLIENT_ID` and `CLIENT_SECRET` from the Spotify application you just created
5. Start configuration by running
```sh
node setup.js
```
6. (Optional) Add keywords to your devices in `config.json` (lowercase)

## Test
Test your configuration by running
```sh
node test.js
````
This should start playback to the first device in your list. It can also take an argument of a device:
```sh
node test.js "MySpeaker"
```

## Deploy
To deploy to Google Cloud Functions run
```sh
./deploy.sh
```

## Set up IFTTT WebHook trigger
Set up a [new WebHook trigger](https://ifttt.com/create) with the URL displayed after deploy, something in the form of
`https://{YOUR-REGION}-{YOUR-PROJECT-ID}.cloudfunctions.net/playOnDevice`

Select method `POST`, Content-Type to `application/json` and set body to:
```json
{
  "device": "{{TextField}}",
  "secret": "{YOUR-SECRET-IN-CONFIG.JSON}"
}
```

## API
All calls should be made with POST method.

### `/playOnDevice`
Activate playback on given device

#### Parameters
`secret` Your shared secret for authentication

`device` The name (or one of the keywords) of the device to move playback to

#

### `/skipNext`
Skip to next track
#### Parameters
`secret` Your shared secret for authentication

#

### `/skipPrevious`
Skip to previous track
#### Parameters
`secret` Your shared secret for authentication

#

### `/pause`
Pause playback
#### Parameters
`secret` Your shared secret for authentication
