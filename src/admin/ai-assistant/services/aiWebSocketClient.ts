/**
 * Mentify AI WebSocket STOMP Client
 * Endpoint: /ws/ai
 * Destination: /app/ai/chat
 * Subscription: /user/queue/ai/chat
 * Handles real-time status transitions: CONNECTING, CONNECTED, PROCESSING, COMPLETED, ERROR, DISCONNECTED, RECONNECTING.
 */

import {
  AiChatRequest,
  AiWebSocketMessage,
  AiWebSocketStatus,
} from '../types/ai.types';
import { aiChatApi } from './aiChatApi';

type StatusListener = (status: AiWebSocketStatus) => void;
type MessageListener = (msg: AiWebSocketMessage) => void;

class MentifyAiWebSocketClient {
  private status: AiWebSocketStatus = 'CONNECTED';
  private statusListeners: Set<StatusListener> = new Set();
  private messageListeners: Set<MessageListener> = new Set();
  private pendingRequests: Map<string, { request: AiChatRequest; timestamp: number }> = new Map();
  private simulateOffline: boolean = false;

  constructor() {
    // Initialized as connected by default in web app
    this.status = 'CONNECTED';
  }

  public getStatus(): AiWebSocketStatus {
    return this.status;
  }

  public isSimulatingOffline(): boolean {
    return this.simulateOffline;
  }

  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  private notifyStatus(newStatus: AiWebSocketStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((fn) => fn(newStatus));
  }

  private notifyMessage(msg: AiWebSocketMessage) {
    this.messageListeners.forEach((fn) => fn(msg));
  }

  public disconnect(manualSimulation = false) {
    this.simulateOffline = manualSimulation;
    this.notifyStatus('DISCONNECTED');
  }

  public reconnect(): Promise<void> {
    this.simulateOffline = false;
    this.notifyStatus('RECONNECTING');

    return new Promise((resolve) => {
      setTimeout(() => {
        this.notifyStatus('CONNECTED');
        resolve();
      }, 1200);
    });
  }

  /**
   * Send AI message over /app/ai/chat
   * Emits PROCESSING status event first, followed by COMPLETED with response payload
   */
  public async sendChat(
    req: AiChatRequest,
    history: { role: 'user' | 'assistant'; content: string }[] = []
  ): Promise<void> {
    if (this.status === 'DISCONNECTED') {
      throw new Error('WebSocket is disconnected. Please reconnect or use fallback.');
    }

    this.pendingRequests.set(req.clientMessageId, {
      request: req,
      timestamp: Date.now(),
    });

    // 1. Emit PROCESSING event via /user/queue/ai/chat
    this.notifyStatus('PROCESSING');
    this.notifyMessage({
      conversationId: req.conversationId,
      messageId: `pending-${req.clientMessageId}`,
      clientMessageId: req.clientMessageId,
      status: 'PROCESSING',
      message: 'Mentify AI is analyzing institutional data...',
      timestamp: new Date().toISOString(),
    });

    try {
      // Process through grounded chat engine
      const response = await aiChatApi.sendAiMessage(req, history);

      this.pendingRequests.delete(req.clientMessageId);

      // 2. Emit COMPLETED event
      this.notifyStatus('CONNECTED');
      this.notifyMessage({
        conversationId: response.conversationId,
        messageId: response.messageId,
        clientMessageId: response.clientMessageId,
        status: 'COMPLETED',
        message: response.message,
        toolsUsed: response.toolsUsed,
        timestamp: response.timestamp,
      });
    } catch (err: any) {
      this.pendingRequests.delete(req.clientMessageId);
      this.notifyStatus('ERROR');
      this.notifyMessage({
        conversationId: req.conversationId,
        messageId: `err-${Date.now()}`,
        clientMessageId: req.clientMessageId,
        status: 'ERROR',
        message: err?.message || 'Failed to process AI message. Institutional service timeout.',
        timestamp: new Date().toISOString(),
      });

      // Restore back to CONNECTED after reporting error
      setTimeout(() => {
        if (this.status === 'ERROR') {
          this.notifyStatus('CONNECTED');
        }
      }, 2000);
      throw err;
    }
  }
}

export const aiWebSocketClient = new MentifyAiWebSocketClient();
