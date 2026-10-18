/**
 * AiUserMessage
 * Right-aligned user chat message bubble with clean typography and timestamp.
 */

import React from 'react';
import { AiMessage } from '../types/ai.types';

interface AiUserMessageProps {
  message: AiMessage;
}

export const AiUserMessage: React.FC<AiUserMessageProps> = ({ message }) => {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-start justify-end gap-3 max-w-3xl ml-auto animate-in fade-in duration-150">
      <div className="flex flex-col items-end space-y-1 max-w-[85%] sm:max-w-[75%]">
        <div className="flex items-center gap-2 pr-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Alex Mercer (Admin)
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
            {formattedTime}
          </span>
        </div>

        <div className="px-4 py-3 rounded-2xl rounded-tr-xs bg-indigo-600 text-white shadow-xs text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>

      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-semibold shadow-xs">
        AM
      </div>
    </div>
  );
};
