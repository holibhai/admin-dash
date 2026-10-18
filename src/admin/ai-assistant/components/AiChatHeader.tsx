/**
 * AiChatHeader
 * Header component for the main AI conversation workspace.
 * Features:
 * - Mentify AI branding & title
 * - Current conversation title with edit trigger
 * - Connection status indicator (STOMP WebSocket /ws/ai)
 * - Sidebar collapse toggle
 * - New Chat action
 * - Contextual Info Panel toggle (Right sidebar)
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Menu,
  Plus,
  PanelRight,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { AiConversation, AiWebSocketStatus } from '../types/ai.types';
import { AiConnectionStatus } from './AiConnectionStatus';

interface AiChatHeaderProps {
  activeConversation: AiConversation | null;
  status: AiWebSocketStatus;
  onReconnect: () => void;
  onToggleSidebar: () => void;
  onToggleContextPanel: () => void;
  isContextPanelOpen: boolean;
  onNewChat: () => void;
  onOpenRename: (conv: AiConversation) => void;
  onOpenDelete: (conv: AiConversation) => void;
}

export const AiChatHeader: React.FC<AiChatHeaderProps> = ({
  activeConversation,
  status,
  onReconnect,
  onToggleSidebar,
  onToggleContextPanel,
  isContextPanelOpen,
  onNewChat,
  onOpenRename,
  onOpenDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shrink-0 select-none">
      {/* Left: Sidebar toggle & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          title="Toggle conversation list"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white tracking-tight">
                Mentify AI
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate max-w-[180px] sm:max-w-xs md:max-w-sm">
                {activeConversation ? activeConversation.title : 'New Session'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Actions, WebSocket Status, Context Panel Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Real-time Connection Indicator */}
        <AiConnectionStatus status={status} onReconnect={onReconnect} variant="pill" />

        {/* Conversation Options Menu (if active conversation exists) */}
        {activeConversation && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((p) => !p)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Conversation Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs"
                onClick={() => setIsMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => onOpenRename(activeConversation)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Rename Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenDelete(activeConversation)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Chat</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick New Chat Button */}
        <button
          type="button"
          onClick={onNewChat}
          title="Start fresh conversation"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>New Chat</span>
        </button>

        {/* Toggle Right Contextual Panel */}
        <button
          type="button"
          onClick={onToggleContextPanel}
          title={isContextPanelOpen ? 'Hide System Telemetry' : 'Show System Telemetry & Tools'}
          className={`p-1.5 rounded-lg transition-colors border ${
            isContextPanelOpen
              ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
