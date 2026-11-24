import React, { useState } from 'react';
import { 
  History, 
  Bookmark, 
  Trash2, 
  Play, 
  Search, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Calendar
} from 'lucide-react';
import { useQueryPilot } from '../../context/QueryPilotContext';

interface QueryHistoryProps {
  activeTab: 'history' | 'saved';
  onClose?: () => void;
}

export const QueryHistory: React.FC<QueryHistoryProps> = ({ activeTab }) => {
  const { 
    history, 
    savedQueries, 
    restoreHistoryItem, 
    deleteSavedQuery, 
    clearHistory,
    runQuery 
  } = useQueryPilot();

  const [search, setSearch] = useState('');

  const filteredHistory = history.filter(item =>
    item.sql.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSaved = savedQueries.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sql.toLowerCase().includes(search.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 select-none">
      {/* Top filter & actions */}
      <div className="h-11 px-4 bg-workbench-850 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'history' ? 'Search history...' : 'Search saved queries...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-900 border border-slate-750 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {activeTab === 'history' && history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/40 transition-colors ml-3"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'history' ? (
          filteredHistory.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-500">
              <History className="w-8 h-8 text-slate-700 mb-2" />
              <span>No query history yet. Run queries to see them logged here.</span>
            </div>
          ) : (
            filteredHistory.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors group"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <div className="flex items-center gap-2">
                    {item.status === 'success' ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Success</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        <span>Failed</span>
                      </span>
                    )}
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.executionTimeMs}ms</span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>{item.rowCount} rows</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{item.executedAt}</span>
                </div>

                {/* SQL snippet */}
                <pre className="font-mono text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-24 leading-relaxed border border-slate-850">
                  {item.sql}
                </pre>

                {item.errorMessage && (
                  <p className="text-[11px] text-rose-400 mt-1 font-mono">{item.errorMessage}</p>
                )}

                <div className="mt-2.5 flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => restoreHistoryItem(item.sql)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs transition-colors"
                  >
                    <span>Restore to Editor</span>
                  </button>
                  <button
                    onClick={() => {
                      restoreHistoryItem(item.sql);
                      runQuery(item.sql);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium shadow-sm transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run Query</span>
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          filteredSaved.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-500">
              <Bookmark className="w-8 h-8 text-slate-700 mb-2" />
              <span>No saved queries yet. Click "Save" in the editor toolbar to pin frequently used queries.</span>
            </div>
          ) : (
            filteredSaved.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                      <span>{item.name}</span>
                    </h4>
                    {item.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mr-2">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{item.createdAt}</span>
                    </span>
                    <button
                      onClick={() => deleteSavedQuery(item.id)}
                      title="Delete saved query"
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <pre className="font-mono text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-24 leading-relaxed mt-2 border border-slate-850">
                  {item.sql}
                </pre>

                <div className="mt-2.5 flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => restoreHistoryItem(item.sql)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs transition-colors"
                  >
                    <span>Load in Editor</span>
                  </button>
                  <button
                    onClick={() => {
                      restoreHistoryItem(item.sql);
                      runQuery(item.sql);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium shadow-sm transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run Query</span>
                  </button>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};
