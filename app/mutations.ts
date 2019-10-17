import mongoose, { Query } from 'mongoose';
import { userModel, userSchema } from './mongooseModels/user';
import { todoItemSchema } from './mongooseModels/todoItem';

import jwt from 'jsonwebtoken';
import Auth from './auth/auth';

const SECRET_KEY = "secret!";

export const mutations = {
  addUser: async function (parent: any, args: { username: string, password: string }, context: any) {
    return await Auth.hashPassword(args.password, 12)
      .then(async function (hash) {
        let response = await userSchema.methods.createNew(args.username, hash);
        const token = jwt.sign(
          { username: response.user.username, id: response.user._id },
          SECRET_KEY,
        );
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
  addTodo: async function (parent: any, args: { text: string }, context: any) {
    Auth.requireAuth(context);
    return await userModel.findById(context.id)
      .then(async function (doc) {
        return await userSchema.methods.createNewTodoItem(context.id, args.text)
          .then(async function (todoResponse) {
            return {
              code: 200,
              success: todoResponse.success,
              message: todoResponse.message,
              todoItem: todoResponse.todoItem,
              user: todoResponse.user
            }
          }
          )
      })
      .catch(async function (err) {
        return {
          code: 200,
          success: false,
          message: "No user found with that id.",
          user: null
        }
      });
  },
  deleteTodo: async function (parent: any, args: { id: string }, context: any) {
    Auth.requireAuth(context);
  },
  editTodo: async function (parent: any, args: { id: string, text: string }, context: any) {
    Auth.requireAuth(context);
  },


};

export default mutations;