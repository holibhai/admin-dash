/**
 * Mentify AI Assistant Workspace
 * Premium ChatGPT/Claude/Linear-style administrative workspace.
 * Features:
 * - 3-region workspace layout (Sidebar, Chat Viewport, Contextual Telemetry Panel)
 * - Persistent conversation history via REST API contracts
 * - Real-time STOMP WebSocket status (/ws/ai, /app/ai/chat, /user/queue/ai/chat)
 * - Continuous contextual memory & multi-turn dialog retention
 * - Verified institutional tools: getUserRegistrationOverview, getTodayQuizPerformance
 * - Rich markdown document rendering (headings, tables, code blocks, copy)
 * - Full CRUD: Create, Switch, Rename, Delete conversations
 * - Role-based access control (ADMIN, SUPER_ADMIN)
 */

import React, { useState, useCallback } from 'react';
import { PageHeader } from '../components/PageHeader';
import { AdminRole } from '../types';
import { AiConversation } from './types/ai.types';
import { useAiConversations } from './hooks/useAiConversations';
import { useAiWebSocket } from './hooks/useAiWebSocket';
import { useAiChat } from './hooks/useAiChat';
import { AiWorkspaceLayout } from './components/AiWorkspaceLayout';
import { AiConversationSidebar } from './components/AiConversationSidebar';
import { AiChatHeader } from './components/AiChatHeader';
import { AiMessageList } from './components/AiMessageList';
import { AiMessageComposer } from './components/AiMessageComposer';
import { AiConnectionStatus } from './components/AiConnectionStatus';
import { AiContextualPanel } from './components/AiContextualPanel';
import { AiRenameDialog } from './components/AiRenameDialog';
import { AiDeleteDialog } from './components/AiDeleteDialog';
import { AiPermissionDenied } from './components/AiPermissionDenied';

interface MentifyAIAssistantProps {
  role?: AdminRole;
  onRoleChange?: (newRole: AdminRole) => void;
}

export const MentifyAIAssistant: React.FC<MentifyAIAssistantProps> = ({
  role = 'SUPER_ADMIN',
  onRoleChange,
}) => {
  // 1. Conversation Management Hook
  const {
    conversations,
    groupedConversations,
    activeConversationId,
    activeConversation,
    searchQuery,
    setSearchQuery,
    isLoading: isConversationsLoading,
    selectConversation,
    createNewConversation,
    renameConversation,
    deleteConversation,
  } = useAiConversations();

  // Helper when user sends message while on empty screen
  const handleEnsureActiveConversation = useCallback(async (): Promise<string> => {
    const created = await createNewConversation();
    return created.id;
  }, [createNewConversation]);

  // 2. Chat & Message Hook
  const {
    messages,
    isProcessing,
    isHistoryLoading,
    copiedId,
    sendMessage,
    retryMessage,
    copyMessage,
    handleWebSocketMessage,
  } = useAiChat(activeConversationId, handleEnsureActiveConversation);

  // 3. WebSocket STOMP Client Hook
  const {
    status: wsStatus,
    reconnect,
    simulateDisconnect,
  } = useAiWebSocket(handleWebSocketMessage);

  // 4. UI Layout States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);

  // 5. Modals State
  const [renameTarget, setRenameTarget] = useState<AiConversation | null>(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AiConversation | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleOpenRename = (conv: AiConversation) => {
    setRenameTarget(conv);
    setIsRenameOpen(true);
  };

  const handleOpenDelete = (conv: AiConversation) => {
    setDeleteTarget(conv);
    setIsDeleteOpen(true);
  };

  const handleStartNewChat = async () => {
    await createNewConversation('New Conversation');
  };

  // Role Gate: Only ADMIN and SUPER_ADMIN have access to this workspace
  if ((role as string) === 'TEACHER') {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Mentify AI Assistant"
          description="Enterprise AI intelligence agent grounded in Mentify institutional data and microservices."
          breadcrumbs={[
            { label: 'Admin' },
            { label: 'Platform Operations' },
            { label: 'Mentify AI' },
          ]}
        />
        <div className="h-[520px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center">
          <AiPermissionDenied
            currentRole={role}
            onElevateRole={() => onRoleChange && onRoleChange('ADMIN')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Page Header */}
      <PageHeader
        title="Mentify AI Assistant"
        description="Premium conversational intelligence workspace grounded in Keycloak authentication, Spring Boot microservices, and live assessment analytics."
        breadcrumbs={[
          { label: 'Admin' },
          { label: 'Platform Operations' },
          { label: 'Mentify AI Workspace' },
        ]}
      />

      {/* Main 3-Region AI Workspace */}
      <AiWorkspaceLayout
        sidebar={
          <AiConversationSidebar
            conversations={conversations}
            groupedConversations={groupedConversations}
            activeConversationId={activeConversationId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectConversation={selectConversation}
            onNewChat={handleStartNewChat}
            onOpenRename={handleOpenRename}
            onOpenDelete={handleOpenDelete}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((p) => !p)}
            isLoading={isConversationsLoading}
            onCloseMobileDrawer={() => setIsMobileSidebarOpen(false)}
          />
        }
        header={
          <AiChatHeader
            activeConversation={activeConversation}
            status={wsStatus}
            onReconnect={reconnect}
            onToggleSidebar={() => {
              if (window.innerWidth < 640) {
                setIsMobileSidebarOpen((p) => !p);
              } else {
                setIsSidebarCollapsed((p) => !p);
              }
            }}
            onToggleContextPanel={() => setIsContextPanelOpen((p) => !p)}
            isContextPanelOpen={isContextPanelOpen}
            onNewChat={handleStartNewChat}
            onOpenRename={handleOpenRename}
            onOpenDelete={handleOpenDelete}
          />
        }
        banner={
          <AiConnectionStatus
            status={wsStatus}
            onReconnect={reconnect}
            variant="banner"
          />
        }
        messageList={
          <AiMessageList
            messages={messages}
            isProcessing={isProcessing}
            isLoadingHistory={isHistoryLoading}
            copiedId={copiedId}
            onCopy={copyMessage}
            onRetry={retryMessage}
            onSelectPrompt={(promptText) => sendMessage(promptText)}
          />
        }
        composer={
          <AiMessageComposer
            onSendMessage={sendMessage}
            isProcessing={isProcessing}
            disabled={isConversationsLoading || isHistoryLoading}
          />
        }
        contextPanel={
          <AiContextualPanel
            isOpen={isContextPanelOpen}
            onClose={() => setIsContextPanelOpen(false)}
            status={wsStatus}
            activeConversation={activeConversation}
            onReconnect={reconnect}
            onSimulateDisconnect={simulateDisconnect}
          />
        }
        isMobileSidebarOpen={isMobileSidebarOpen}
        onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
      />

      {/* Rename Conversation Dialog */}
      <AiRenameDialog
        conversation={renameTarget}
        isOpen={isRenameOpen}
        onClose={() => {
          setIsRenameOpen(false);
          setRenameTarget(null);
        }}
        onSave={renameConversation}
      />

      {/* Delete Conversation Confirmation Dialog */}
      <AiDeleteDialog
        conversation={deleteTarget}
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={deleteConversation}
      />
    </div>
  );
};
