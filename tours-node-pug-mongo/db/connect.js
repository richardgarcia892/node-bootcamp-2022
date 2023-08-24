const mongoose = require('mongoose');

const { DB_TYPE } = process.env;

const docker = () => {
  const { DB_USER, DB_PASS, DB_HOST, DB_NAME, DB_PORT } = process.env;
  // Set authSource=admin to authenticate against admin database in mongo server
  const dbConString = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;
  const dbConOptions = {
    useNewUrlParser: true
    // useCreateIndex: true,
    // useFindAndModify: false
  };
  return { dbConString, dbConOptions };
};

const atlas = () => {
  const { ATLAS_USER, ATLAS_PASS, ATLAS_CLUSTER, ATLAS_HOST } = process.env;
  // Set authSource=admin to authenticate against admin database in mongo server
  const dbConString = `mongodb+srv://${ATLAS_USER}:${ATLAS_PASS}@${ATLAS_CLUSTER}.${ATLAS_HOST}/?retryWrites=true&w=majority`;
  const dbConOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };
  return { dbConString, dbConOptions };
};

exports.connect = () => {
  let dbConnectParams;
  if (DB_TYPE === 'ATLAS') dbConnectParams = atlas();
  if (DB_TYPE === 'DOCKER') dbConnectParams = docker();
  mongoose
    .connect(dbConnectParams.dbConString, dbConnectParams.dbConOptions)
    .then(() => console.log(DB_TYPE, 'Connection successful'))
    .catch(err => {
      console.error(err.message);
      throw err;
    });
};
