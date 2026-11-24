import { Router } from 'express';
import { dbManager } from '../db/connection.js';

export const schemaRouter = Router();

/**
 * GET /api/schema - Introspects full database schema
 */
schemaRouter.get('/', (req, res) => {
  try {
    const schema = dbManager.getSchema();
    res.json({
      success: true,
      tables: schema,
      totalTables: schema.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to introspect schema'
    });
  }
});

/**
 * GET /api/schema/table/:name/preview - Fetches first 10 rows of a table
 */
schemaRouter.get('/table/:name/preview', (req, res) => {
  const tableName = req.params.name;
  try {
    // Whitelist check
    const schema = dbManager.getSchema();
    const validTable = schema.find(t => t.name.toLowerCase() === tableName.toLowerCase());
    if (!validTable) {
      return res.status(404).json({ success: false, error: `Table '${tableName}' not found.` });
    }

    const result = dbManager.executeQuery(`SELECT * FROM "${validTable.name}" LIMIT 10;`);
    res.json({
      table: validTable.name,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to preview table'
    });
  }
});

/**
 * POST /api/schema/reset - Resets the demo database back to default seed state
 */
schemaRouter.post('/reset', (req, res) => {
  try {
    dbManager.resetDemoData();
    res.json({
      success: true,
      message: 'Demo database reset to original seeded state.'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reset demo database'
    });
  }
});
