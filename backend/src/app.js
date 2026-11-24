const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { LOCAL_UPLOAD_ROOT } = require('./services/cloudinary.service');
const { getKeepAliveStatus } = require('./services/keepAlive.service');
const { mongoSanitizeMiddleware, apiRateLimiter } = require('./middlewares/security.middleware');
const { notFoundHandler, globalErrorHandler } = require('./middlewares/error.middleware');
const { sendSuccess } = require('./utils/apiResponse');
const { getMessage } = require('./i18n/messages');

const authRoutes = require('./routes/auth.routes');
const contentRoutes = require('./routes/content.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const materialRoutes = require('./routes/material.routes');
const customDesignRoutes = require('./routes/customDesign.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');
const mediaRoutes = require('./routes/media.routes');

const app = express();

// Security & HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.CORS_ORIGIN === '*') {
        return callback(null, true);
      }
      const allowedList = env.CORS_ORIGIN.split(',').map((s) => s.trim());
      const isVercelOrRenderDomain =
        /^https?:\/\/([a-z0-9-]+\.)*vercel\.app$/i.test(origin) ||
        /^https?:\/\/([a-z0-9-]+\.)*onrender\.com$/i.test(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

      if (allowedList.includes(origin) || isVercelOrRenderDomain) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parser with payload limit suitable for JSON & base64 preview images
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Normalize duplicate slashes (e.g. //auth/login -> /auth/login) and auto-prefix /api when omitted by client env vars
const DIRECT_API_PREFIXES = [
  '/auth',
  '/content',
  '/categories',
  '/products',
  '/materials',
  '/custom-designs',
  '/orders',
  '/admin',
  '/media',
  '/health',
  '/ping',
];
app.use((req, _res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/{2,}/g, '/');
  }
  const pathOnly = req.url.split('?')[0];
  if (
    !pathOnly.startsWith('/api') &&
    DIRECT_API_PREFIXES.some((prefix) => pathOnly === prefix || pathOnly.startsWith(`${prefix}/`))
  ) {
    req.url = `/api${req.url}`;
  }
  next();
});

// Static serving for Smart Local Fallback uploads (/uploads/landing/..., /uploads/products/..., etc.)
app.use('/uploads', express.static(LOCAL_UPLOAD_ROOT));

// NoSQL Injection sanitization & Rate limiting
app.use(mongoSanitizeMiddleware);
app.use('/api', apiRateLimiter);

// Health Check & Render Anti-Sleep Keep-Alive Endpoints (/api/health & /api/ping)
const healthCheckHandler = (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('HEALTH_OK', {}, req),
    data: {
      status: 'ok',
      awakeStatus: 'awake',
      uptime: Math.round(process.uptime()),
      intervalMinutes: env.KEEP_ALIVE_INTERVAL_MINUTES,
      keepAlive: getKeepAliveStatus(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
};

// Root & Favicon handlers (Prevent Render health probe HEAD/GET / and browser /favicon.ico 404 logs)
app.get('/', (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    message: 'WAVO × ECO GREEN Backend API Server is running',
    data: {
      service: 'dtu-upcycled-3d-backend',
      status: 'ok',
      healthEndpoint: '/api/health',
      apiBase: '/api',
      timestamp: new Date().toISOString(),
    },
  });
});

app.get('/favicon.ico', (_req, res) => res.status(204).end());

app.get('/api/health', healthCheckHandler);
app.get('/api/ping', healthCheckHandler);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/custom-designs', customDesignRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', mediaRoutes);

// 404 & Global Error Handler
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
