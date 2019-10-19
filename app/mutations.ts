import mongoose, { Query } from 'mongoose';
import { userModel, userSchema } from './mongooseModels/user';
import { todoItemSchema, todoItemModel } from './mongooseModels/todoItem';

import jwt from 'jsonwebtoken';
import Auth from './auth/auth';
import { disconnect } from 'cluster';

const SECRET_KEY = "secret!";

export const mutations = {
  addUser: async function (parent: any, args: { username: string, password: string }, context: any) {
    return await Auth.hashPassword(args.password, 12)
      .then(async function (hash) {
        let response = await userSchema.methods.createNew(args.username, hash);
        if (response.success == true) {
          const token = jwt.sign(
            { username: response.user.username, id: response.user._id },
            SECRET_KEY,
          );
          return {
            code: 200,
            success: response.success,
            message: response.message + hash,
            user: response.user,
            token: token
          }
        } else {
          return {
            code: 200,
            success: response.success,
            message: response.message,
            user: response.user,
            token: ''
          }
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
    return await userSchema.methods.createNewTodoItem(context.id, args.text)
      .then(async function (todoResponse) {
        return {
          code: 200,
          success: todoResponse.success,
          message: todoResponse.message,
          todo: todoResponse.todo,
          user: todoResponse.user
        }
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
    await userModel.findById(context.id)
      .then(async function (doc) {
        doc.todos.pull(args.id);
        doc.save()
      });
    return await todoItemSchema.methods.deleteById(args.id)
      .then(async function (response) {
        return {
          code: 200,
          success: response.success,
          message: response.message,
          //todo: response.todo
        }
      })
      .catch(async function (error) {
        return {
          code: 200,
          success: false,
          message: "Error deleting todo: " + error
        }
      });
  },
  editTodo: async function (parent: any, args: { id: string, text: string }, context: any) {
    Auth.requireAuth(context);
    return await todoItemSchema.methods.editById(args.id, args.text)
      .then(async function (response) {
        return {
          code: 200,
          success: response.success,
          message: response.message,
          todo: response.todo
        }
      })
      .catch(async function (error) {
        return {
          code: 200,
          success: false,
          message: "Error editing todo: " + error
        }
      });
  },
  toggleTodo: async function (parent: any, args: { id: string }, context: any) {
    Auth.requireAuth(context);
    return await todoItemSchema.methods.toggleById(args.id)
      .then(async function (response) {
        return {
          code: 200,
          success: response.success,
          message: response.message,
          todo: response.todo
        }
      })
      .catch(async function (error) {
        return {
          code: 200,
          success: false,
          message: "Error toggling current state of todo: " + error
        }
      });
  },


};

export default mutations;