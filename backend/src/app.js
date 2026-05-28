import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import inventoryOutRoutes from './routes/inventoryOutRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import donationRequestRoutes from './routes/donationRequestRoutes.js';
import productRoutes from './routes/productRoutes.js';
import marketplaceRoutes from './routes/marketplaceRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import impactRoutes from './routes/impactRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

const app = express();

// CORS — accept comma-separated origins (e.g. preview + prod URLs on Vercel).
const corsRaw = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = corsRaw
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / curl / server-to-server requests with no Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health endpoints used by Railway / Render and uptime probes.
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'F.R.E.S.H API berjalan' });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventories', inventoryRoutes);
app.use('/api/inventory-outs', inventoryOutRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/donation-requests', donationRequestRoutes);
app.use('/api/products', productRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/subscription', subscriptionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
