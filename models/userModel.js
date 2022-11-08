const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    required: [true, 'passwordConfirm is required'],
    validate: {
      // This only works on SAVE and CREATE methods.
      validator: function(passConfirm) {
        return passConfirm === this.password;
      },
      message: 'password and passwordConfig does not match'
    }
  }
});

userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
