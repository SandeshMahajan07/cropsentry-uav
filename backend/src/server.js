import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/schema.js';
import { seedData } from './db/seed.js';

import detectionsRouter from './routes/detections.js';
import dronesRouter from './routes/drones.js';
import configRouter from './routes/config.js';
import recipientsRouter from './routes/recipients.js';
import analyticsRouter from './routes/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');
const frontendDist = path.resolve(__dirname, '../../frontend/dist');

// Ensure DB is initialized and seeded on startup
initializeDatabase();
seedData();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Generous payload limit to accommodate ESP32 base64 snapshot images
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads serving
app.use('/uploads', express.static(uploadsDir));

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'CropSentry UAV Patrol System',
    drone_id: 'CROPSENTRY_01',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/detections', detectionsRouter);
app.use('/api/v1/drones', dronesRouter);
app.use('/api/v1/config', configRouter);
app.use('/api/v1/recipients', recipientsRouter);
app.use('/api/v1/analytics', analyticsRouter);

// Serve Frontend Static Build if present (Production / Render deployment)
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Fallback 404 handler for unmatched APIs
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n========================================================`);
  console.log(`🛸 CropSentry Patrol Server running on port ${PORT}`);
  console.log(`📡 Ingestion endpoint: http://localhost:${PORT}/api/v1/detections`);
  console.log(`📊 Health check:      http://localhost:${PORT}/api/health`);
  console.log(`========================================================\n`);
});

export default app;
