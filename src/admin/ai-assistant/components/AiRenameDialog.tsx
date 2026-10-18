/**
 * AiRenameDialog
 * Modal dialog for renaming an AI conversation.
 * Enforces non-blank title and 150-char maximum.
 */

import React, { useState, useEffect } from 'react';
import { X, Edit3, Check } from 'lucide-react';
import { AiConversation } from '../types/ai.types';

interface AiRenameDialogProps {
  conversation: AiConversation | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, newTitle: string) => Promise<any>;
}

export const AiRenameDialog: React.FC<AiRenameDialogProps> = ({
  conversation,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (conversation) {
      setTitle(conversation.title);
      setError(null);
    }
  }, [conversation]);

  if (!isOpen || !conversation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setError('Title cannot be blank.');
      return;
    }

    if (trimmed.length > 150) {
      setError('Title cannot exceed 150 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(conversation.id, trimmed);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to rename conversation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Edit3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Rename Conversation
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Conversation Title
            </label>
            <input
              type="text"
              autoFocus
              maxLength={150}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. User Registration Overview"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex items-center justify-between mt-1 text-[11px]">
              {error ? (
                <span className="text-rose-600 dark:text-rose-400">{error}</span>
              ) : (
                <span className="text-slate-400">Maximum 150 characters</span>
              )}
              <span className="font-mono text-slate-400">{title.length}/150</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-xs disabled:opacity-40"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Title'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
