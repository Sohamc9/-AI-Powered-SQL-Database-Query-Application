import { Router } from 'express';
import { aiService } from '../ai/service.js';
import { config } from '../config.js';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  const aiStatus = aiService.getStatus();
  res.json({
    status: 'online',
    appName: 'QueryPilot Server',
    version: '1.0.0',
    mode: 'demo',
    database: {
      type: 'SQLite (In-Memory Engine)',
      seeded: true,
      mode: config.databaseMode
    },
    ai: aiStatus
  });
});
