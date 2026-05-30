const serverless = require('serverless-http');
const app = require('./app');

// Wrap the Express app for AWS Lambda + API Gateway
// serverless-http handles the translation between API Gateway events and Express req/res
module.exports.handler = serverless(app);
