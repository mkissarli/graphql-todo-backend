import express from 'express';
import mongoose from 'mongoose';
import { TodoItem, todoItemSchema, todoItemModel } from './todoItem';

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
  return userModel.findOne({username: username})
    .then(async function(doc){
      if(!doc){
        const createdUser = new userModel({username: username, password: password});
        return createdUser.save()
          .then(function (savedUser) {
            return {
              message: ("Created user: " + username + "."),
              user: savedUser,
              success: true
            }
          })
      } else {
        return {
          message: "Unable to create user: " + username + " as there is already a user with this name.",
          user: null,
          success: false
        }
      }
    })
    .catch(async function (err) {
      return {
        message: "There was an error: " + err,
        user: null,
        success: false
      }
    })
}

userSchema.methods.getUser = async function (id: string) {
  return await userModel.findById(id)
    .then(async function (doc) {
      var todos: any[] = [];
      doc.todos.forEach(function (i) {
        todos.push(todoItemModel.findById(i));
      });
      return {
        message: "Found user.",
        user: doc,
        todos: todos,
        success: true,
        code: 200  
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
      if (newTodo.todo) {
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

export const userModel = mongoose.model<User & mongoose.Document>('User', userSchema);