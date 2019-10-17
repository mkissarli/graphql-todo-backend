import express from 'express';
import mongoose from 'mongoose';
import { TodoItem, todoItemSchema, todoItemModel } from './todoItem';
import { request } from 'https';

export interface User {
  username: string,
  password: string
  todos: [string]
}

export const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  todos: [String],
  created: {
    type: Date,
    default: Date.now
  }
});

userSchema.methods.createNew = async function (username: String, password: String) {
  let userData = { username: username, password: password };

  return userModel.exists(userData)
    .then(async function (done) {
      if (!done) {
        const createdUser = new userModel(userData);
        return createdUser.save()
          .then(function (savedUser) {
            return {
              message: ("Created user: " + username + "."),
              user: savedUser
            }
          })
      }
      else {
        return {
          message: "Unable to create user: " + username + " as there is already a user with this name.",
          user: null
        }
      }
    })
    .catch(async function (err) {
      return {
        message: "There was an error: " + err,
        user: null
      }
    })
}

userSchema.methods.createNewTodoItem = async function (userId: string, text: string) {
  //console.log(request.session);
  return await userModel.findById(userId)
    .then(async function (doc) {
      const newTodo = await todoItemSchema.methods.createNew(text)
        .then(async function (todoDoc) {
          return {
            code: 200,
            todo: todoDoc,
            message: "Todo successfully added.",
            success: true
          }
        }).catch(async function (err) {
          return {
            code: 200,
            todo: null,
            message: "There's been an error adding the todo item: " + err,
            success: false
          }
        })
      if(newTodo.todo){
        doc.todos.push(newTodo.todo._id);
        doc.save();
      }
      return {
        todo: newTodo.todo,
        message: newTodo.message,
        success: newTodo.success,
        user: doc
      }
    })

    .catch(async function (err) {
      return {
        message: err,
        success: false
      }
    });
}
//userSchema.methods.createNewTodoItem = async function (text: string){
//userModel.findOne({})
//}

userSchema.methods.getTodoById = function (request: express.Request, response: express.Response) {
  userModel.findOne({ username: request.session.passport.user, "todos._id": mongoose.Types.ObjectId(request.body.id) })
    .then(function (doc) {
      if (doc) {
        for (var item of doc.todos) {
          if (item._id == request.body.id) {
            response.send(item);
          }
        }
      }
      else {
        console.log(doc);
        response.send(false);
      }
    }).catch(function (err) {
      console.log(err);
    });
}

export const userModel = mongoose.model<User & mongoose.Document>('User', userSchema);