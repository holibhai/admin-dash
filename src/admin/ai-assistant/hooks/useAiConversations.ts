/**
 * Hook: useAiConversations
 * Manages conversation list, date grouping (Today, Yesterday, 7 Days, Older),
 * search filtering, selection, creation, renaming, and deletion.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AiConversation, ConversationDateGroup } from '../types/ai.types';
import { aiConversationApi } from '../services/aiConversationApi';

const ACTIVE_CONV_STORAGE_KEY = 'mentify_ai_active_conv_id';

export function useAiConversations() {
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load conversations on mount
  const refreshConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const list = await aiConversationApi.getConversations();
      setConversations(list);

      // Restore active conversation from localStorage or default to first
      const savedActiveId = localStorage.getItem(ACTIVE_CONV_STORAGE_KEY);
      if (savedActiveId && list.some((c) => c.id === savedActiveId)) {
        setActiveConversationId(savedActiveId);
      } else if (list.length > 0) {
        // Default to most recently updated
        setActiveConversationId(list[0].id);
        localStorage.setItem(ACTIVE_CONV_STORAGE_KEY, list[0].id);
      } else {
        setActiveConversationId(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load conversations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Select conversation
  const selectConversation = useCallback((id: string | null) => {
    setActiveConversationId(id);
    if (id) {
      localStorage.setItem(ACTIVE_CONV_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_CONV_STORAGE_KEY);
    }
  }, []);

  // Create new conversation
  const createNewConversation = useCallback(
    async (title?: string): Promise<AiConversation> => {
      try {
        const newConv = await aiConversationApi.createConversation(title);
        setConversations((prev) => [newConv, ...prev]);
        selectConversation(newConv.id);
        return newConv;
      } catch (err: any) {
        setError(err?.message || 'Failed to create conversation');
        throw err;
      }
    },
    [selectConversation]
  );

  // Rename conversation
  const renameConversation = useCallback(async (id: string, newTitle: string) => {
    try {
      const updated = await aiConversationApi.renameConversation(id, newTitle);
      setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Failed to rename conversation');
      throw err;
    }
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await aiConversationApi.deleteConversation(id);
        setConversations((prev) => {
          const remaining = prev.filter((c) => c.id !== id);
          if (activeConversationId === id) {
            const nextActive = remaining.length > 0 ? remaining[0].id : null;
            selectConversation(nextActive);
          }
          return remaining;
        });
      } catch (err: any) {
        setError(err?.message || 'Failed to delete conversation');
        throw err;
      }
    },
    [activeConversationId, selectConversation]
  );

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  // Grouped conversations by date
  const groupedConversations = useMemo(() => {
    const groups: Record<ConversationDateGroup, AiConversation[]> = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: [],
    };

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const sevenDaysAgoStart = todayStart - 86400000 * 6;

    filteredConversations.forEach((conv) => {
      const convTime = new Date(conv.updatedAt || conv.createdAt).getTime();

      if (convTime >= todayStart) {
        groups.Today.push(conv);
      } else if (convTime >= yesterdayStart) {
        groups.Yesterday.push(conv);
      } else if (convTime >= sevenDaysAgoStart) {
        groups['Previous 7 Days'].push(conv);
      } else {
        groups.Older.push(conv);
      }
    });

    return groups;
  }, [filteredConversations]);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  return {
    conversations,
    filteredConversations,
    groupedConversations,
    activeConversationId,
    activeConversation,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    selectConversation,
    createNewConversation,
    renameConversation,
    deleteConversation,
    refreshConversations,
  };
}
