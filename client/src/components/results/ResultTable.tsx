import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Clock, 
  Layers, 
  AlertCircle, 
  Code,
  FileSpreadsheet
} from 'lucide-react';
import { useQueryPilot } from '../../context/QueryPilotContext';
import { exportToCsv } from '../../utils/csvExport';

export const ResultTable: React.FC = () => {
  const { results, error, isRunning, query, addToast } = useQueryPilot();
  const [filterText, setFilterText] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [copiedType, setCopiedType] = useState<'json' | 'sql' | null>(null);

  // Sorting handler
  const handleSort = (col: string) => {
    if (sortCol === col) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortCol(null);
        setSortDir('asc');
      }
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  // Filtered & sorted rows
  const processedRows = useMemo(() => {
    if (!results || !results.rows) return [];
    let rows = [...results.rows];

    // Filter
    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      rows = rows.filter(row =>
        Object.values(row).some(val =>
          val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        )
      );
    }

    // Sort
    if (sortCol) {
      rows.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDir === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return rows;
  }, [results, filterText, sortCol, sortDir]);

  // Export handlers
  const handleExportCsv = () => {
    if (!results || results.rows.length === 0) return;
    exportToCsv('querypilot_results', results.columns, processedRows);
    addToast('Results exported as CSV.', 'success');
  };

  const handleCopyJson = () => {
    if (!results) return;
    navigator.clipboard.writeText(JSON.stringify(processedRows, null, 2));
    setCopiedType('json');
    addToast('Results copied as JSON.', 'success');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(query);
    setCopiedType('sql');
    addToast('SQL query copied to clipboard.', 'success');
    setTimeout(() => setCopiedType(null), 2000);
  };

  // 1. Error State
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-200">
        <div className="max-w-xl w-full p-6 rounded-xl bg-rose-950/30 border border-rose-500/40 shadow-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-300">SQL Execution Error</h4>
              <p className="text-xs text-rose-200/90 font-mono mt-2 whitespace-pre-wrap leading-relaxed break-all bg-rose-950/60 p-3 rounded-lg border border-rose-900/50">
                {error.message}
              </p>
              {error.executionTimeMs !== undefined && (
                <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Failed after {error.executionTimeMs}ms</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (isRunning) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900 border border-slate-800">
          <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-300">Running query against database...</span>
        </div>
      </div>
    );
  }

  // 3. Empty State (No query run yet)
  if (!results) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-400 select-none">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3 shadow-inner">
          <Code className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h4 className="text-sm font-medium text-slate-300">Ready to Query</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
          Write a SQL query above and click <span className="text-sky-400 font-semibold">Run</span> or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">Cmd+Enter</kbd> to inspect live results.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Results Toolbar */}
      <div className="h-10 px-3 bg-workbench-850 border-b border-slate-800 flex items-center justify-between text-xs select-none">
        {/* Left: Summary stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>{results.rowCount} {results.rowCount === 1 ? 'row' : 'rows'}</span>
            {filterText && processedRows.length !== results.rowCount && (
              <span className="text-slate-500 text-[11px]">
                ({processedRows.length} filtered)
              </span>
            )}
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-700" />
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{results.executionTimeMs}ms</span>
          </div>
        </div>

        {/* Right: Search within results & Export actions */}
        <div className="flex items-center gap-2">
          {/* Quick Filter */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter results..."
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              className="pl-7 pr-2 py-1 bg-slate-900 border border-slate-750 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-32 md:w-44 transition-all"
            />
          </div>

          {/* Export to CSV */}
          <button
            onClick={handleExportCsv}
            disabled={results.rows.length === 0}
            title="Download results as CSV"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition-colors disabled:opacity-40"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {/* Copy as JSON */}
          <button
            onClick={handleCopyJson}
            disabled={results.rows.length === 0}
            title="Copy results as JSON"
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition-colors disabled:opacity-40"
          >
            {copiedType === 'json' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden md:inline">JSON</span>
          </button>

          {/* Copy SQL */}
          <button
            onClick={handleCopySql}
            title="Copy SQL query"
            className="p-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          >
            {copiedType === 'sql' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Code className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Results Table Body */}
      <div className="flex-1 overflow-auto">
        {results.rows.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            Query returned 0 rows.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 shadow-sm select-none">
              <tr>
                <th className="py-2 px-3 text-[11px] font-mono text-slate-500 w-10 text-right bg-slate-900 border-r border-slate-800/80">
                  #
                </th>
                {results.columns.map(col => {
                  const isSorted = sortCol === col;
                  return (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className="py-2 px-3 font-semibold text-slate-300 hover:text-white cursor-pointer hover:bg-slate-850/80 transition-colors border-r border-slate-800/60 whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col}</span>
                        {isSorted ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-sky-400" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-sky-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-40 hover:opacity-100" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-mono text-slate-300">
              {processedRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-850/60 transition-colors group"
                >
                  <td className="py-1.5 px-3 text-[11px] text-slate-500 text-right bg-slate-950/80 border-r border-slate-850 group-hover:bg-slate-900">
                    {idx + 1}
                  </td>
                  {results.columns.map(col => {
                    const val = row[col];
                    const isNull = val === null || val === undefined;
                    const isNum = typeof val === 'number';

                    return (
                      <td
                        key={col}
                        className={`py-1.5 px-3 border-r border-slate-850/60 whitespace-nowrap max-w-xs truncate ${
                          isNum ? 'text-cyan-300/90 text-right font-medium' : ''
                        }`}
                        title={isNull ? 'NULL' : String(val)}
                      >
                        {isNull ? (
                          <span className="text-slate-600 italic font-sans text-[11px]">NULL</span>
                        ) : typeof val === 'object' ? (
                          JSON.stringify(val)
                        ) : (
                          String(val)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
