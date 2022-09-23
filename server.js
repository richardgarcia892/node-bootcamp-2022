const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); // Load .env Data as environment variables

const app = require('./app'); // Create and config the app object

const { DB_USER, DB_PASS, DB_HOST, DB_NAME, DB_PORT } = process.env;

// Set authSource=admin to authenticate against admin database in mongo server
const dbConString = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;

const dbConOptions = {
  useNewUrlParser: true
  // useCreateIndex: true,
  // useFindAndModify: false
};

mongoose
  .connect(dbConString, dbConOptions)
  .then(() => console.log('Connection successfull'))
  .catch(err => console.log(err.message));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
