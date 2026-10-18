/**
 * AiContextualPanel
 * Right-side drawer providing real-time telemetry, authorized AI tools reference,
 * microservice broker status, and active session diagnostics.
 */

import React from 'react';
import {
  X,
  Server,
  ShieldCheck,
  Cpu,
  Database,
  Radio,
  Wifi,
  WifiOff,
  CheckCircle2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { AiConversation, AiWebSocketStatus } from '../types/ai.types';

interface AiContextualPanelProps {
  isOpen: boolean;
  onClose: () => void;
  status: AiWebSocketStatus;
  activeConversation: AiConversation | null;
  onReconnect: () => void;
  onSimulateDisconnect: () => void;
}

export const AiContextualPanel: React.FC<AiContextualPanelProps> = ({
  isOpen,
  onClose,
  status,
  activeConversation,
  onReconnect,
  onSimulateDisconnect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="w-80 shrink-0 flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200 overflow-y-auto">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              System Context
            </h3>
            <span className="text-[10px] text-slate-400">AI Architecture Telemetry</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-5 text-xs">
        {/* STOMP WebSocket Telemetry */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Real-Time Broker (/ws/ai)
          </span>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                Broker State:
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                  status === 'CONNECTED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : status === 'DISCONNECTED'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {status}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
              <div className="flex justify-between">
                <span>STOMP Endpoint:</span>
                <span className="text-indigo-600 dark:text-indigo-400">/ws/ai</span>
              </div>
              <div className="flex justify-between">
                <span>Send Destination:</span>
                <span className="text-indigo-600 dark:text-indigo-400">/app/ai/chat</span>
              </div>
              <div className="flex justify-between">
                <span>Subscription:</span>
                <span className="text-indigo-600 dark:text-indigo-400">/user/queue/ai/chat</span>
              </div>
            </div>

            {/* Test Connection Toggle Button */}
            <div className="pt-1.5 flex gap-2">
              {status === 'DISCONNECTED' ? (
                <button
                  type="button"
                  onClick={onReconnect}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-colors"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Reconnect WebSocket</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSimulateDisconnect}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Test Disconnect State</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Authorized AI Tools */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span>Authorized Admin Tools</span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white text-[11.5px]">
                  Registration Overview
                </span>
                <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">
                  VERIFIED
                </span>
              </div>
              <code className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-mono">
                getUserRegistrationOverview
              </code>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                Audits real-time student and faculty registration counts, growth velocity, and Keycloak invitation redemption.
              </p>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white text-[11.5px]">
                  Daily Quiz Performance
                </span>
                <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">
                  VERIFIED
                </span>
              </div>
              <code className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-mono">
                getTodayQuizPerformance
              </code>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                Aggregates module assessment pass rates, median scores, and outlier error questions across active courses.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Access Boundary */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Governance & Role Gates</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Admin & Super Admin Authorized</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Read-Only Analytical Probes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Keycloak Realm Token Scoped</span>
            </div>
          </div>
        </div>

        {/* Active Session Info */}
        {activeConversation && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-[10px] text-slate-400">
            <span className="font-semibold text-slate-600 dark:text-slate-300 block">
              Active Session Metadata
            </span>
            <div className="truncate font-mono">ID: {activeConversation.id}</div>
            <div>
              Updated: {new Date(activeConversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
