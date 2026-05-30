const serverlessExpress = require('@vendia/serverless-express');
const app = require('./app'); // Your existing Express app

// Wrap the Express app so AWS Lambda can process API Gateway requests through it
exports.handler = serverlessExpress({ app });
