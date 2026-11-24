import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  ArrowRight, 
  Play, 
  Copy, 
  Check, 
  Layers, 
  Info, 
  Loader2 
} from 'lucide-react';
import { useQueryPilot } from '../../context/QueryPilotContext';

export const AiPanel: React.FC = () => {
  const { 
    aiOpen, 
    setAiOpen, 
    aiStatus, 
    aiLoading, 
    aiSuggestion, 
    askAi, 
    insertAiSuggestion, 
    runAiSuggestion,
    addToast
  } = useQueryPilot();

  const [inputPrompt, setInputPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  if (!aiOpen) return null;

  const exampleChips = [
    'Top 10 customers by revenue',
    'Monthly revenue & order volume',
    'Products with low stock (< 50)',
    'Average order value by tier',
    'Latest 15 orders with customer info',
    'Top rated products with reviews',
    'Category sales performance',
    'Payment method distribution'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || aiLoading) return;
    askAi(inputPrompt.trim());
  };

  const handleChipClick = (chip: string) => {
    setInputPrompt(chip);
    askAi(chip);
  };

  const handleCopySql = () => {
    if (!aiSuggestion?.sql) return;
    navigator.clipboard.writeText(aiSuggestion.sql);
    setCopied(true);
    addToast('SQL copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="w-80 md:w-96 border-l border-slate-800 bg-workbench-850 flex flex-col h-[calc(100vh-3.5rem)] select-none animate-slide-left z-20">
      {/* Panel Header */}
      <div className="h-12 px-4 border-b border-slate-800 flex items-center justify-between bg-workbench-900/60">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-violet-500/10 text-violet-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">AI Query Assistant</h3>
            <p className="text-[10px] text-violet-300 font-medium">
              {aiStatus?.isConfigured ? aiStatus.providerName : 'Offline Demo Assistant'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setAiOpen(false)}
          className="p-1 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notice Banner */}
      {!aiStatus?.isConfigured && (
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-violet-950/40 border border-violet-800/40 text-[11px] text-violet-200 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            Running in <span className="font-semibold text-violet-300">Demo Assistant Mode</span>. Generates realistic, schema-aware SQL for any question without requiring paid API keys.
          </p>
        </div>
      )}

      {/* Scrollable conversation / preview */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Suggestion Chips */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Example Prompts
          </label>
          <div className="flex flex-wrap gap-1.5">
            {exampleChips.map(chip => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                disabled={aiLoading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 transition-colors text-left"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* AI Output Card */}
        {aiSuggestion && (
          <div className="rounded-xl bg-slate-900 border border-violet-500/30 p-3.5 space-y-3 shadow-lg shadow-violet-950/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-violet-400" />
                <span>Generated SQL</span>
              </span>
              <button
                onClick={handleCopySql}
                title="Copy SQL"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            {/* SQL Code Block */}
            <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11.5px] text-sky-200 border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-56">
              {aiSuggestion.sql}
            </div>

            {/* Plain English explanation */}
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <h5 className="text-[11px] font-semibold text-slate-300 mb-1">
                Plain English Explanation:
              </h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                {aiSuggestion.explanation}
              </p>
            </div>

            {/* Tables Used */}
            {aiSuggestion.tablesUsed && aiSuggestion.tablesUsed.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-500 font-medium">Tables:</span>
                {aiSuggestion.tablesUsed.map(t => (
                  <span
                    key={t}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono border border-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Actions: Insert into Editor & Run Directly */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <button
                onClick={insertAiSuggestion}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors"
              >
                <ArrowRight className="w-3 h-3 text-sky-400" />
                <span>Insert in Editor</span>
              </button>
              <button
                onClick={runAiSuggestion}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/30 transition-colors"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run Now</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-workbench-900/60">
        <div className="relative">
          <textarea
            rows={2}
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            placeholder="Ask AI: e.g. 'Show orders from San Francisco over $500'..."
            className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-750 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none leading-relaxed"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || aiLoading}
            className="absolute right-2 bottom-3 p-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {aiLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-1.5 text-center">
          Press <kbd className="px-1 rounded bg-slate-800 text-slate-400">Enter</kbd> to generate SQL
        </p>
      </form>
    </aside>
  );
};
