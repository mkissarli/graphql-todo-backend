import express from 'express';
import { ApolloServer, gql, AuthenticationError } from 'apollo-server-express';
import { importSchema } from 'graphql-import'

import Auth from './auth/auth';

import mongoose, { Query } from 'mongoose';
mongoose.connect(`mongodb://localhost/users`);
mongoose.Promise = global.Promise;

import queries from './queries';
import mutations from './mutations';

import jwt from 'jsonwebtoken';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = importSchema('./app/schema.graphql');

const resolvers = {
  Query: queries,
  Mutation: mutations
}

const SECRET_KEY = "secret!";

const app = express()

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    try {
      const obj = jwt.verify(token, SECRET_KEY);
      return {id: obj.id, username: obj.username, todoItems: obj.todoItems};
    } catch (e) {
    }
  }
});

server.applyMiddleware({ app, path: '/graphql' })

app.listen(3000, () => {
  console.log("Main express app is listening to port 3000");
})