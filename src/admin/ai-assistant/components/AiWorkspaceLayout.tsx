/**
 * AiWorkspaceLayout
 * Three-region AI workspace layout:
 * - Left: Conversation sidebar (collapsible rail or full width, mobile drawer)
 * - Center: Main conversation area (header, scrollable messages, message composer)
 * - Right: Contextual system telemetry panel (hidden by default, slide-out drawer)
 */

import React, { useState } from 'react';

interface AiWorkspaceLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  banner?: React.ReactNode;
  messageList: React.ReactNode;
  composer: React.ReactNode;
  contextPanel: React.ReactNode;
  isMobileSidebarOpen: boolean;
  onCloseMobileSidebar: () => void;
}

export const AiWorkspaceLayout: React.FC<AiWorkspaceLayoutProps> = ({
  sidebar,
  header,
  banner,
  messageList,
  composer,
  contextPanel,
  isMobileSidebarOpen,
  onCloseMobileSidebar,
}) => {
  return (
    <div className="relative flex h-[calc(100vh-8.5rem)] min-h-[640px] max-h-[920px] w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Desktop / Tablet Left Sidebar */}
      <div className="hidden sm:flex h-full shrink-0">
        {sidebar}
      </div>

      {/* Mobile Drawer Overlay for Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 sm:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobileSidebar}
          />
          <div className="relative z-10 w-72 h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
            {sidebar}
          </div>
        </div>
      )}

      {/* Center Main AI Conversation Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {header}
        {banner}

        {/* Scrollable messages area */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {messageList}
        </div>

        {/* Fixed bottom composer area */}
        <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs shrink-0">
          {composer}
        </div>
      </div>

      {/* Right Contextual Telemetry Panel */}
      {contextPanel}
    </div>
  );
};
