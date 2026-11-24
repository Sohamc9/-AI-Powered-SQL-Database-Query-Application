import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useQueryPilot } from '../../context/QueryPilotContext';

export const DestructiveModal: React.FC = () => {
  const { 
    destructiveModal, 
    closeDestructiveModal, 
    confirmDestructiveExecution 
  } = useQueryPilot();

  if (!destructiveModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-rose-500/40 rounded-xl max-w-lg w-full p-6 shadow-2xl shadow-rose-950/40 text-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Destructive Statement Detected
              </h3>
              <p className="text-xs text-rose-300 mt-0.5">
                Operation: <span className="font-mono font-bold uppercase">{destructiveModal.operationType || 'DATA MUTATION'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={closeDestructiveModal}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 p-3 bg-slate-950/80 rounded-lg border border-slate-800">
          <p className="text-xs text-slate-300 leading-relaxed">
            {destructiveModal.reason || 
              'This statement alters or removes records or schema definitions in the database. In Demo Mode, destructive commands require explicit user authorization.'}
          </p>
          <div className="mt-2 p-2 bg-slate-900 rounded font-mono text-[11px] text-amber-300/90 max-h-24 overflow-y-auto whitespace-pre-wrap break-all border border-slate-800">
            {destructiveModal.sql}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={closeDestructiveModal}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors"
          >
            Cancel Query
          </button>
          <button
            onClick={confirmDestructiveExecution}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-colors"
          >
            Proceed with Execution
          </button>
        </div>
      </div>
    </div>
  );
};
