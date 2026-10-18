/**
 * AiMessageList
 * Scrollable conversation history viewport.
 * Features:
 * - Smooth scroll to latest messages
 * - Loading skeleton states during conversation switching
 * - Active AI processing indicator
 * - Empty state delegation to WelcomeScreen
 */

import React, { useRef, useEffect } from 'react';
import { AiMessage } from '../types/ai.types';
import { AiUserMessage } from './AiUserMessage';
import { AiAssistantMessage } from './AiAssistantMessage';
import { AiProcessingIndicator } from './AiProcessingIndicator';
import { AiWelcomeScreen } from './AiWelcomeScreen';

interface AiMessageListProps {
  messages: AiMessage[];
  isProcessing: boolean;
  isLoadingHistory: boolean;
  copiedId: string | null;
  onCopy: (id: string, text: string) => void;
  onRetry: (msg: AiMessage) => void;
  onSelectPrompt: (prompt: string) => void;
}

export const AiMessageList: React.FC<AiMessageListProps> = ({
  messages,
  isProcessing,
  isLoadingHistory,
  copiedId,
  onCopy,
  onRetry,
  onSelectPrompt,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message or processing state change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  if (isLoadingHistory) {
    return (
      <div className="flex-1 p-6 space-y-6 max-w-4xl mx-auto w-full animate-pulse">
        {/* Skeleton user message */}
        <div className="flex justify-end gap-3">
          <div className="w-64 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
        {/* Skeleton assistant response */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="w-32 h-4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-full h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return <AiWelcomeScreen onSelectPrompt={onSelectPrompt} disabled={isProcessing} />;
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message) => {
          if (message.role === 'user') {
            return <AiUserMessage key={message.id} message={message} />;
          }
          return (
            <AiAssistantMessage
              key={message.id}
              message={message}
              onCopy={onCopy}
              isCopied={copiedId === message.id}
              onRetry={onRetry}
            />
          );
        })}

        {isProcessing && <AiProcessingIndicator />}

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};
