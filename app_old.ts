import express from 'express';
import passport from './app/passportStrategy';
import session from 'express-session';

import mongoose, { Query } from 'mongoose';
import { userModel, userSchema } from './app/mongooseModels/user';
import { todoItemSchema } from './app/mongooseModels/todoItem';

mongoose.connect(`mongodb://localhost/users`);

const app: express.Application = express();
app.use(passport.initialize());
app.use(passport.session());
//app.use(app.router);
app.use(express.json());
app.use(session({
  secret: 'testytesty',
  resave: true,
  saveUninitialized: true,
}));

app.post('/register', function (request: express.Request, response: express.Response) {
  //console.log(request.body);
  let newUser: any = userSchema.methods.createNew(request, response);
});

app.get('/login',
  passport.authenticate('local'),
  function (request: express.Request, response: express.Response) {
    //request.session.user = request.session.passport.user;
    //console.log(request.session);
    // If this function gets called, authentication was successful.
    // `request.user` contains the authenticated user.
    response.redirect('/user/' + request.session.passport.user + '/todos');
  });

app.get('/user/{user}/todos', function (request: express.Request, response: express.Response) {

});

app.post('/todos/new', function (request: express.Request, response: express.Response) {
  //console.log(request.session);
  userSchema.methods.createNewTodoItem(request, response);
});

app.get('/todos/get', function (request: express.Request, response: express.Response){
  userSchema.methods.getTodoById(request, response);
});

app.get('/fail', function (request: express.Request, response: express.Response) {
  response.send('no');
});

app.listen(3000);
