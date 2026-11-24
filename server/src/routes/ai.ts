import { Router } from 'express';
import { aiService } from '../ai/service.js';

export const aiRouter = Router();

/**
 * GET /api/ai/status - Returns provider configuration status
 */
aiRouter.get('/status', (req, res) => {
  const status = aiService.getStatus();
  res.json({ success: true, ...status });
});

/**
 * POST /api/ai/generate - Generates SQL query from prompt
 */
aiRouter.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Prompt string is required.'
    });
  }

  try {
    const result = await aiService.generateSql(prompt);
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate SQL'
    });
  }
});
