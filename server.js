const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); // Load .env Data as environment variables

const app = require('./app'); // Create and config the app object
const dbConnect = require('./db/connect');

const { DB_TYPE } = process.env;

if (DB_TYPE === 'ATLAS') dbConnect.atlas();
if (DB_TYPE === 'DOCKER') dbConnect.docker();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
