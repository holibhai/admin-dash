/**
 * AiAssistantPage
 * Exported page component wrapping MentifyAIAssistant for routing and modular structure.
 */

import React from 'react';
import { MentifyAIAssistant } from '../MentifyAIAssistant';
import { AdminRole } from '../../types';

interface AiAssistantPageProps {
  role?: AdminRole;
  onRoleChange?: (newRole: AdminRole) => void;
}

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({ role, onRoleChange }) => {
  return <MentifyAIAssistant role={role} onRoleChange={onRoleChange} />;
};

export default AiAssistantPage;
