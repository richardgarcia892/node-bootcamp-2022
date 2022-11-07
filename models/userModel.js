const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required']
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'invalid email']
  },
  photo: { type: String },
  password: {
    type: String,
    required: [true, 'password is required'],
    minLength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, 'passwordConfirm is required']
  }
});

const User = mongoose.model('User', userSchema);

module.export = User;
