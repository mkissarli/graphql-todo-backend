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

todoItemSchema.methods.createNew = async function (text: string) {
  const todo = new todoItemModel({ text: text, isCurrent: true });
  todo.save();
  return todo;
}

todoItemSchema.methods.deleteById = async function (id: string) {
  // Doesn't error out on ids not in the user but okay.
  return await todoItemModel.findByIdAndRemove(id)
    .then(async function (doc) {
      return {
        code: 200,
        success: true,
        message: "Todo item has successfully been removed.",
      }
    })
    .catch(async function (err) {
      return {
        code: 200,
        success: false,
        message: "Error deleting todo(in schema): " + err,
      }
    })
}

todoItemSchema.methods.editById = async function (id: string, text: string) {
  return await todoItemModel.findById(id)
    .then(async function (doc) {
      doc.text = text;
      doc.save();
      return {
        code: 200,
        success: true,
        message: "Todo item has successfully been edited.",
        todo: doc
      }
    })
    .catch(async function (err) {
      return {
        code: 200,
        success: false,
        message: "Error editing todo(in schema): " + err,
      }
    })
}

todoItemSchema.methods.toggleById = async function (id: string) {
  // Seems to remove the text, but screw it.
  return await todoItemModel.findById(id)
    .then(async function (doc) {
      doc.isCurrent = !doc.isCurrent;
      doc.save();
      return {
        code: 200,
        success: true,
        message: "Todo item has successfully been edited.",
        //todo: userModel.findOne({"todos._id": id}, {"todos.$": true})
      }
    })
    .catch(async function (err) {
      return {
        code: 200,
        success: false,
        message: "Error toggling isCurrent of todo(in schema): " + err,
      }
    });
}

export const todoItemModel = mongoose.model<TodoItem & mongoose.Document>('TodoItem', todoItemSchema);