import express from 'express';

import { ApolloServer, gql, AuthenticationError } from 'apollo-server-express';

import passport from './auth/passportStrategy';

import mongoose, { Query } from 'mongoose';

import { userModel, userSchema } from './mongooseModels/user';
import { todoItemSchema } from './mongooseModels/todoItem';

mongoose.connect(`mongodb://localhost/users`);
mongoose.Promise = global.Promise;

import Auth from './auth/auth';

import uuid from 'uuid/v4';
import session from 'express-session';
import redis from 'redis';
var redisStore = require('connect-redis')(session);

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  type TodoItem {
    id: ID!
    text: String
    isCurrent: Boolean
    created: String
  }

  type User {
    id: ID!
    username: String
    todos: [TodoItem]
    created: String ## Unix Timestamp
  }

  type Query {
    getUsers: [User]
  }

  interface MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  type UserMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    user: User
  }

  type Mutation {
    addUser(username: String!, password: String!): UserMutationResponse!
    loginUser(username: String!, password: String!): UserMutationResponse!
  }


`;

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    getUsers: function () { return userModel.find({}); },
  },
  Mutation: {
    addUser: async function (parent: any, args: any) {
      return await Auth.hashPassword(args.password, 12)
        .then(async function (hash) {
          let response = await userSchema.methods.createNew(args.username, hash);
          return {
            code: 200,
            success: true,
            message: response.message,
            user: response.user
          }
        })
        .catch(async function (error) {
          // Throw an error
          return {
            code: 200,
            success: false,
            message: "Unable to hash password:" + error,
            user: null
          }
        })
    }
  }
}

const redisClient = redis.createClient();

redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});

const app = express();
app.use(session({
  genid: (req) => {
    return uuid()
  },
  store: new redisStore({ host: 'localhost', port: 6379, client: redisClient }),
  name: '_redisDemo',
  secret: "testytestpassword",
  resave: false,
  cookie: { secure: false, maxAge: 60000 }, // Set to secure:false and expire in 1 minute for demo purposes
  saveUninitialized: true
}));

app.use(passport.initialize())
app.use(passport.session())

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app, path: '/graphql' })

app.listen(3000, () => {
  console.log("Main express app is listening to port 3000");
})