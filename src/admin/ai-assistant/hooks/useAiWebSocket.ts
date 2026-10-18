/**
 * Hook: useAiWebSocket
 * Subscribes to STOMP WebSocket status and messages.
 */

import { useState, useEffect, useCallback } from 'react';
import { AiWebSocketStatus, AiWebSocketMessage } from '../types/ai.types';
import { aiWebSocketClient } from '../services/aiWebSocketClient';

export function useAiWebSocket(onMessageReceived?: (msg: AiWebSocketMessage) => void) {
  const [status, setStatus] = useState<AiWebSocketStatus>(aiWebSocketClient.getStatus());

  useEffect(() => {
    const unsubStatus = aiWebSocketClient.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    const unsubMsg = onMessageReceived
      ? aiWebSocketClient.onMessage((msg) => {
          onMessageReceived(msg);
        })
      : () => {};

    return () => {
      unsubStatus();
      unsubMsg();
    };
  }, [onMessageReceived]);

  const reconnect = useCallback(() => {
    return aiWebSocketClient.reconnect();
  }, []);

  const simulateDisconnect = useCallback(() => {
    aiWebSocketClient.disconnect(true);
  }, []);

  return {
    status,
    isConnected: status === 'CONNECTED' || status === 'PROCESSING',
    isConnecting: status === 'CONNECTING' || status === 'RECONNECTING',
    isProcessing: status === 'PROCESSING',
    isDisconnected: status === 'DISCONNECTED',
    reconnect,
    simulateDisconnect,
  };
}
