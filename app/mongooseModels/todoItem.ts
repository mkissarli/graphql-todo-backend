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

todoItemSchema.methods.deleteById = async function (id: string){
  // Doesn't error out on ids not in the user but okay.
  return await userModel.update({}, {$pull: {"todos": {_id: id}}})
  .then(async function (doc){
    return {
      code: 200,
      success: true,
      message: "Todo item has successfully been removed.",
    }
  })
  .catch(async function (err){
    return {
      code: 200,
      success: false,
      message: "Error deleting todo(in schema): " + err,
      todo: doc
    }
  })
}

todoItemSchema.methods.editById = async function (id: string, text: string){
  // Seems to remove the text, but screw it.
  return await userModel.findOneAndUpdate({"todos._id": id}, {"$set": {"todos.$": {_id: id, text: text}}})
  .then(async function (doc){
    return {
      code: 200,
      success: true,
      message: "Todo item has successfully been edited.",
      todo: doc
    }
  })
  .catch(async function (err){
    return {
      code: 200,
      success: false,
      message: "Error deleting todo(in schema): " + err,
    }
  })
}

export const todoItemModel = mongoose.model<TodoItem & mongoose.Document>('TodoItem', todoItemSchema);