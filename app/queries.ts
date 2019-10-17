import mongoose, { Query } from 'mongoose';
import { userModel, userSchema } from './mongooseModels/user';
import { todoItemSchema } from './mongooseModels/todoItem';

import jwt from 'jsonwebtoken';
import Auth from './auth/auth';

const SECRET_KEY = "secret!";

export const queries = {
  // Get all users.
  getUsers: async function (_: any, __: any, context: any) {
    //return context.req.user;
    Auth.requireSpecificAuth(context.username, "admin");
    return userModel.find({});
  },
  // Get yourself.
  me: async function (_: any, __: any, context: any) {
    //Auth.requireAuth(context);
    return await userSchema.methods.getUser(context.id);
  },
  // Login and recieve a token, which needs to be put into a header.
  loginUser: async function (parent: any, args: {username: string, password: string}) {
    return await userModel.findOne({ username: args.username })
      .then(async function (doc: any) {
        return await Auth.compare(args.password, doc.password)
          .then(async function () {
            const token = jwt.sign({
              id: doc._id,
              username: doc.username
            },
            SECRET_KEY, { expiresIn: '1y' }
            )
            return {
              status: 200,
              message: "Login successful, token created.",
              success: true,
              user: doc,
              token: token
            };
          })
          .catch(async function () { 
            return { 
              status: 200,
              success: false,
              message: "User login failed, no token will be generated.",
              token: null,
              user: null
            };
          })
          .catch(async function () {
            return {
              status: 200,
              success: false,
              message: "User login failed, no token will be generated.",
              token: null,
              user: null
            };
          });
      })
  }
};

export default queries;