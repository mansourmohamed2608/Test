const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { DbConnect } = require('../ConfigFolder/DBConn');
require('dotenv').config();

// Database connection
const connection = DbConnect().promise();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://api.gamax.co:444/auth/google/callback",
    passReqToCallback: true  // Enables the request object to be passed as the first argument to the verify callback
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const [rows] = await connection.query('SELECT * FROM buyers WHERE googleId = ?', [profile.id]);
      let user = rows[0];

      // Check if the user already exists in the database
      if (!user) {
        // User doesn't exist, so create a new user entry
        const email = profile.emails && profile.emails[0].value;
        const [result] = await connection.query('INSERT INTO buyers (googleId, name, email, accessToken) VALUES (?, ?, ?, ?)', [profile.id, profile.displayName, email, accessToken]);
        // Construct a new user object including the accessToken
        user = { id: result.insertId, googleId: profile.id, name: profile.displayName, email: email, accessToken: accessToken };
      } else {
        // User exists, optionally update the accessToken or handle accordingly
        user.accessToken = accessToken; // Attach the accessToken to the existing user object
      }

      done(null, user);
    } catch (error) {
      console.error('Error in Google Strategy:', error);
      done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id); // Serialize user by id
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await connection.query('SELECT * FROM buyers WHERE id = ?', [id]);
    const user = rows[0];
    done(null, user); // The user object is now available on req.user
  } catch (error) {
    console.error('Error deserializing user:', error);
    done(error, null);
  }
});

module.exports = passport;
