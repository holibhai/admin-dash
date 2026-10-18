/**
 * AiPermissionDenied
 * Role-aware guard screen shown when an unauthorized user role (e.g. TEACHER) attempts
 * to access the administrative AI assistant.
 */

import React from 'react';
import { ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';
import { AdminRole } from '../types/ai.types';

interface AiPermissionDeniedProps {
  currentRole: string;
  onElevateRole: () => void;
}

export const AiPermissionDenied: React.FC<AiPermissionDeniedProps> = ({
  currentRole,
  onElevateRole,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-lg mx-auto text-center space-y-4 animate-in fade-in duration-200">
      <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 shadow-xs">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold">
          Access Gate · 403 Forbidden
        </span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Administrator Role Required
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The Mentify Admin AI Assistant provides real-time access to institutional user registries, Keycloak authentication realms, and assessment analytics. Your current profile role is{' '}
          <strong className="text-slate-900 dark:text-white uppercase font-semibold">
            {currentRole}
          </strong>.
        </p>
      </div>

      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 w-full text-left space-y-1">
        <span className="font-semibold block text-slate-900 dark:text-white">
          Authorized Role Policy:
        </span>
        <span>• <code className="text-indigo-600 dark:text-indigo-400 font-mono">ADMIN</code>: Full institutional oversight & curriculum analytics</span>
        <br />
        <span>• <code className="text-indigo-600 dark:text-indigo-400 font-mono">SUPER_ADMIN</code>: Full administrative governance & audit logs</span>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onElevateRole}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Switch to Administrator Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
