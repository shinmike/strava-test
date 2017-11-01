"use strict";

const dotenv = require('dotenv').config();
const express = require('express');
const strava = require('strava-v3');
var bodyParser = require('body-parser');
var session = require('express-session');

// strava token info
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI;
const STRAVA_REQUEST_ACCESS_URL = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${STRAVA_REDIRECT_URI}&response_type=code&scope=write`;

const app = express();

//Session cookies
app.use(session({
	secret: "MajesticSeaFlapFlap",
	resave: false,
	saveUninitialized: true,
	cookie: {
		secure: false,
		maxAge: 432000000 //5 days in milliseconds
	},
}));

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

app.get('/tokenexchange', (req, res) => {
	//Get the access token, save it in session variable, and redirect to training log
	var code = req.query.code;
	strava.oauth.getToken(code, function (err, payload, limits) {
		console.log("Token exchange payload = " + JSON.stringify(payload));
		if (err) {
			throw new Error("Unable to request access token");
		}
		req.session.strava_token = payload.access_token;
		res.redirect('/logbook');
	});
});

app.get('/logbook', (req, res) => {
	var code = req.query.code;
	strava.athlete.get({ 'access_token': code }, function (err, payload, limits) {
		var athlete = {};
		athlete.firstname = payload.firstname;
		athlete.lastname = payload.lastname;
		res.render('logbook', {athleteInfo: athlete});
	});
});

// -------------------------------------------------- Initialize app
app.listen(PORT, () => {
	console.log(`app listening on port ${PORT}!`);
});