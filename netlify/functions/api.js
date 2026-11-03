// Serverless entry point for Netlify.
//
// Netlify calls a function with an AWS Lambda style event instead of Node's
// req/res, so serverless-http translates both ways. The function is mounted at
// /.netlify/functions/api and basePath strips that prefix again before the
// request reaches Express, which is why netlify.toml maps /api/x to
// /.netlify/functions/api/api/x.
const serverless = require('serverless-http');
const app = require('../../app');
const ensureDatabase = require('../../lib/ensureDb');

const FUNCTION_PREFIX = '/.netlify/functions/api';
const handler = serverless(app, { basePath: FUNCTION_PREFIX });

exports.handler = async function (event, context) {
  // Mongoose keeps sockets open. Without this the platform waits for the event
  // loop to drain and the request times out instead of returning.
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }

  try {
    await ensureDatabase();
  } catch (error) {
    // Same contract as GET /health: 503 with no database detail in the body.
    console.error('Database unavailable:', error.message);
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ status: 'unavailable' })
    };
  }

  return handler(event, context);
};
