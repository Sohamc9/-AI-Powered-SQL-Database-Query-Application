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

export interface QueryResult {
  success: boolean;
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  statementType: string;
  affectedRows?: number;
  safetyWarning?: string;
}

export interface QueryExecutionError {
  message: string;
  isDestructive?: boolean;
  operationType?: string;
  executionTimeMs?: number;
}

export interface QueryHistoryItem {
  id: string;
  sql: string;
  executedAt: string;
  executionTimeMs: number;
  rowCount: number;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface SavedQuery {
  id: string;
  name: string;
  sql: string;
  createdAt: string;
  description?: string;
}

export interface AiGeneratedSqlResponse {
  sql: string;
  explanation: string;
  tablesUsed: string[];
  suggestedFilters?: string[];
  complexity?: 'simple' | 'intermediate' | 'advanced';
  isDemoMode: boolean;
  provider: string;
}

export interface AiStatus {
  isConfigured: boolean;
  provider: 'demo' | 'openai' | 'gemini';
  providerName: string;
  hasOpenAiKey: boolean;
  hasGeminiKey: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
