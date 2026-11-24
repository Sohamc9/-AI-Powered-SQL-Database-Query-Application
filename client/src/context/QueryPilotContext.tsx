import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  TableMetadata,
  QueryResult,
  QueryExecutionError,
  QueryHistoryItem,
  SavedQuery,
  AiGeneratedSqlResponse,
  AiStatus,
  ToastMessage
} from '../types';
import {
  getStoredHistory,
  saveStoredHistory,
  getStoredSavedQueries,
  saveStoredSavedQueries,
  getStoredLastQuery,
  saveStoredLastQuery,
  getStoredTheme,
  saveStoredTheme
} from '../utils/storage';

const STARTER_QUERY = `-- Welcome to QueryPilot! Press Cmd+Enter (or click Run) to execute.
SELECT 
  c.id,
  c.name AS customer_name,
  c.country,
  c.customer_tier,
  COUNT(o.id) AS total_orders,
  ROUND(SUM(o.total_amount), 2) AS total_spent,
  ROUND(AVG(o.total_amount), 2) AS avg_order_value
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
WHERE o.status NOT IN ('cancelled', 'refunded')
GROUP BY c.id, c.name, c.country, c.customer_tier
ORDER BY total_spent DESC
LIMIT 10;`;

interface DestructiveModalState {
  isOpen: boolean;
  sql: string;
  operationType?: string;
  reason?: string;
}

interface QueryPilotContextType {
  // Query state
  query: string;
  setQuery: (q: string) => void;
  isRunning: boolean;
  results: QueryResult | null;
  error: QueryExecutionError | null;
  
  // Database schema
  schema: TableMetadata[];
  isLoadingSchema: boolean;
  fetchSchema: () => Promise<void>;
  previewTable: (tableName: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
  
  // Execution
  runQuery: (overrideSql?: string, allowDestructive?: boolean) => Promise<void>;
  formatQuery: () => Promise<void>;
  clearQuery: () => void;
  
  // Query management
  history: QueryHistoryItem[];
  savedQueries: SavedQuery[];
  saveQuery: (name: string, description?: string) => void;
  deleteSavedQuery: (id: string) => void;
  restoreHistoryItem: (sql: string) => void;
  clearHistory: () => void;
  
  // AI Assistant
  aiOpen: boolean;
  setAiOpen: (open: boolean) => void;
  aiStatus: AiStatus | null;
  aiLoading: boolean;
  aiSuggestion: AiGeneratedSqlResponse | null;
  askAi: (prompt: string) => Promise<void>;
  insertAiSuggestion: () => void;
  runAiSuggestion: () => Promise<void>;
  
  // UI & Feedback
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  destructiveModal: DestructiveModalState;
  closeDestructiveModal: () => void;
  confirmDestructiveExecution: () => Promise<void>;
}

const QueryPilotContext = createContext<QueryPilotContextType | undefined>(undefined);

export const QueryPilotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [query, setQueryState] = useState<string>(() => getStoredLastQuery() || STARTER_QUERY);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<QueryResult | null>(null);
  const [error, setError] = useState<QueryExecutionError | null>(null);

  const [schema, setSchema] = useState<TableMetadata[]>([]);
  const [isLoadingSchema, setIsLoadingSchema] = useState<boolean>(true);

  const [history, setHistory] = useState<QueryHistoryItem[]>(() => getStoredHistory());
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(() => getStoredSavedQueries());

  const [aiOpen, setAiOpen] = useState<boolean>(false);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<AiGeneratedSqlResponse | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => getStoredTheme());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [destructiveModal, setDestructiveModal] = useState<DestructiveModalState>({
    isOpen: false,
    sql: ''
  });

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
    saveStoredLastQuery(q);
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync theme with document class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveStoredTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Fetch schema
  const fetchSchema = useCallback(async () => {
    setIsLoadingSchema(true);
    try {
      const res = await fetch('/api/schema');
      const data = await res.json();
      if (data.success && Array.isArray(data.tables)) {
        setSchema(data.tables);
      }
    } catch (err: any) {
      console.error('Failed to load schema', err);
      addToast('Could not load database schema.', 'error');
    } finally {
      setIsLoadingSchema(false);
    }
  }, [addToast]);

  // Fetch AI status
  const fetchAiStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/status');
      const data = await res.json();
      if (data.success) {
        setAiStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch AI status', err);
    }
  }, []);

  useEffect(() => {
    fetchSchema();
    fetchAiStatus();
  }, [fetchSchema, fetchAiStatus]);

  // Execute SQL
  const runQuery = useCallback(async (overrideSql?: string, allowDestructive = false) => {
    const sqlToRun = (overrideSql ?? query).trim();
    if (!sqlToRun) {
      addToast('Please enter a SQL query to execute.', 'info');
      return;
    }

    setIsRunning(true);
    setError(null);

    const startTime = performance.now();

    try {
      const res = await fetch('/api/query/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlToRun, allowDestructive })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isDestructive && !allowDestructive) {
          // Open destructive confirmation modal
          setDestructiveModal({
            isOpen: true,
            sql: sqlToRun,
            operationType: data.operationType,
            reason: data.error
          });
          setIsRunning(false);
          return;
        }

        const queryError: QueryExecutionError = {
          message: data.error || 'SQL execution failed.',
          executionTimeMs: data.executionTimeMs || parseFloat((performance.now() - startTime).toFixed(2))
        };
        setError(queryError);
        setResults(null);

        // Record failed run in history
        const historyItem: QueryHistoryItem = {
          id: `${Date.now()}`,
          sql: sqlToRun,
          executedAt: new Date().toLocaleTimeString(),
          executionTimeMs: queryError.executionTimeMs || 0,
          rowCount: 0,
          status: 'error',
          errorMessage: queryError.message
        };
        setHistory(prev => {
          const updated = [historyItem, ...prev];
          saveStoredHistory(updated);
          return updated;
        });

        addToast(queryError.message, 'error');
        return;
      }

      setResults(data);
      setError(null);

      // Record successful run in history
      const historyItem: QueryHistoryItem = {
        id: `${Date.now()}`,
        sql: sqlToRun,
        executedAt: new Date().toLocaleTimeString(),
        executionTimeMs: data.executionTimeMs,
        rowCount: data.rowCount,
        status: 'success'
      };

      setHistory(prev => {
        const updated = [historyItem, ...prev];
        saveStoredHistory(updated);
        return updated;
      });

      if (data.safetyWarning) {
        addToast(data.safetyWarning, 'info');
      } else {
        addToast(`Query executed in ${data.executionTimeMs}ms (${data.rowCount} rows)`, 'success');
      }

      // If statement was a mutation, refresh schema counts
      if (data.statementType !== 'SELECT') {
        fetchSchema();
      }
    } catch (err: any) {
      const execTime = parseFloat((performance.now() - startTime).toFixed(2));
      const message = err.message || 'Network error executing query';
      setError({ message, executionTimeMs: execTime });
      setResults(null);
      addToast(message, 'error');
    } finally {
      setIsRunning(false);
    }
  }, [query, addToast, fetchSchema]);

  // Format SQL
  const formatQuery = useCallback(async () => {
    if (!query.trim()) return;
    try {
      const res = await fetch('/api/query/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: query })
      });
      const data = await res.json();
      if (data.success && data.formattedSql) {
        setQuery(data.formattedSql);
        addToast('SQL formatted nicely.', 'success');
      }
    } catch {
      addToast('Could not format SQL.', 'error');
    }
  }, [query, setQuery, addToast]);

  const clearQuery = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
    addToast('Editor cleared.', 'info');
  }, [setQuery, addToast]);

  // Preview table
  const previewTable = useCallback(async (tableName: string) => {
    const previewSql = `SELECT * FROM "${tableName}" LIMIT 10;`;
    setQuery(previewSql);
    await runQuery(previewSql);
  }, [setQuery, runQuery]);

  // Save Query
  const saveQuery = useCallback((name: string, description?: string) => {
    if (!query.trim()) {
      addToast('Cannot save an empty query.', 'error');
      return;
    }
    const newSaved: SavedQuery = {
      id: `${Date.now()}`,
      name: name.trim() || 'Untitled Query',
      sql: query,
      createdAt: new Date().toLocaleDateString(),
      description
    };
    setSavedQueries(prev => {
      const updated = [newSaved, ...prev];
      saveStoredSavedQueries(updated);
      return updated;
    });
    addToast(`Saved query "${newSaved.name}".`, 'success');
  }, [query, addToast]);

  const deleteSavedQuery = useCallback((id: string) => {
    setSavedQueries(prev => {
      const updated = prev.filter(q => q.id !== id);
      saveStoredSavedQueries(updated);
      return updated;
    });
    addToast('Saved query deleted.', 'info');
  }, [addToast]);

  const restoreHistoryItem = useCallback((sql: string) => {
    setQuery(sql);
    addToast('Restored query to editor.', 'info');
  }, [setQuery, addToast]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveStoredHistory([]);
    addToast('Query history cleared.', 'info');
  }, [addToast]);

  // AI Assistant
  const askAi = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      addToast('Please enter an instruction or question for the AI assistant.', 'info');
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setAiSuggestion(data);
        addToast('AI suggestion ready!', 'success');
      } else {
        addToast(data.error || 'Failed to generate query.', 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'AI request failed.', 'error');
    } finally {
      setAiLoading(false);
    }
  }, [addToast]);

  const insertAiSuggestion = useCallback(() => {
    if (aiSuggestion?.sql) {
      setQuery(aiSuggestion.sql);
      addToast('AI query inserted into editor.', 'success');
    }
  }, [aiSuggestion, setQuery, addToast]);

  const runAiSuggestion = useCallback(async () => {
    if (aiSuggestion?.sql) {
      setQuery(aiSuggestion.sql);
      await runQuery(aiSuggestion.sql);
    }
  }, [aiSuggestion, setQuery, runQuery]);

  // Reset database demo
  const resetDatabase = useCallback(async () => {
    try {
      const res = await fetch('/api/schema/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchSchema();
        addToast('Demo database successfully reset to clean seed state.', 'success');
      }
    } catch {
      addToast('Failed to reset demo database.', 'error');
    }
  }, [fetchSchema, addToast]);

  // Destructive modal controls
  const closeDestructiveModal = useCallback(() => {
    setDestructiveModal({ isOpen: false, sql: '' });
  }, []);

  const confirmDestructiveExecution = useCallback(async () => {
    const targetSql = destructiveModal.sql;
    closeDestructiveModal();
    if (targetSql) {
      await runQuery(targetSql, true);
    }
  }, [destructiveModal, closeDestructiveModal, runQuery]);

  return (
    <QueryPilotContext.Provider
      value={{
        query,
        setQuery,
        isRunning,
        results,
        error,
        schema,
        isLoadingSchema,
        fetchSchema,
        previewTable,
        resetDatabase,
        runQuery,
        formatQuery,
        clearQuery,
        history,
        savedQueries,
        saveQuery,
        deleteSavedQuery,
        restoreHistoryItem,
        clearHistory,
        aiOpen,
        setAiOpen,
        aiStatus,
        aiLoading,
        aiSuggestion,
        askAi,
        insertAiSuggestion,
        runAiSuggestion,
        theme,
        toggleTheme,
        toasts,
        addToast,
        removeToast,
        destructiveModal,
        closeDestructiveModal,
        confirmDestructiveExecution
      }}
    >
      {children}
    </QueryPilotContext.Provider>
  );
};

export const useQueryPilot = (): QueryPilotContextType => {
  const context = useContext(QueryPilotContext);
  if (!context) {
    throw new Error('useQueryPilot must be used within a QueryPilotProvider');
  }
  return context;
};
