const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'secrets/token.json';

module.exports = {
	auth: function(callback){
		// Load client secrets from a local file.
		fs.readFile('./secrets/credentials.json', (err, content) => {
		if (err) return console.log('Error loading client secret file:', err);
			// Authorize a client with credentials, then call the Google Calendar API.
			authorize(JSON.parse(content), callback);
		});
	}
};

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}