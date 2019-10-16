import express from 'express';
import { ApolloServer, gql, AuthenticationError } from 'apollo-server-express';
import { importSchema } from 'graphql-import'

import passport from './auth/passportStrategy';
import jwt from 'jsonwebtoken';
import cookieParser from "cookie-parser";

import uuid from 'uuid';
import bodyParser from 'body-parser';

import mongoose, { Query } from 'mongoose';
mongoose.connect(`mongodb://localhost/users`);
mongoose.Promise = global.Promise;

import queries from './queries';
import mutations from './mutations';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = importSchema('./app/schema.graphql');

const resolvers = {
  Query: queries,
  Mutation: mutations
}

const SECRET_KEY = "secret";

const app = express();

app.use(cookieParser());

app.post('/signup', passport.authenticate('signup', { session: false }), async function (req, res, next) {
  res.json({
    message: 'Signup successful',
    user: req.user
  });
});

app.post('/login', async function (req: express.Request, res: express.Response, next) {
  passport.authenticate('login', { successRedirect: '/graphql', failureRedirect: '/login' }, async function (err, user, info) {
    try {
      if (err || !user) {
        const error = new Error('An Error occured')
        return next(error);
      }
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error)
        //We don't want to store the sensitive information such as the
        //user password in the token so we pick only the email and id
        const body = { _id: user._id, username: user.username, todoItems: user.todoItems };

        //Send back the token to the user
        return res.json({ body });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

app.use((req, _, next) => {
  const accessToken = req.cookies["access-token"];
  try {
    const data = jwt.verify(accessToken, SECRET_KEY) as any;
    (req as any)._id = data._id;
  } catch {}
  next();
});

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async (req, res) => ({ req, res })
});

server.applyMiddleware({ app, path: '/graphql' })

app.listen(3000, () => {
  console.log("Main express app is listening to port 3000");
})