"use strict";

const dotenv = require('dotenv').config();
const express = require('express');
const strava = require('strava-v3');

// strava token info
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI;
const STRAVA_REQUEST_ACCESS_URL = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${STRAVA_REDIRECT_URI}&response_type=code&scope=write`;

const app = express();

const PORT = process.env.PORT || '4000';

// -------------------------------------------------- Configuration
app.set("view engine", "ejs");

app.get('/', (req, res) => {
	var login_url = strava.oauth.getRequestAccessURL({ 'scope': 'write' });
	if (login_url === undefined || login_url === "") {
		throw new Error("Unable to retrieve Strava login URL");
	}
  res.render("landing-page", { strava_request_access_url: STRAVA_REQUEST_ACCESS_URL });
});

app.get('/tokenexchange', function (req, res) {
  //Get the access token, save it in session variable, and redirect to training log
  var code = req.query.code;
	strava.oauth.getToken(code, function (err, payload, limits) {
		console.log("Token exchange payload = " + JSON.stringify(payload));
		if (err) {
			throw new Error("Unable to request access token");
    }
    // console.log(req.session);
		// req.session.strava_token = payload.access_token;
		res.redirect('/logbook');
	});
});

app.get('/logbook', function (req, res) {
	res.render('logbook', {});
});

// -------------------------------------------------- Initialize app
app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});