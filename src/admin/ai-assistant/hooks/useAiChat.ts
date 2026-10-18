/**
 * Hook: useAiChat
 * Handles active conversation messages, message submission, clientMessageId correlation,
 * processing state, retry on failure, copy-to-clipboard, and multi-turn context retention.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AiMessage, AiWebSocketMessage } from '../types/ai.types';
import { aiConversationApi } from '../services/aiConversationApi';
import { aiWebSocketClient } from '../services/aiWebSocketClient';
import { aiChatApi } from '../services/aiChatApi';

export function useAiChat(
  conversationId: string | null,
  onConversationCreatedNeeded?: () => Promise<string>
) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const activeConvRef = useRef<string | null>(conversationId);

  activeConvRef.current = conversationId;

  // Load message history when conversationId changes
  useEffect(() => {
    let isCurrent = true;

    async function loadMessages() {
      if (!conversationId) {
        setMessages([]);
        setIsHistoryLoading(false);
        return;
      }

      setIsHistoryLoading(true);
      setError(null);
      try {
        const history = await aiConversationApi.getMessages(conversationId);
        if (isCurrent) {
          setMessages(history);
        }
      } catch (err: any) {
        if (isCurrent) {
          setError(err?.message || 'Failed to load conversation messages.');
        }
      } finally {
        if (isCurrent) {
          setIsHistoryLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      isCurrent = false;
    };
  }, [conversationId]);

  // Handle incoming STOMP WebSocket messages
  const handleWebSocketMessage = useCallback((wsMsg: AiWebSocketMessage) => {
    if (wsMsg.conversationId !== activeConvRef.current) return;

    if (wsMsg.status === 'PROCESSING') {
      setIsProcessing(true);
    } else if (wsMsg.status === 'COMPLETED') {
      setIsProcessing(false);
      const assistantMsg: AiMessage = {
        id: wsMsg.messageId,
        conversationId: wsMsg.conversationId,
        clientMessageId: wsMsg.clientMessageId,
        role: 'assistant',
        content: wsMsg.message,
        toolsUsed: wsMsg.toolsUsed,
        createdAt: wsMsg.timestamp,
        status: 'COMPLETED',
      };

      setMessages((prev) => {
        // Prevent duplicate appending
        if (prev.some((m) => m.id === assistantMsg.id || (m.clientMessageId && m.clientMessageId === assistantMsg.clientMessageId && m.role === 'assistant'))) {
          return prev;
        }
        return [...prev, assistantMsg];
      });

      aiConversationApi.saveMessage(wsMsg.conversationId, assistantMsg);
    } else if (wsMsg.status === 'ERROR') {
      setIsProcessing(false);
      setError(wsMsg.message || 'AI service error encountered.');
      const errorMsg: AiMessage = {
        id: wsMsg.messageId,
        conversationId: wsMsg.conversationId,
        clientMessageId: wsMsg.clientMessageId,
        role: 'assistant',
        content: wsMsg.message,
        createdAt: wsMsg.timestamp,
        status: 'ERROR',
        errorMessage: wsMsg.message,
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (text: string, customClientMessageId?: string) => {
      const cleanText = text.trim();
      if (!cleanText || isProcessing) return;

      let targetConvId = activeConvRef.current;

      // If no active conversation, create one first
      if (!targetConvId && onConversationCreatedNeeded) {
        targetConvId = await onConversationCreatedNeeded();
      }

      if (!targetConvId) {
        setError('No active conversation target.');
        return;
      }

      const clientMessageId =
        customClientMessageId || `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const userMsg: AiMessage = {
        id: `user-${Date.now()}`,
        conversationId: targetConvId,
        clientMessageId,
        role: 'user',
        content: cleanText,
        createdAt: new Date().toISOString(),
        status: 'COMPLETED',
      };

      // Add user message to UI immediately
      setMessages((prev) => [...prev, userMsg]);
      await aiConversationApi.saveMessage(targetConvId, userMsg);

      setIsProcessing(true);
      setError(null);

      // Context history for continuous multi-turn follow-ups
      const historyContext = [...messages, userMsg].map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      try {
        if (aiWebSocketClient.getStatus() !== 'DISCONNECTED') {
          // Send via WebSocket STOMP
          await aiWebSocketClient.sendChat(
            {
              conversationId: targetConvId,
              clientMessageId,
              message: cleanText,
            },
            historyContext
          );
        } else {
          // HTTP Fallback when WebSocket is disconnected
          const response = await aiChatApi.sendAiMessage(
            {
              conversationId: targetConvId,
              clientMessageId,
              message: cleanText,
            },
            historyContext
          );

          const assistantMsg: AiMessage = {
            id: response.messageId,
            conversationId: response.conversationId,
            clientMessageId: response.clientMessageId,
            role: 'assistant',
            content: response.message,
            toolsUsed: response.toolsUsed,
            createdAt: response.timestamp,
            status: 'COMPLETED',
          };

          setMessages((prev) => [...prev, assistantMsg]);
          await aiConversationApi.saveMessage(targetConvId, assistantMsg);
          setIsProcessing(false);
        }
      } catch (err: any) {
        setIsProcessing(false);
        const errMsgText = err?.message || 'Failed to process AI response.';
        setError(errMsgText);

        const errorMsg: AiMessage = {
          id: `err-${Date.now()}`,
          conversationId: targetConvId,
          clientMessageId,
          role: 'assistant',
          content: `Unable to complete institutional AI request: ${errMsgText}`,
          createdAt: new Date().toISOString(),
          status: 'ERROR',
          errorMessage: errMsgText,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    },
    [isProcessing, messages, onConversationCreatedNeeded]
  );

  // Retry failed request
  const retryMessage = useCallback(
    async (failedMsg: AiMessage) => {
      // Find the corresponding user message
      const failedIdx = messages.findIndex((m) => m.id === failedMsg.id);
      let userPrompt = '';
      if (failedIdx > 0 && messages[failedIdx - 1].role === 'user') {
        userPrompt = messages[failedIdx - 1].content;
      } else {
        userPrompt = failedMsg.content;
      }

      // Remove the error message
      setMessages((prev) => prev.filter((m) => m.id !== failedMsg.id));
      await sendMessage(userPrompt);
    },
    [messages, sendMessage]
  );

  // Copy message
  const copyMessage = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 2000);
  }, []);

  return {
    messages,
    isProcessing,
    isHistoryLoading,
    error,
    copiedId,
    sendMessage,
    retryMessage,
    copyMessage,
    handleWebSocketMessage,
  };
}
