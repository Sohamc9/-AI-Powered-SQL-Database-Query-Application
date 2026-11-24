import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { healthRouter } from './routes/health.js';
import { schemaRouter } from './routes/schema.js';
import { queryRouter } from './routes/query.js';
import { aiRouter } from './routes/ai.js';
import { dbManager } from './db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Initialize SQLite demo database
dbManager.init();

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/schema', schemaRouter);
app.use('/api/query', queryRouter);
app.use('/api/ai', aiRouter);

// Serve client in production if built
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      // In development, client runs on Vite port
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>QueryPilot API</title></head>
          <body style="font-family: system-ui; background: #0f172a; color: #f8fafc; padding: 2rem;">
            <h2>QueryPilot Backend API Server is running.</h2>
            <p>Port: ${config.port}</p>
            <p>Frontend development server runs on <a style="color: #38bdf8;" href="http://localhost:5173">http://localhost:5173</a>.</p>
            <p>API endpoints: <code>/api/health</code>, <code>/api/schema</code>, <code>/api/query/execute</code>, <code>/api/ai/generate</code>.</p>
          </body>
        </html>
      `);
    }
  });
});

const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🚀 QueryPilot Backend running on http://localhost:${config.port}`);
  console.log(`📦 Database Mode: ${config.databaseMode} (In-Memory SQLite)`);
  console.log(`🤖 AI Provider: ${config.aiProvider}`);
  console.log(`===============================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, closing server...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, closing server...');
  server.close(() => process.exit(0));
});
