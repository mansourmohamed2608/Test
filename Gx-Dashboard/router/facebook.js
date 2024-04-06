// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
require('../controllers/FacebookAuthController');
const passport = require('passport');

router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

// Facebook Auth Callback
router.get('/auth/facebook/callback',
  passport.authenticate('facebook',  { successRedirect: '/auth/facebook/success' ,failureRedirect: '/auth/facebook/failure' }));
router.get('/auth/facebook/failure', (req, res)=>{
        res.send(`Error`);
});
router.get('/auth/facebook/success', (req, res)=>{
   var name = req.user.name;
        res.send(`Hello ${name}!`);
});

module.exports = router;
