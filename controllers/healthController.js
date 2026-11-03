const mongoose = require('mongoose');

// Readiness check for the hosting service. It answers the only question a load
// balancer cares about: can this process reach its database right now? The
// ping is the same command used in Lab 06, and the response carries no host
// name, connection string, or driver message.
module.exports = async function (req, res) {
  res.set('Cache-Control', 'no-store');
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database is not connected');
    }
    await mongoose.connection.db.command({ ping: 1 });
    res.json({ status: 'ok' });
  } catch (error) {
    res.status(503).json({ status: 'unavailable' });
  }
};
