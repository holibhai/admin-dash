/**
 * AiConversationSidebar
 * Linear/ChatGPT-inspired sidebar for conversation management.
 * Features:
 * - Grouped by timestamp: Today, Yesterday, Previous 7 Days, Older
 * - Real-time search with zero-results state
 * - Quick New Chat button
 * - Hover / action menu for Rename & Delete
 * - Collapsed rail state & mobile drawer integration
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  X,
  MessageSquare,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
} from 'lucide-react';
import { AiConversation, ConversationDateGroup } from '../types/ai.types';

interface AiConversationSidebarProps {
  conversations: AiConversation[];
  groupedConversations: Record<ConversationDateGroup, AiConversation[]>;
  activeConversationId: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onOpenRename: (conv: AiConversation) => void;
  onOpenDelete: (conv: AiConversation) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isLoading: boolean;
  onCloseMobileDrawer?: () => void;
}

export const AiConversationSidebar: React.FC<AiConversationSidebarProps> = ({
  conversations,
  groupedConversations,
  activeConversationId,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  onNewChat,
  onOpenRename,
  onOpenDelete,
  isCollapsed,
  onToggleCollapse,
  isLoading,
  onCloseMobileDrawer,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const groups: ConversationDateGroup[] = ['Today', 'Yesterday', 'Previous 7 Days', 'Older'];
  const hasConversations = conversations.length > 0;
  const isSearchActive = searchQuery.trim().length > 0;

  // Collapsed rail view
  if (isCollapsed) {
    return (
      <div className="w-14 shrink-0 flex flex-col items-center py-4 bg-slate-50/70 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 transition-all select-none">
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Expand conversation sidebar"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="my-3 w-8 h-[1px] bg-slate-200 dark:bg-slate-800" />

        <button
          type="button"
          onClick={onNewChat}
          title="Start New Chat"
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="mt-4 flex-1 flex flex-col items-center gap-2 overflow-y-auto no-scrollbar w-full">
          {conversations.slice(0, 8).map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelectConversation(conv.id)}
                title={conv.title}
                className={`p-2 rounded-xl transition-colors relative group ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-indigo-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 sm:w-80 shrink-0 flex flex-col h-full bg-slate-50/60 dark:bg-slate-900/80 border-r border-slate-200 dark:border-slate-800 transition-all overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Conversations
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-800/40">
            {conversations.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onCloseMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="sm:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className="hidden sm:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* New Chat Button & Search */}
      <div className="p-3 space-y-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            if (onCloseMobileDrawer) onCloseMobileDrawer();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all shadow-xs group"
        >
          <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          <span>New Chat</span>
        </button>

        {/* Search input */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation List Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs">
        {isLoading ? (
          <div className="space-y-3 p-2 animate-pulse">
            <div className="w-20 h-3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-full h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="w-full h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="w-16 h-3 rounded bg-slate-200 dark:bg-slate-800 mt-4" />
            <div className="w-full h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        ) : !hasConversations ? (
          <div className="p-6 text-center space-y-2 text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto opacity-40 text-indigo-500" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
              No conversations yet
            </p>
            <p className="text-[11px]">
              Start a new chat to explore registrations, quiz metrics, and educational guidance.
            </p>
          </div>
        ) : (
          <>
            {/* Render Groups */}
            {groups.map((group) => {
              const items = groupedConversations[group];
              if (!items || items.length === 0) return null;

              return (
                <div key={group} className="space-y-1">
                  <div className="px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    {group === 'Today' || group === 'Yesterday' ? (
                      <Clock className="w-3 h-3" />
                    ) : (
                      <Calendar className="w-3 h-3" />
                    )}
                    <span>{group}</span>
                    <span className="text-[9.5px] font-mono">({items.length})</span>
                  </div>

                  <div className="space-y-0.5">
                    {items.map((conv) => {
                      const isActive = conv.id === activeConversationId;
                      const isMenuOpen = activeMenuId === conv.id;

                      return (
                        <div
                          key={conv.id}
                          className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/80 font-medium'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                          onClick={() => {
                            onSelectConversation(conv.id);
                            if (onCloseMobileDrawer) onCloseMobileDrawer();
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <MessageSquare
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isActive
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                              }`}
                            />
                            <span className="truncate text-xs leading-normal">
                              {conv.title}
                            </span>
                          </div>

                          {/* Hover / Three-Dot Actions */}
                          <div
                            className={`flex items-center gap-0.5 shrink-0 ${
                              isMenuOpen || isActive
                                ? 'opacity-100'
                                : 'opacity-0 group-hover:opacity-100'
                            } transition-opacity`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => onOpenRename(conv)}
                              title="Rename Conversation"
                              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenDelete(conv)}
                              title="Delete Conversation"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Search empty results */}
            {isSearchActive &&
              Object.values(groupedConversations).every((g) => g.length === 0) && (
                <div className="p-6 text-center text-slate-400 space-y-1">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    No results found
                  </p>
                  <p className="text-[11px]">
                    No conversation title matches "{searchQuery}"
                  </p>
                </div>
              )}
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 text-[10.5px] text-slate-400 flex items-center justify-between">
        <span>Mentify AI Core v2.4</span>
        <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-200/40 dark:border-emerald-800/40">
          STOMP Ready
        </span>
      </div>
    </div>
  );
};
