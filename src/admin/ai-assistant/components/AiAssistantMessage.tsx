/**
 * AiAssistantMessage
 * Left-aligned rich AI document presentation with Mentify AI avatar, markdown formatting,
 * tools used indicator, copy action, and error recovery.
 */

import React from 'react';
import { Sparkles, Copy, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import { AiMessage } from '../types/ai.types';
import { AiMarkdownRenderer } from './AiMarkdownRenderer';
import { AiToolUsageIndicator } from './AiToolUsageIndicator';

interface AiAssistantMessageProps {
  message: AiMessage;
  onCopy: (id: string, text: string) => void;
  isCopied: boolean;
  onRetry?: (message: AiMessage) => void;
}

export const AiAssistantMessage: React.FC<AiAssistantMessageProps> = ({
  message,
  onCopy,
  isCopied,
  onRetry,
}) => {
  const isError = message.status === 'ERROR';
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-start gap-3.5 max-w-3xl mr-auto animate-in fade-in duration-200">
      {/* Mentify AI Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ring-2 ${
          isError
            ? 'bg-rose-600 text-white ring-rose-100 dark:ring-rose-950/40'
            : 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white ring-indigo-100 dark:ring-indigo-900/40'
        }`}
      >
        {isError ? <AlertTriangle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      <div className="flex-1 min-w-0 space-y-1.5 pt-0.5">
        <div className="flex items-center gap-2 pl-0.5">
          <span className="text-xs font-semibold text-slate-900 dark:text-white">
            Mentify AI
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
            {formattedTime}
          </span>
          <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            Enterprise Core
          </span>
        </div>

        {/* Message Container / Document Body */}
        <div
          className={`p-4 sm:p-5 rounded-2xl rounded-tl-xs text-left leading-relaxed ${
            isError
              ? 'bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
              : 'bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
          }`}
        >
          {isError ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-rose-700 dark:text-rose-300">
                    Failed to process administrative query
                  </span>
                  <p className="text-rose-600/90 dark:text-rose-400 text-[11.5px]">
                    {message.errorMessage || message.content}
                  </p>
                </div>
              </div>

              {onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(message)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Request</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Rich Markdown Formatting */}
              <AiMarkdownRenderer content={message.content} />

              {/* Tools Used Indicator */}
              <AiToolUsageIndicator toolsUsed={message.toolsUsed} />

              {/* Bottom Actions Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={() => onCopy(message.id, message.content)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700/60 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Copied to clipboard
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy response</span>
                    </>
                  )}
                </button>

                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Grounded in Mentify institutional telemetry
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
