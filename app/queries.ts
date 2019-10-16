import mongoose, { Query } from 'mongoose';
import { userModel, userSchema } from './mongooseModels/user';
import { todoItemSchema } from './mongooseModels/todoItem';

import jwt from 'jsonwebtoken';
import Auth from './auth/auth';

const SECRET_KEY = "secret!";
const REFRESH_TOKEN_SECRET = "asdkljlaksjdfklajsdl";

export const queries = {
  getUsers: function (_, args, { req }) {
    //return context.req.user;
    return userModel.findById(req._id);
  },
  me: (_, __, { req }) => {
      if (!req._id) {
        return null;
      }

      return userModel.findById(req._id);
  },
  loginUser: async function (parent: any, args: any, { res }) {
    return await userModel.findOne({ username: args.username })
      .then(async function (doc) {
        return await Auth.compare(args.password, doc.password)
          .then(async function () {
            const refreshToken = jwt.sign(
              { _id: doc.id, username: args.username },
              REFRESH_TOKEN_SECRET,
              {
                expiresIn: "7d"
              }
            );
            const accessToken = jwt.sign({ _id: doc.id }, SECRET_KEY, {
              expiresIn: "15min"
            });
      
            res.cookie("refresh-token", refreshToken);
            res.cookie("access-token", accessToken);
      
            return doc;
          })
          .catch(async function () { return { message: "password failed:" }; });
      })
      .catch(async function () { return { message: "user failed" }; });
  }
};

export default queries;