/**
 * AiToolUsageIndicator
 * Subtle expandable badge below AI responses indicating authorized institutional tools used.
 * Strictly presents verified backend tools:
 * - getUserRegistrationOverview
 * - getTodayQuizPerformance
 */

import React, { useState } from 'react';
import { Database, ChevronDown, ChevronUp, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AiToolUsageIndicatorProps {
  toolsUsed?: string[];
}

const TOOL_METADATA: Record<string, { label: string; service: string; desc: string }> = {
  getUserRegistrationOverview: {
    label: 'User Registration Overview',
    service: 'Spring Boot User Service (Keycloak Realm)',
    desc: 'Audited active student/teacher rosters, QoQ growth velocity, and pending invitation tokens.',
  },
  getTodayQuizPerformance: {
    label: "Today's Quiz Performance",
    service: 'Mentify Assessment Microservice',
    desc: 'Queried real-time quiz pass rates, score variances, and module submission completion.',
  },
};

export const AiToolUsageIndicator: React.FC<AiToolUsageIndicatorProps> = ({ toolsUsed }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!toolsUsed || toolsUsed.length === 0) {
    return null;
  }

  return (
    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/70 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 border border-slate-200/60 dark:border-slate-700/50 transition-colors group"
      >
        <Database className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
        <span>Mentify data used ({toolsUsed.length})</span>
        {isOpen ? (
          <ChevronUp className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
        ) : (
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Authorized Microservice Telemetry</span>
          </div>

          <div className="space-y-1.5">
            {toolsUsed.map((tool) => {
              const meta = TOOL_METADATA[tool] || {
                label: tool,
                service: 'Institutional Microservice',
                desc: 'Executed verified institutional data query.',
              };

              return (
                <div
                  key={tool}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs flex items-start gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white text-[11.5px]">
                        {meta.label}
                      </span>
                      <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.2 rounded border border-indigo-200/40 dark:border-indigo-800/40">
                        {tool}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {meta.desc}
                    </p>
                    <span className="text-[9.5px] text-slate-400 dark:text-slate-500 block mt-0.5">
                      Service: {meta.service}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
