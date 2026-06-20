import express from 'express';
import dotenv from 'dotenv';
import client from 'prom-client';
import authRoutes from './routes/auth.routes';
import { registerWithEureka } from './config/eureka';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

// HTTP request counter
const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

app.use(express.json());

// Middleware to track metrics
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode.toString(),
    };
    end(labels);
    httpRequestTotal.inc(labels);
  });
  next();
});

app.use('/api/auth', authRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'UP' });
});

// Prometheus metrics endpoint
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
  registerWithEureka();
});
