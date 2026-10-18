/**
 * AiMessageComposer
 * ChatGPT-style multi-line message composer.
 * Features:
 * - Auto-growing textarea
 * - Enter to send, Shift+Enter for newline
 * - Character count with warning when approaching 4000-char limit
 * - Clear disabled states during processing or empty input
 * - Validation feedback
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft, AlertCircle } from 'lucide-react';

interface AiMessageComposerProps {
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_CHARS = 4000;
const WARNING_THRESHOLD = 3500;

export const AiMessageComposer: React.FC<AiMessageComposerProps> = ({
  onSendMessage,
  isProcessing,
  disabled = false,
  placeholder = 'Ask Mentify AI about registrations, quiz performance, or educational insights...',
}) => {
  const [text, setText] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Cap maximum height to 180px before scrolling
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();

    if (!trimmed) {
      setShowValidation(true);
      setTimeout(() => setShowValidation(false), 2500);
      return;
    }

    if (isProcessing || disabled) return;

    onSendMessage(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount = text.length;
  const isNearLimit = charCount >= WARNING_THRESHOLD;
  const isOverLimit = charCount > MAX_CHARS;
  const canSend = text.trim().length > 0 && !isProcessing && !disabled && !isOverLimit;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Validation banner */}
      {showValidation && (
        <div className="absolute -top-9 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs shadow-xs animate-in fade-in duration-150">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Please enter a non-blank prompt to message Mentify AI.</span>
        </div>
      )}

      {/* Near-limit character warning */}
      {isNearLimit && (
        <div className="absolute -top-7 right-2 text-[11px] font-mono font-medium text-amber-600 dark:text-amber-400">
          {charCount} / {MAX_CHARS} characters
        </div>
      )}

      <div className="relative flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          disabled={disabled || isProcessing}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full resize-none px-4 py-3 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none max-h-48 overflow-y-auto leading-relaxed disabled:opacity-50"
        />

        <div className="flex items-center justify-between px-3.5 pb-2.5 pt-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-[10.5px]">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">
                Enter
              </kbd>
              <span>to send</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">
                Shift + Enter
              </kbd>
              <span>new line</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {charCount > 100 && (
              <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                {charCount}/{MAX_CHARS}
              </span>
            )}

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!canSend}
              title={canSend ? 'Send message' : 'Enter a prompt to send'}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
