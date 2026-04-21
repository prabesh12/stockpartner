import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import customerRoutes from './routes/customer.routes';
import dashboardRoutes from './routes/dashboard.routes';
import adminRoutes from './routes/admin.routes';
import shopRoutes from './routes/shop.routes';
import salesRoutes from './routes/sales.routes';
import { HealthStatus } from 'shared';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/platform-admin', adminRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/sales', salesRoutes);

app.get('/health', (req, res) => {
  const status: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString()
  };
  res.status(200).json(status);
});

// Centralized error handler should be registered after all routes
app.use(errorHandler);

export default app;
