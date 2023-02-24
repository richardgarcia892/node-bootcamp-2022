const mongoose = require('mongoose');

const { DB_TYPE } = process.env;
/**
 * @name docker
 * @description connect to docker database using parameter from config.env docker DB.
 */
exports.docker = () => {
  const { DB_USER, DB_PASS, DB_HOST, DB_NAME, DB_PORT } = process.env;
  // Set authSource=admin to authenticate against admin database in mongo server
  const dbConString = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;
  const dbConOptions = {
    useNewUrlParser: true
    // useCreateIndex: true,
    // useFindAndModify: false
  };
  mongoose.connect(dbConString, dbConOptions).then(() => console.log(DB_TYPE, 'Connection successfull'));
  // .catch(err => console.log(err.message));
};

/**
 * @name atlas
 * @description connect to atlas database using parameter from config.env atlas DB.
 */
exports.atlas = () => {
  const { ATLAS_USER, ATLAS_PASS, ATLAS_CLUSTER, ATLAS_HOST } = process.env;
  // Set authSource=admin to authenticate against admin database in mongo server
  const dbConString = `mongodb+srv://${ATLAS_USER}:${ATLAS_PASS}@${ATLAS_CLUSTER}.${ATLAS_HOST}/?retryWrites=true&w=majority`;
  const dbConOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  mongoose.connect(dbConString, dbConOptions).then(() => console.log(DB_TYPE, 'Connection successfull'));
  // .catch(err => console.log(err.message));
};
