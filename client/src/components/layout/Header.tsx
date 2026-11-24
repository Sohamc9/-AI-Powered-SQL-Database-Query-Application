import React from 'react';
import { 
  Database, 
  Sparkles, 
  Sun, 
  Moon, 
  RotateCcw, 
  Layers, 
  Terminal, 
  ExternalLink 
} from 'lucide-react';
import { useQueryPilot } from '../../context/QueryPilotContext';

export const Header: React.FC = () => {
  const { 
    theme, 
    toggleTheme, 
    resetDatabase, 
    aiOpen, 
    setAiOpen, 
    aiStatus 
  } = useQueryPilot();

  return (
    <header className="h-14 border-b border-slate-800 bg-workbench-850 px-4 flex items-center justify-between select-none">
      {/* Brand & Connection */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold">
            <Terminal className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">Query<span className="text-sky-400">Pilot</span></span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                v1.0
              </span>
            </div>
          </div>
        </div>

        {/* Database Connection Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-750 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-300 font-medium">Demo SQLite</span>
          <span className="text-slate-500 text-[11px]">(In-Memory Seeded)</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Reset Demo DB Button */}
        <button
          onClick={resetDatabase}
          title="Reset demo database to original sample records"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Reset Seed</span>
        </button>

        {/* AI Assistant Pill / Toggle */}
        <button
          onClick={() => setAiOpen(!aiOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
            aiOpen
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-indigo-500/25 ring-1 ring-violet-400/50'
              : 'bg-slate-800 text-violet-300 hover:bg-slate-750 border border-violet-500/30 hover:border-violet-500/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-300 animate-pulse" />
          <span>AI Assistant</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-950/60 text-violet-200 border border-violet-500/30">
            {aiStatus?.isConfigured ? 'Live AI' : 'Demo Mode'}
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
