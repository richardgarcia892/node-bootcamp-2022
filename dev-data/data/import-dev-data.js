/*
Script to import or delte all data in the database
Data is imported from tours-simple.json

this script must be called with either --import or --delete argument
*/
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');
const dbConnect = require('../../db/connect');
const authController = require('../../controllers/authController');

dotenv.config({ path: './.env' });
const { DB_TYPE } = process.env;

dbConnect.atlas();
if (DB_TYPE === 'ATLAS') dbConnect.atlas();
if (DB_TYPE === 'DOCKER') dbConnect.docker();

// Read Json File
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
// Import DATA into DB
const importData = async () => {
  try {
    users.forEach(async user => {
      const newUser = await User.create({ ...user, password: 'test1234', passwordConfirm: 'test1234' });
      console.log({ user: user._id, newUser: newUser._id });
    });
    await Tour.create(tours);
    await Review.create(reviews);
    console.log('Data Successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete All Data From DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully Deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Console log de arguments to create an small CLI for this script
// console.log(process.argv);

if (!process.argv[2]) console.log('No argument specified, use either --import or --delete');
if (process.argv[2] === '--import') importData();
if (process.argv[2] === '--delete') deleteData();
