const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const InstagramStrategy = require("passport-instagram").Strategy;

const initializeFBPassport = () => {
  passport.use(
    new InstagramStrategy(
      {
        // eslint-disable-next-line no-undef
        clientID: process.env.IG_CLIENT_ID,
        // eslint-disable-next-line no-undef
        clientSecret: process.env.IG_CLIENT_SECRET,
        callbackURL: "http://localhost:6006/auth/instagram/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        // Save user profile and access token in session
        return done(null, { profile, accessToken });
      }
    )
  );
  passport.use(
    new FacebookStrategy(
      {
        // eslint-disable-next-line no-undef
        clientID: process.env.FB_CLIENT_ID,
        // eslint-disable-next-line no-undef
        clientSecret: process.env.FB_CLIENT_SECRET,
        callbackURL: "http://localhost:6006/auth/facebook/callback",
        profileFields: ["id", "displayName", "photos", "email"],
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );
  passport.use(
    new GoogleStrategy(
      {
        // eslint-disable-next-line no-undef
        clientID: process.env.CLIENT_ID,
        // eslint-disable-next-line no-undef
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        passReqToCallback: true,
      },
      (request, accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
};

module.exports = initializeFBPassport;
