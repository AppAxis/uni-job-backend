const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

 passport.serializeUser((user, done) => {
    done(null, user);
 })
    passport.deserializeUser(function(user, done){
        done(null, user);
    });

    passport.use(new GoogleStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback",
            passReqToCallback: true  // allows us to pass the req from the route to the callback
         }, 
         function(request, accessToken, refreshToken, profile, done) {
            return done(null, profile);
         }));

 