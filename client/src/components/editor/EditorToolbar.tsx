import React from 'react';
import { 
  Play, 
  Sparkles, 
  Trash2, 
  BookmarkPlus, 
  Loader2, 
  Command 
} from 'lucide-react';
import { useQueryPilot } from '../../context/QueryPilotContext';

interface EditorToolbarProps {
  onOpenSaveModal: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ onOpenSaveModal }) => {
  const { 
    runQuery, 
    isRunning, 
    formatQuery, 
    clearQuery, 
    query, 
    aiOpen, 
    setAiOpen 
  } = useQueryPilot();

  return (
    <div className="h-11 px-3 bg-workbench-850 border-b border-slate-800 flex items-center justify-between select-none">
      {/* Left actions: Run, Format, Clear, Save */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => runQuery()}
          disabled={isRunning || !query.trim()}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-sky-600/25 transition-all active:scale-[0.98]"
          title="Run query (Cmd+Enter or Ctrl+Enter)"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Executing...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Query</span>
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] px-1 py-0.2 rounded bg-sky-700/60 text-sky-200">
                <Command className="w-2.5 h-2.5" />
                <span>↵</span>
              </span>
            </>
          )}
        </button>

        <button
          onClick={formatQuery}
          disabled={!query.trim() || isRunning}
          title="Format SQL query (beautify)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/60 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Format</span>
        </button>

        <button
          onClick={onOpenSaveModal}
          disabled={!query.trim() || isRunning}
          title="Save this query to library"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/60 transition-colors"
        >
          <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Save</span>
        </button>

        <button
          onClick={clearQuery}
          disabled={!query.trim() || isRunning}
          title="Clear editor"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right side: AI Toggle & status */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setAiOpen(!aiOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-violet-300 hover:text-violet-200 bg-violet-950/40 hover:bg-violet-950/70 border border-violet-800/50 transition-colors"
        >
          <Sparkles className="w-3 h-3 text-violet-400" />
          <span>{aiOpen ? 'Hide AI Assistant' : 'Ask AI'}</span>
        </button>
      </div>
    </div>
  );
};
