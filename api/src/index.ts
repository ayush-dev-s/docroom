import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './modules/auth/routes.js';
import docsRoutes from './modules/docs/routes.js';
import analyticsRoutes from './modules/analytics/routes.js';
import { config } from './shared/config.js';

const app = express();
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
app.use('/docs', docsRoutes);
app.use('/analytics', analyticsRoutes);

const start = async () => {
  await mongoose.connect(config.MONGO_URI);
  app.listen(config.PORT, () => console.log(`API on :${config.PORT}`));
};

start().catch((e) => {
  console.error(e);
  process.exit(1);
});