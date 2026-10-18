/**
 * AiConnectionStatus
 * Displays real-time STOMP WebSocket status:
 * CONNECTED, CONNECTING, PROCESSING, ERROR, DISCONNECTED, RECONNECTING.
 * Provides reconnection trigger when disconnected.
 */

import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { AiWebSocketStatus } from '../types/ai.types';

interface AiConnectionStatusProps {
  status: AiWebSocketStatus;
  onReconnect: () => void;
  variant?: 'pill' | 'banner';
}

export const AiConnectionStatus: React.FC<AiConnectionStatusProps> = ({
  status,
  onReconnect,
  variant = 'pill',
}) => {
  if (variant === 'banner') {
    if (status === 'DISCONNECTED') {
      return (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>WebSocket Disconnected.</strong> Operating in HTTP fallback mode with /api/ai/chat.
            </span>
          </div>
          <button
            type="button"
            onClick={onReconnect}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-medium transition-colors shadow-xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reconnect /ws/ai</span>
          </button>
        </div>
      );
    }

    if (status === 'RECONNECTING') {
      return (
        <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-200 dark:border-indigo-900/60 flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
          <span>Reconnecting to Mentify STOMP WebSocket broker (/ws/ai)...</span>
        </div>
      );
    }

    return null;
  }

  // Pill variant (for Header)
  switch (status) {
    case 'CONNECTED':
      return (
        <div
          title="STOMP WebSocket /ws/ai connected"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">STOMP Connected</span>
        </div>
      );

    case 'CONNECTING':
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-400">
          <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
          <span>Connecting...</span>
        </div>
      );

    case 'PROCESSING':
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
          <span className="font-medium">AI Analyzing...</span>
        </div>
      );

    case 'RECONNECTING':
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-medium text-amber-700 dark:text-amber-300">
          <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
          <span>Reconnecting...</span>
        </div>
      );

    case 'DISCONNECTED':
      return (
        <button
          type="button"
          onClick={onReconnect}
          title="Click to reconnect STOMP WebSocket"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 text-[11px] font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-200/80 transition-colors"
        >
          <WifiOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>Offline · Reconnect</span>
        </button>
      );

    case 'ERROR':
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] font-medium text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          <span>AI Service Error</span>
        </div>
      );

    default:
      return null;
  }
};
