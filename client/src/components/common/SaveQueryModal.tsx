import React, { useState } from 'react';
import { Bookmark, X } from 'lucide-react';
import { useQueryPilot } from '../../context/QueryPilotContext';

interface SaveQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaveQueryModal: React.FC<SaveQueryModalProps> = ({ isOpen, onClose }) => {
  const { saveQuery } = useQueryPilot();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveQuery(name.trim(), description.trim() || undefined);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-750 rounded-xl max-w-md w-full p-5 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Save Query to Library</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Query Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Monthly Sales Breakdown"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-750 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Notes on what this query does or when to run it..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-750 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50"
            >
              Save Query
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
