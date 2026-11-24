import React, { useState } from 'react';
import { 
  Database, 
  Table, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Key, 
  Play, 
  Sparkles, 
  Bookmark, 
  History, 
  Code2, 
  RefreshCw 
} from 'lucide-react';
import { useQueryPilot } from '../../context/QueryPilotContext';
import { TableMetadata } from '../../types';

interface SidebarProps {
  activeTab: 'schema' | 'history' | 'saved';
  setActiveTab: (tab: 'schema' | 'history' | 'saved') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { 
    schema, 
    isLoadingSchema, 
    fetchSchema, 
    previewTable, 
    setQuery, 
    runQuery,
    history,
    savedQueries
  } = useQueryPilot();

  const [search, setSearch] = useState('');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    customers: true,
    orders: true
  });

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const filteredTables = schema.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.columns.some(c => c.name.toLowerCase().includes(search.toLowerCase()))
  );

  const starterQueries = [
    {
      title: 'Top 10 Customers by Revenue',
      desc: 'Ranked by total order spend with order count',
      sql: `-- Top customers ranked by total spend\nSELECT \n  c.id, c.name, c.customer_tier, c.country,\n  COUNT(o.id) AS total_orders,\n  ROUND(SUM(o.total_amount), 2) AS total_spend\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nWHERE o.status NOT IN ('cancelled', 'refunded')\nGROUP BY c.id, c.name, c.customer_tier, c.country\nORDER BY total_spend DESC\nLIMIT 10;`
    },
    {
      title: 'Monthly Revenue Trends',
      desc: 'Aggregates sales by calendar month',
      sql: `-- Monthly sales and ticket size breakdown\nSELECT \n  strftime('%Y-%m', order_date) AS month,\n  COUNT(id) AS order_count,\n  ROUND(SUM(total_amount), 2) AS gross_revenue,\n  ROUND(AVG(total_amount), 2) AS avg_order_value\nFROM orders\nGROUP BY month\nORDER BY month ASC;`
    },
    {
      title: 'Low Stock Products (< 50)',
      desc: 'Catalog items needing inventory replenishment',
      sql: `-- Low stock inventory warning\nSELECT \n  p.id, p.name AS product_name, c.name AS category,\n  p.stock_quantity, p.price\nFROM products p\nJOIN categories c ON p.category_id = c.id\nWHERE p.stock_quantity < 50 AND p.is_active = 1\nORDER BY p.stock_quantity ASC;`
    },
    {
      title: 'AOV by Customer Tier',
      desc: 'Average Order Value by customer segment',
      sql: `-- Average order value by customer tier\nSELECT \n  c.customer_tier,\n  COUNT(DISTINCT c.id) AS customers_count,\n  COUNT(o.id) AS orders_count,\n  ROUND(SUM(o.total_amount), 2) AS total_revenue,\n  ROUND(AVG(o.total_amount), 2) AS avg_ticket\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.customer_tier\nORDER BY total_revenue DESC;`
    }
  ];

  return (
    <aside className="w-72 md:w-80 border-r border-slate-800 bg-workbench-850 flex flex-col h-[calc(100vh-3.5rem)] select-none">
      {/* Navigation Tabs */}
      <div className="grid grid-cols-3 border-b border-slate-800 bg-workbench-900/60 p-1 text-xs">
        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'schema'
              ? 'bg-slate-800 text-sky-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Schema</span>
          <span className="text-[10px] opacity-70">({schema.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-slate-800 text-sky-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History</span>
          <span className="text-[10px] opacity-70">({history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'saved'
              ? 'bg-slate-800 text-sky-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved</span>
          <span className="text-[10px] opacity-70">({savedQueries.length})</span>
        </button>
      </div>

      {/* Schema View */}
      {activeTab === 'schema' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search bar */}
          <div className="p-3 border-b border-slate-800/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tables & columns..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-750 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Tables Tree */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Tables & Views</span>
              <button
                onClick={fetchSchema}
                title="Refresh Schema"
                className="hover:text-slate-200 p-0.5 rounded"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingSchema ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {filteredTables.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-slate-500">
                {isLoadingSchema ? 'Loading schema tables...' : 'No matching tables found.'}
              </div>
            ) : (
              filteredTables.map(t => {
                const isExpanded = expandedTables[t.name] || Boolean(search);
                return (
                  <div key={t.name} className="rounded-md overflow-hidden bg-slate-900/40 border border-slate-800/60">
                    {/* Table Header */}
                    <div
                      onClick={() => toggleTable(t.name)}
                      className="flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-800/60 cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <Table className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="text-xs font-medium text-slate-200 truncate group-hover:text-white">
                          {t.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {t.rowCount} rows
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            previewTable(t.name);
                          }}
                          title={`Preview ${t.name} (SELECT * LIMIT 10)`}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-sky-500/20 text-sky-400 rounded transition-all"
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    </div>

                    {/* Columns List */}
                    {isExpanded && (
                      <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-800/40 bg-slate-950/30">
                        {t.columns.map(col => (
                          <div
                            key={col.name}
                            className="flex items-center justify-between py-0.5 text-[11px] text-slate-400 hover:text-slate-200 group/col"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              {col.pk ? (
                                <Key className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                              )}
                              <span className={`truncate ${col.pk ? 'text-amber-200 font-medium' : ''}`}>
                                {col.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 shrink-0 uppercase">
                              {col.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Quick Starters Section */}
            <div className="pt-4 pb-2 px-1">
              <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <Code2 className="w-3.5 h-3.5 text-violet-400" />
                <span>Starter Queries</span>
              </div>
              <div className="mt-1 space-y-1">
                {starterQueries.map(sq => (
                  <button
                    key={sq.title}
                    onClick={() => {
                      setQuery(sq.sql);
                      runQuery(sq.sql);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/60 hover:border-slate-700 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-300 group-hover:text-sky-300 truncate">
                        {sq.title}
                      </span>
                      <Play className="w-3 h-3 text-slate-500 group-hover:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {sq.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History & Saved tabs are rendered in the main area when selected or can be switched */}
    </aside>
  );
};
