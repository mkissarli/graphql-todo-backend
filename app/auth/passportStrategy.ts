import passport from "passport";

import { userModel } from "../mongooseModels/user";

let LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function (username : string, password : string, done : any) {
    userModel.exists({ username: username, password: password }, function (err, done2) {
      if (done2) {
        return done(null, username);
      }
      else {
        return done(null, false, { message: 'Incorrect username.' });
      }
    })
  }
));
//));

passport.serializeUser(function (user, done) {
  done(null, user);
});

export default passport;