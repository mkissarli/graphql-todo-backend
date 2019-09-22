import express from 'express';
import mongoose from 'mongoose';
import { TodoItem, todoItemSchema, todoItemModel } from './todoItem';
import { request } from 'https';

export interface User {
  username: string,
  password: string
  todos: [TodoItem]
}

export const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  todos: {
    type: [todoItemSchema],
    //default: new Array
  },
  created: {
    type: Date,
    default: Date.now
  }
});

userSchema.methods.createNew = function (request: express.Request, response: express.Response) {
  let userData: User = request.body;
  userModel.exists(userData, function (err, done) {
    if (!done) {
      const createdUser = new userModel(userData);
      createdUser.save()
        .then(savedUser => {
          response.send(savedUser);
        });
    }
    else {
      response.send({ message: "Already have a user with that name." });
    }
  });

};

userSchema.methods.createNewTodoItem = function (request: express.Request, response: express.Response) {
  //console.log(request.session);
  userModel.findOne({ username: request.session.passport.user })
    .then(function (doc) {
      let newTodo = new todoItemModel({ text: request.body.text });

      if (doc) {
        doc.todos.push(newTodo);
        doc.save();
        response.send(newTodo);
      }
      else {
        response.send(false);
      }

    }).catch(function (err) {
      console.log(err);
    });
}

userSchema.methods.getTodoById = function (request: express.Request, response: express.Response) {
  userModel.findOne({username: request.session.passport.user, "todos._id": mongoose.Types.ObjectId(request.body.id)})
  .then(function (doc) {
    if (doc) {
      for(var item of doc.todos){
        if(item._id == request.body.id){
          response.send(item);
        }
      }
    }
    else {
      console.log(doc);
      response.send(false);
    }
  }).catch(function(err) {
    console.log(err);
  });
}

export const userModel = mongoose.model<User & mongoose.Document>('User', userSchema);