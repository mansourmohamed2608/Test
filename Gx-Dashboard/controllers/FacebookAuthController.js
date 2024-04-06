const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const { DbConnect } = require('../ConfigFolder/DBConn');
require('dotenv').config()
// Database connection
const connection = DbConnect().promise();

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "https://api.gamax.co:444/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name'] // Adjusted order for clarity
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
      const fullName = profile.name ? `${profile.name.givenName} ${profile.name.familyName}` : null;
      const facebookId = profile.id;

      // Now your query matches the column count and value count
      const query = 'INSERT INTO buyers (facebookId, name, email) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email)';
      const values = [facebookId, fullName, email];

      const [rows] = await connection.query(query, values);
     
      let user;
      if (rows.insertId) {
        user = { id: rows.insertId, facebookId, name: fullName, email };
      } else {
        // User already exists, so let's fetch the existing user
        const [existingRows] = await connection.query('SELECT * FROM buyers WHERE facebookId = ?', [facebookId]);
        user = existingRows[0];
      }

      done(null, user);
    } catch (error) {
      console.error(error);
      done(error, null);
    }
  }
));
module.exports = passport;
