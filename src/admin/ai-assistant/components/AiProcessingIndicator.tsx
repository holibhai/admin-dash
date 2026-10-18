/**
 * AiProcessingIndicator
 * Premium Claude/Linear-inspired thinking animation for Mentify AI while backend processes.
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

export const AiProcessingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3.5 max-w-3xl animate-in fade-in duration-200">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shrink-0 shadow-xs ring-2 ring-indigo-100 dark:ring-indigo-900/40">
        <Sparkles className="w-4 h-4 animate-spin [animation-duration:3s]" />
      </div>

      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-900 dark:text-white">
            Mentify AI
          </span>
          <span className="text-[10px] text-slate-400">Processing request...</span>
        </div>

        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" />
          </div>
          <span className="text-[11.5px] font-medium text-slate-600 dark:text-slate-300">
            Synthesizing microservices data & formulating response...
          </span>
        </div>
      </div>
    </div>
  );
};
