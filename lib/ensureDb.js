// Connection cache for the serverless deployment.
//
// A hosting platform may freeze an idle function instance, and Atlas closes
// sockets that stay quiet, so "we connected once" is not enough: the readyState
// is checked on every request and a fresh connection is opened when the old one
// is gone. Locally this module is unused - server.js connects once at startup.
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

function store() {
  if (!global.__lab20Connection) {
    global.__lab20Connection = { promise: null };
  }
  return global.__lab20Connection;
}

mongoose.connection.on('disconnected', function () {
  store().promise = null;
});

module.exports = function ensureDatabase() {
  const cache = store();

  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }
  // 2 means a connection attempt is already in flight; anything else means the
  // cached promise points at a connection that no longer exists.
  if (mongoose.connection.readyState !== 2) {
    cache.promise = null;
  }
  if (!cache.promise) {
    cache.promise = connectDB().then(function () {
      return mongoose.connection;
    });
  }

  return cache.promise.catch(function (error) {
    cache.promise = null;
    throw error;
  });
};
