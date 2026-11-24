import { DatabaseSync } from 'node:sqlite';
import { seedDatabase } from './seed.js';
import { inspectSqlSafety } from './safety.js';

export interface ColumnMetadata {
  name: string;
  type: string;
  notnull: boolean;
  dflt_value: any;
  pk: boolean;
}

export interface TableMetadata {
  name: string;
  rowCount: number;
  columns: ColumnMetadata[];
  primaryKeys: string[];
  foreignKeys: Array<{
    id: number;
    table: string;
    from: string;
    to: string;
  }>;
}

export interface QueryExecutionResult {
  success: boolean;
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  statementType: string;
  affectedRows?: number;
  safetyWarning?: string;
}

class DatabaseManager {
  private db: DatabaseSync;
  private isInitialized = false;

  constructor() {
    // In-memory SQLite database
    this.db = new DatabaseSync(':memory:');
    this.init();
  }

  public init(): void {
    if (this.isInitialized) return;
    try {
      seedDatabase(this.db);
      this.isInitialized = true;
      console.log('QueryPilot SQLite in-memory demo database initialized and seeded successfully.');
    } catch (err) {
      console.error('Failed to initialize demo database:', err);
      throw err;
    }
  }

  public resetDemoData(): void {
    seedDatabase(this.db);
  }

  /**
   * Introspects tables, columns, constraints, and row counts
   */
  public getSchema(): TableMetadata[] {
    const tablesStmt = this.db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' 
      ORDER BY name ASC;
    `);
    const tables = tablesStmt.all() as { name: string }[];

    return tables.map(t => {
      // Columns
      const colStmt = this.db.prepare(`PRAGMA table_info("${t.name}");`);
      const cols = colStmt.all() as any[];
      const columns: ColumnMetadata[] = cols.map(c => ({
        name: c.name,
        type: c.type || 'TEXT',
        notnull: Boolean(c.notnull),
        dflt_value: c.dflt_value,
        pk: Boolean(c.pk)
      }));

      // Foreign keys
      const fkStmt = this.db.prepare(`PRAGMA foreign_key_list("${t.name}");`);
      const fks = fkStmt.all() as any[];
      const foreignKeys = fks.map(f => ({
        id: f.id,
        table: f.table,
        from: f.from,
        to: f.to
      }));

      // Row count
      const countStmt = this.db.prepare(`SELECT COUNT(*) as count FROM "${t.name}";`);
      const countResult = countStmt.get() as { count: number };

      return {
        name: t.name,
        rowCount: countResult ? countResult.count : 0,
        columns,
        primaryKeys: columns.filter(c => c.pk).map(c => c.name),
        foreignKeys
      };
    });
  }

  /**
   * Executes arbitrary SQL query with safety checks, performance timing, and error handling
   */
  public executeQuery(sql: string, allowDestructive = false): QueryExecutionResult {
    const trimmed = sql.trim();
    if (!trimmed) {
      throw new Error('Query cannot be empty.');
    }

    const safety = inspectSqlSafety(trimmed);

    if (safety.isDestructive && !allowDestructive) {
      const err: any = new Error(
        `Safety Guard: Destructive query detected (${safety.operationType}). ${safety.riskReason}`
      );
      err.isDestructive = true;
      err.operationType = safety.operationType;
      throw err;
    }

    const startTime = performance.now();

    try {
      // Check if it's a SELECT or returns rows
      const isSelect = /^\s*(SELECT|WITH|EXPLAIN|PRAGMA)\b/i.test(trimmed);

      if (isSelect) {
        const stmt = this.db.prepare(trimmed);
        const rows = stmt.all() as Record<string, any>[];
        const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

        let columns: string[] = [];
        if (rows.length > 0) {
          columns = Object.keys(rows[0]);
        } else {
          // Attempt to extract column names via EXPLAIN or dummy fetch
          try {
            const sampleStmt = this.db.prepare(`SELECT * FROM (${trimmed}) LIMIT 0;`);
            // In node:sqlite without rows, columns can be derived if available
            columns = [];
          } catch {
            columns = [];
          }
        }

        return {
          success: true,
          columns,
          rows,
          rowCount: rows.length,
          executionTimeMs,
          statementType: 'SELECT'
        };
      } else {
        // Execute non-SELECT statement
        this.db.exec(trimmed);
        const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

        return {
          success: true,
          columns: ['status', 'message'],
          rows: [
            {
              status: 'Success',
              message: `Statement executed successfully in ${executionTimeMs}ms.`
            }
          ],
          rowCount: 1,
          executionTimeMs,
          statementType: safety.operationType || 'MUTATION',
          safetyWarning: safety.isDestructive
            ? `Destructive statement (${safety.operationType}) executed with user confirmation.`
            : undefined
        };
      }
    } catch (error: any) {
      const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));
      const message = error.message || 'Unknown database error occurred';
      const err: any = new Error(message);
      err.executionTimeMs = executionTimeMs;
      throw err;
    }
  }
}

export const dbManager = new DatabaseManager();
