const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const app = express();

if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}
// A serverless container has no client socket, so Express cannot always derive
// req.ip. The rate limiters key their counters by it, so fall back to the
// address the proxy forwards instead of leaving it undefined.
app.use(function (req, res, next) {
  if (!req.ip) {
    const forwarded = req.headers['x-forwarded-for'];
    // 0.0.0.0 keeps the limiter's IP validation happy when no header is present;
    // those requests share one bucket instead of crashing the limiter.
    req.ip = forwarded ? forwarded.split(',')[0].trim() : '0.0.0.0';
  }
  next();
});
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '32kb' }));
// Public readiness check. It sits before the root route and the resource
// routers so it can answer even while the database is unavailable.
app.get('/health', require('./controllers/healthController'));
app.get('/', function (req, res) {
  res.json({ message: 'Portfolio and Blog API' });
});
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/blog', require('./routes/postRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use(require('./middleware/notFound'));
app.use(require('./middleware/errorHandler'));

module.exports = app;
