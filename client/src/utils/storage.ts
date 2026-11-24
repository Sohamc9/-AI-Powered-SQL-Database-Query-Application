import { QueryHistoryItem, SavedQuery } from '../types';

const HISTORY_KEY = 'querypilot_query_history';
const SAVED_QUERIES_KEY = 'querypilot_saved_queries';
const LAST_QUERY_KEY = 'querypilot_last_query';
const THEME_KEY = 'querypilot_theme';

export function getStoredHistory(): QueryHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredHistory(history: QueryHistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch (err) {
    console.error('Failed to save history to localStorage', err);
  }
}

export function getStoredSavedQueries(): SavedQuery[] {
  try {
    const raw = localStorage.getItem(SAVED_QUERIES_KEY);
    if (raw) return JSON.parse(raw);
    
    // Seed default saved queries if empty
    return [
      {
        id: 'seed-1',
        name: 'Top Customers by Spend',
        sql: `SELECT \n  c.id, c.name, c.customer_tier, c.country,\n  COUNT(o.id) AS order_count,\n  ROUND(SUM(o.total_amount), 2) AS total_spend\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name, c.customer_tier, c.country\nORDER BY total_spend DESC\nLIMIT 10;`,
        createdAt: new Date().toISOString(),
        description: 'Finds top purchasing accounts with aggregate order spend'
      },
      {
        id: 'seed-2',
        name: 'Low Stock Catalog Alert',
        sql: `SELECT \n  p.id, p.name AS product_name,\n  c.name AS category,\n  p.stock_quantity, p.price\nFROM products p\nJOIN categories c ON p.category_id = c.id\nWHERE p.stock_quantity < 50 AND p.is_active = 1\nORDER BY p.stock_quantity ASC;`,
        createdAt: new Date().toISOString(),
        description: 'Products with less than 50 units remaining in stock'
      }
    ];
  } catch {
    return [];
  }
}

export function saveStoredSavedQueries(saved: SavedQuery[]): void {
  try {
    localStorage.setItem(SAVED_QUERIES_KEY, JSON.stringify(saved));
  } catch (err) {
    console.error('Failed to save queries to localStorage', err);
  }
}

export function getStoredLastQuery(): string | null {
  try {
    return localStorage.getItem(LAST_QUERY_KEY);
  } catch {
    return null;
  }
}

export function saveStoredLastQuery(sql: string): void {
  try {
    localStorage.setItem(LAST_QUERY_KEY, sql);
  } catch {}
}

export function getStoredTheme(): 'dark' | 'light' {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveStoredTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}
