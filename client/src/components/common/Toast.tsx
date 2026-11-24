import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useQueryPilot } from '../../context/QueryPilotContext';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useQueryPilot();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
      {toasts.map(t => {
        let Icon = Info;
        let borderClass = 'border-sky-500/30';
        let bgClass = 'bg-slate-900/95';
        let textClass = 'text-sky-400';

        if (t.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-emerald-500/40';
          textClass = 'text-emerald-400';
        } else if (t.type === 'error') {
          Icon = AlertCircle;
          borderClass = 'border-rose-500/40';
          textClass = 'text-rose-400';
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3 rounded-xl border ${borderClass} ${bgClass} shadow-xl backdrop-blur-md text-slate-200 animate-slide-up`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${textClass}`} />
            <p className="text-xs flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-500 hover:text-slate-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
