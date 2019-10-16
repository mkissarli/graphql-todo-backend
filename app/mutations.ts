import mongoose, { Query } from 'mongoose';
import { userModel, userSchema } from './mongooseModels/user';
import { todoItemSchema } from './mongooseModels/todoItem';

import jwt from 'jsonwebtoken';
import Auth from './auth/auth';

const SECRET_KEY = "secret!";

export const mutations = {
  addUser: async function (parent: any, args: any, context: any) {
    //console.log(context);
    return await Auth.hashPassword(args.password, 12)
      .then(async function (hash) {
        let response = await userSchema.methods.createNew(args.username, hash);
        const token = jwt.sign(
          { username: response.user.username, id: response.user._id },
          SECRET_KEY,
        );
        context.req.send(token);
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
};

export default mutations;