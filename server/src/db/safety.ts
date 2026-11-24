export interface SafetyCheckResult {
  isDestructive: boolean;
  operationType?: string;
  riskReason?: string;
  requiresConfirmation: boolean;
}

/**
 * Inspects a SQL query to check if it contains destructive or state-modifying operations.
 */
export function inspectSqlSafety(sql: string): SafetyCheckResult {
  // Strip string literals to avoid false positives inside strings
  const sanitized = sql
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();

  // Pattern matching for destructive operations
  const destructivePatterns: { pattern: RegExp; type: string; reason: string }[] = [
    { pattern: /\bDROP\s+(TABLE|VIEW|INDEX|TRIGGER|DATABASE|SCHEMA)\b/i, type: 'DROP', reason: 'Permanently deletes database structures and all contained data.' },
    { pattern: /\bTRUNCATE\s+(TABLE)?\b/i, type: 'TRUNCATE', reason: 'Removes all records from a table without individual row logging.' },
    { pattern: /\bDELETE\s+FROM\b/i, type: 'DELETE', reason: 'Deletes existing records from the database.' },
    { pattern: /\bUPDATE\b\s+[\w_]+\s+\bSET\b/i, type: 'UPDATE', reason: 'Modifies existing records in the database.' },
    { pattern: /\bALTER\s+TABLE\b/i, type: 'ALTER', reason: 'Modifies table schema or column definitions.' },
    { pattern: /\bINSERT\s+INTO\b/i, type: 'INSERT', reason: 'Adds new records into the database.' },
    { pattern: /\bCREATE\s+(TABLE|VIEW|INDEX|TRIGGER)\b/i, type: 'CREATE', reason: 'Creates new database structures.' },
    { pattern: /\bREPLACE\s+INTO\b/i, type: 'REPLACE', reason: 'Replaces records in the database.' }
  ];

  for (const item of destructivePatterns) {
    if (item.pattern.test(sanitized)) {
      return {
        isDestructive: true,
        operationType: item.type,
        riskReason: item.reason,
        requiresConfirmation: true
      };
    }
  }

  // Read-only / safe query
  return {
    isDestructive: false,
    requiresConfirmation: false
  };
}
