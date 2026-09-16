import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import apiRoutes from './server/routes.ts';
import { mongoUserService } from './server/mongodb.ts';
import { authenticate } from './server/auth.ts';
import { createServer as createViteServer } from 'vite';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize MongoDB Connection (retries, pooling, index verification)
  await mongoUserService.initConnection();

  // Request parsers & cookie handling
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Attach session authentication to all incoming requests
  app.use(authenticate);

  // Basic security and request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      if (req.path.startsWith('/api')) {
        const duration = Date.now() - start;
        console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
      }
    });
    next();
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    const groqKey = process.env.GROQ_API_KEY;
    const isConfigured = !!(groqKey && groqKey !== 'MY_GROQ_API_KEY' && groqKey.trim().length > 10);
    res.json({
      status: 'ok',
      service: 'KanyaKriti Core Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      groqConfigured: isConfigured,
      groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      groqSttModel: process.env.GROQ_STT_MODEL || 'whisper-large-v3',
      mongoStatus: mongoUserService.status,
      mongoDatabase: process.env.MONGODB_DB_NAME || 'kanyakriti_db',
    });
  });

  // Mount REST API routes
  app.use('/api', apiRoutes);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KanyaKriti] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting KanyaKriti server:', err);
  process.exit(1);
});
