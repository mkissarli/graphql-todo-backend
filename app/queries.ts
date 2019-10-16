import mongoose, { Query } from 'mongoose';
import { userModel, userSchema } from './mongooseModels/user';
import { todoItemSchema } from './mongooseModels/todoItem';

import jwt from 'jsonwebtoken';
import Auth from './auth/auth';

const SECRET_KEY = "secret!";

export const queries = {
  getUsers: function (_, args, context) {
    //return context.req.user;
    if (!context.user) {
      throw new Error('You are not authorized!')
    }
    return userModel.findById(context.user._id);
  },
  me: (_, __, context) => {
    if (!context) {
      throw new Error('You are not authorized!')
    }

    return context;
  },
  loginUser: async function (parent: any, args: any) {
    return await userModel.findOne({ username: args.username })
      .then(async function (doc) {
        return await Auth.compare(args.password, doc.password)
          .then(async function () {
            const token = jwt.sign({
              id: doc._id,
              username: doc.username
            },
            SECRET_KEY, { expiresIn: '1y' }
            )
            return {token: token};
          })
          .catch(async function () { return { message: "password failed:" }; })
          .catch(async function () { return { message: "user failed" }; });
      })
  }
};



export default queries;