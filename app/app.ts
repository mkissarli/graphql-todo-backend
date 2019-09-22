import express, { response } from 'express';

import passport from './passportStrategy';
import session from 'express-session';

import mongoose, { Query } from 'mongoose';

import { userModel, userSchema } from './mongooseModels/user';
import { todoItemSchema } from './mongooseModels/todoItem';

mongoose.connect(`mongodb://localhost/users`);
mongoose.Promise = global.Promise; 

import { ApolloServer, gql } from 'apollo-server';

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
    password: String
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

  type AddUserMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    user: User
  }

  type Mutation {
    addUser(username: String!, password: String!): AddUserMutationResponse!
  }


`;

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    getUsers: function () { return userModel.find({}); },
  },
  Mutation: {
    addUser: async function (parent, args) {
      let response = await userSchema.methods.createNew(args.username, args.password);
      console.log(response)
      return {
        code: 200,
        success: true,
        message: response.message,
        user: response.user
      }
    }
  }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen(3000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});