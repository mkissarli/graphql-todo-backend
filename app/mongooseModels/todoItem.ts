import express from 'express';
import mongoose from 'mongoose';
import { userModel } from './user';

export interface TodoItem {
  text: string;
  isCurrent: boolean;
}

export const todoItemSchema = new mongoose.Schema({
  text: String,
  isCurrent: {
    type: Boolean,
    default: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

/*todoItemSchema.methods.getTodoById = function (request: express.Request, response: express.Response) {
  todoItemModel.findById("5d86933813d1ea2cb0d47dc6")
  .then(function (doc) {
    if (doc) {
      response.send(doc);
    }
    else {
      console.log(doc);
      response.send(false);
    }
  }).catch(function(err) {
    console.log(err);
  });
}*/

export const todoItemModel = mongoose.model<TodoItem & mongoose.Document>('TodoItem', todoItemSchema);