import passport from "passport";

import { userModel, userSchema } from "../mongooseModels/user";

let LocalStrategy = require('passport-local').Strategy;

/*passport.use(new LocalStrategy(
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
//));*/

import Auth from '../auth/auth';

//Create a passport middleware to handle user registration
passport.use('signup', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async function (username: string, password: string, done: any) {
    return await Auth.hashPassword(password, 12)
    .then(async function (hash) {
      let response = await userSchema.methods.createNew(username, hash);
      return done(null, response);
    })
    .catch(async function (error) {
      // Throw an error
      done(error);
    });

}));

//Create a passport middleware to handle User login
passport.use('login', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async function (username: string, password: string, done: any) {
  return await userModel.findOne({ username: username })
      .then(async function (doc) {
        return await Auth.compare(password, doc.password)
          .then(async function () {
            
            return done(null, doc, { message: 'Logged in Successfully' })
          })
          .catch(async function () { return done(null, false, { message: 'Wrong Password' }); });
      })
      .catch(async function (error) { 
        return done(error)});
  }));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (id, done) {
  userModel.findById(id, function (err, user) {
    done(err, user);
  });
});

////////////////////

export default passport;