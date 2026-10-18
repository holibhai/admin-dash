/**
 * AiWelcomeScreen
 * Empty state screen for new conversations.
 * Centered Mentify AI branding, title, subtitle, and 4 verified suggested prompt cards.
 */

import React from 'react';
import { Sparkles, Shield, Cpu } from 'lucide-react';
import { AiPromptSuggestion } from './AiPromptSuggestion';
import { PromptSuggestion } from '../types/ai.types';

interface AiWelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const SUGGESTIONS: PromptSuggestion[] = [
  {
    id: 'sug-1',
    title: 'Summarize user registrations',
    description: 'Audit verified student, teacher, and administrator onboarding velocity.',
    prompt: 'Summarize user registrations across the platform this term.',
    category: 'tool',
    toolName: 'getUserRegistrationOverview',
  },
  {
    id: 'sug-2',
    title: "How are today's quizzes performing?",
    description: 'Inspect live quiz pass rates, score variances, and module submissions.',
    prompt: "How are today's quizzes performing across our departments?",
    category: 'tool',
    toolName: 'getTodayQuizPerformance',
  },
  {
    id: 'sug-3',
    title: 'Explain an educational concept',
    description: 'Explore Bloom taxonomy mapping, formative assessment, and rubric design.',
    prompt: 'Explain the difference between formative and summative assessments for course syllabi.',
    category: 'concept',
  },
  {
    id: 'sug-4',
    title: 'Understand student performance metrics',
    description: 'Review cohort retention benchmarks and GPA distribution standards.',
    prompt: 'Help me understand student performance metrics and academic early warning indicators.',
    category: 'analytics',
  },
];

export const AiWelcomeScreen: React.FC<AiWelcomeScreenProps> = ({ onSelectPrompt, disabled }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto my-auto animate-in fade-in duration-300">
      {/* Centered Identity */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-50 dark:ring-indigo-950/50">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold tracking-wide uppercase border border-indigo-200/50 dark:border-indigo-800/40">
            <Cpu className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>Mentify AI Workspace</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            How can I help you today?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Ask questions, explore insights, and make informed decisions with Mentify AI.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span>Keycloak RBAC Enforced</span>
          </span>
          <span>•</span>
          <span>Spring Boot Microservices</span>
          <span>•</span>
          <span>Continuous Context Memory</span>
        </div>
      </div>

      {/* Suggested Prompt Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
        {SUGGESTIONS.map((suggestion) => (
          <AiPromptSuggestion
            key={suggestion.id}
            suggestion={suggestion}
            onSelect={onSelectPrompt}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};
