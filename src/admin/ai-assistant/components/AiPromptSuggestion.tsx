/**
 * AiPromptSuggestion Card
 * Displays suggested prompt cards based on verified tools and educational guidance.
 */

import React from 'react';
import { ArrowUpRight, Database, BookOpen, BarChart3, HelpCircle } from 'lucide-react';
import { PromptSuggestion } from '../types/ai.types';

interface AiPromptSuggestionProps {
  suggestion: PromptSuggestion;
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export const AiPromptSuggestion: React.FC<AiPromptSuggestionProps> = ({
  suggestion,
  onSelect,
  disabled,
}) => {
  const getIcon = () => {
    switch (suggestion.category) {
      case 'tool':
        return <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'concept':
        return <BookOpen className="w-4 h-4 text-violet-600 dark:text-violet-400" />;
      case 'analytics':
        return <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(suggestion.prompt)}
      className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all text-left flex flex-col justify-between group shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 transition-colors">
              {getIcon()}
            </div>
            {suggestion.toolName && (
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-200/40 dark:border-indigo-800/40">
                Tool Grounded
              </span>
            )}
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {suggestion.title}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {suggestion.description}
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 italic line-clamp-1">
        "{suggestion.prompt}"
      </div>
    </button>
  );
};
