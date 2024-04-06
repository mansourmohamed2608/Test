// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../controllers/GoogleAuthController'); // Assuming this sets up your Google strategy

// Trigger Google Authentication
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Auth Callback
router.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      // Handle authentication errors
      return res.status(500).json({ error: 'Authentication error', details: err });
    }
    if (!user) {
      // Handle case where no user is returned
      return res.status(401).json({ error: 'Authentication failed', details: 'No user information received from Google.' });
    }

    req.login(user, { session: true }, (err) => {
      if (err) {
          return next(err);
      }
      req.session.userId = user.id;
      // Assuming the accessToken is attached to the user object correctly
      // You should ensure this happens in your Google strategy setup
      const accessToken = user.accessToken;
      if (!accessToken) {
        return res.status(500).json({ error: 'Authentication error', details: 'No access token received.' });
      }
   
      // Redirect or respond with token
      // For API-based approach, respond with JSON
      return res.redirect(`https://main--delightful-gumdrop-c251d7.netlify.app/`);
//res.status(200).json({
  //      message: 'Authentication successful',
    //    accessToken: accessToken,
	//userId : user.id
      //});

      // For web-based approach, redirect with token in query
      // return res.redirect(`https://esports.gamax.co/${user.id}`);
    });
  })(req, res, next);
});

// Authentication failure route
router.get('/auth/google/failure', (req, res) => {
  res.status(401).send('Authentication failed');
});

// Successful authentication route, if needed separately
router.get('/auth/google/success', (req, res) => {
  if (req.user && req.user.name) {
    res.status(200).send(`Hello ${req.user.name}!`);
  } else {
    res.status(400).send('No user information available.');
  }
});

module.exports = router;
