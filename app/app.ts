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
import jwt from 'jsonwebtoken';
import { tokenize } from 'protobufjs';

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
    loginUser(username: String!, password: String!): String
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
    token: String
  }


  type Mutation {
    addUser(username: String!, password: String!): UserMutationResponse!
    ##loginUser(username: String!, password: String!): UserMutationResponse!
    
  }
`;

const SECRET_KEY = 'secret!';

function requireLogin(token: string) {
  try {
    return { id: _id, username: username } = jwt.verify(token.split(' ')[1], SECRET_KEY)
  } catch (e) {
    throw new AuthenticationError(
      'Authentication token is invalid, please log in',
    )
  }
}

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    getUsers: function () { return userModel.find({}); },
    loginUser: async function (parent: any, args: any) {
      return await userModel.findOne({ username: args.username })
        .then(async function (doc) {
          return await Auth.compare(args.password, doc.password)
            .then(async function(){return "Password match";})
            .catch(async function(){return "password failed:" + doc;});
        })
        .catch(async function(){return "user failed";});
      }
  },
  Mutation: {
    addUser: async function (parent: any, args: any) {
      //console.log(context);
      return await Auth.hashPassword(args.password, 12)
        .then(async function (hash) {
          let response = await userSchema.methods.createNew(args.username, hash);
          const token = jwt.sign(
            { username: response.user.username, id: response.user._id },
            SECRET_KEY,
          )
          return {
            code: 200,
            success: true,
            message: response.message,
            user: response.user,
            token: token
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
    },

  }
}

const app = express();

app.use(passport.initialize());
app.use(passport.session());

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || ''

    return token;
  }
});

server.applyMiddleware({ app, path: '/graphql' })

app.listen(3000, () => {
  console.log("Main express app is listening to port 3000");
})