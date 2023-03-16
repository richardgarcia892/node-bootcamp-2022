const dotenv = require('dotenv');

dotenv.config({ path: './.env' }); // Load .env Data as environment variables

const app = require('./app'); // Create and config the app object
const dbConnect = require('./db/connect');

const { DB_TYPE } = process.env;

if (DB_TYPE === 'ATLAS') dbConnect.atlas();
if (DB_TYPE === 'DOCKER') dbConnect.docker();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Use event listener to handle all unhanledRejection, close server and shut down app gracefully.
process.on('unhandledRejection', err => {
  console.error('unhandledRejection', err.name, err.message);
  console.error('unhandledRejection', 'shutting down server');
  server.close(() => {
    console.error('Server shutdown OK, exiting the application');
    process.exit(1);
  });
});
