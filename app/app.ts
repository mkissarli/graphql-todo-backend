import express from 'express';

import passport from './passportStrategy';
import session from 'express-session';

import mongoose, { Query } from 'mongoose';

import { userModel, userSchema } from './mongooseModels/user';
import { todoItemSchema } from './mongooseModels/todoItem';

mongoose.connect(`mongodb://localhost/users`);

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
    users: [User]
  }
`;

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    users: () => userModel.find({}),
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen(3000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
  console.log(userModel.find({}));
});