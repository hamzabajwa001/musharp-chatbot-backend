// This file will contain the model schema for the registered user

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: [{ sender: String, text: String }]
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // email: { type: String, required: true, unique: true },
    chats: [chatSchema]
  });
  
  const User = mongoose.model('user', userSchema);                  //here 'user' is the collection name and 'User' is the model name.  We have exported it as 'User' from here and can import with any name in whatever file it is required.
  module.exports = User;
