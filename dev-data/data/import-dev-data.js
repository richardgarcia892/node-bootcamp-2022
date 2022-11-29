/*
Script to import or delte all data in the database
Data is imported from tours-simple.json

this script must be called with either --import or --delete argument
*/
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const dbConnect = require('../../db/connect');

dotenv.config({ path: './config.env' });
const { DB_TYPE } = process.env;

if (DB_TYPE === 'ATLAS') dbConnect.atlas();
if (DB_TYPE === 'DOCKER') dbConnect.docker();

// Read Json File
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
// Import DATA into DB
const importData = async () => {
  try {
    await Tour.create(tours);
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
