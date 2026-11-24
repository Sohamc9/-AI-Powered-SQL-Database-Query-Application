import { Router } from 'express';
import { dbManager } from '../db/connection.js';
import { format as formatSql } from 'sql-formatter';

export const queryRouter = Router();

/**
 * POST /api/query/execute - Executes SQL statement with safety check & timing
 */
queryRouter.post('/execute', (req, res) => {
  const { sql, allowDestructive } = req.body;

  if (!sql || typeof sql !== 'string' || !sql.trim()) {
    return res.status(400).json({
      success: false,
      error: 'SQL query text is required.'
    });
  }

  try {
    const result = dbManager.executeQuery(sql, Boolean(allowDestructive));
    res.json(result);
  } catch (error: any) {
    res.status(error.isDestructive ? 403 : 400).json({
      success: false,
      error: error.message,
      isDestructive: Boolean(error.isDestructive),
      operationType: error.operationType,
      executionTimeMs: error.executionTimeMs || 0
    });
  }
});

/**
 * POST /api/query/format - Formats SQL nicely using sql-formatter
 */
queryRouter.post('/format', (req, res) => {
  const { sql } = req.body;
  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ success: false, error: 'SQL string is required' });
  }

  try {
    const formatted = formatSql(sql, {
      language: 'sqlite',
      tabWidth: 2,
      keywordCase: 'upper'
    });
    res.json({ success: true, formattedSql: formatted });
  } catch (error: any) {
    // If formatting fails (e.g. malformed tokens), return original sql with warning
    res.json({ success: true, formattedSql: sql, warning: 'Could not format query syntax' });
  }
});
