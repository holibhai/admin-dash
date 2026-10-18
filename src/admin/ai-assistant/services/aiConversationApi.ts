/**
 * Mentify AI Conversation Service
 * Aligned with REST contract:
 * - POST   /api/ai/conversations
 * - GET    /api/ai/conversations
 * - GET    /api/ai/conversations/{id}
 * - GET    /api/ai/conversations/{id}/messages
 * - PUT    /api/ai/conversations/{id}
 * - DELETE /api/ai/conversations/{id}
 */

import { AiConversation, AiMessage } from '../types/ai.types';

const STORAGE_KEY_CONVERSATIONS = 'mentify_ai_conversations_v2';
const STORAGE_KEY_MESSAGES = 'mentify_ai_messages_v2';

// Seed initial realistic conversations reflecting verified Mentify AI tools and multi-turn conversations
const INITIAL_CONVERSATIONS: AiConversation[] = [
  {
    id: 'conv-reg-audit-01',
    title: 'User Registration Velocity & Keycloak Verification',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago (Today)
    updatedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
  {
    id: 'conv-quiz-eval-02',
    title: "Today's Assessment & Quiz Pass Rates",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date(Date.now() - 86400000 + 1800000).toISOString(),
  },
  {
    id: 'conv-curriculum-03',
    title: 'Bloom Taxonomy Mapping for CS-302',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), // Previous 7 days
    updatedAt: new Date(Date.now() - 86400000 * 4 + 2000000).toISOString(),
  },
  {
    id: 'conv-grading-04',
    title: 'Standardizing GPA Weights Across Faculties',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), // Older
    updatedAt: new Date(Date.now() - 86400000 * 14 + 1000000).toISOString(),
  },
];

const INITIAL_MESSAGES: Record<string, AiMessage[]> = {
  'conv-reg-audit-01': [
    {
      id: 'msg-reg-1',
      conversationId: 'conv-reg-audit-01',
      role: 'user',
      content: 'Summarize user registrations across the platform this term.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'msg-reg-2',
      conversationId: 'conv-reg-audit-01',
      role: 'assistant',
      content: `### 📊 Institutional Registration Synthesis

Based on data from the **Spring Boot User Service** and verified Keycloak credentials:

| Metric | Active Count | Pending Activation | Growth (QoQ) |
| :--- | :--- | :--- | :--- |
| **Students** | 1,420 | 18 | +8.4% |
| **Faculty Teachers** | 84 | 2 | +3.2% |
| **Administrators** | 12 | 0 | Nominal |

#### Key Takeaways
1. **Student Onboarding Velocity**: Registrations peaked following the Fall orientation session with 214 successful SSO authentications in 48 hours.
2. **Keycloak Invitations**: 20 total pending invitation links remain unredeemed. 
3. **Action Item**: Automated reminder emails are scheduled to deploy at 08:00 AM UTC tomorrow for pending teacher accounts (\`dr.aravind@mentify.edu\` and \`elena.rostova@mentify.edu\`).`,
      toolsUsed: ['getUserRegistrationOverview'],
      createdAt: new Date(Date.now() - 3600000 * 1.9).toISOString(),
      status: 'COMPLETED',
    },
    {
      id: 'msg-reg-3',
      conversationId: 'conv-reg-audit-01',
      role: 'user',
      content: 'What about teachers? How many are assigned to active courses?',
      createdAt: new Date(Date.now() - 3600000 * 1.6).toISOString(),
    },
    {
      id: 'msg-reg-4',
      conversationId: 'conv-reg-audit-01',
      role: 'assistant',
      content: `Continuing from the previous teacher registration breakdown:

Of the **84 registered faculty members**:
- **78 teachers (92.8%)** are currently assigned to lead at least one active course module.
- **6 teachers** are allocated as adjunct researchers or on sabbatical leave.
- **Top department allocation**: Computer Science & Engineering leads with 28 instructors, followed by Pure Mathematics with 19.

No department has unstaffed mandatory course sections for the current academic term.`,
      toolsUsed: ['getUserRegistrationOverview'],
      createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      status: 'COMPLETED',
    },
  ],
  'conv-quiz-eval-02': [
    {
      id: 'msg-q-1',
      conversationId: 'conv-quiz-eval-02',
      role: 'user',
      content: "How are today's quizzes performing across our departments?",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'msg-q-2',
      conversationId: 'conv-quiz-eval-02',
      role: 'assistant',
      content: `### 🎯 Assessment Engine: Today's Quiz Performance

Here is the real-time summary from the **Mentify Assessment Microservice**:

| Quiz Identifier | Subject | Submissions | Average Score | Pass Rate | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **QZ-MATH-401** | Advanced Calculus | 64 / 72 | **84.5%** | **92.4%** | Active |
| **QZ-CS-302** | Data Structures & Alg. | 88 / 95 | **78.2%** | **86.0%** | Active |
| **QZ-PHYS-402** | Quantum Foundations | 42 / 45 | **88.0%** | **94.7%** | Completed |

#### Analytical Observations:
- **MATH-401**: Students scored above the historic benchmark on multivariable optimization.
- **CS-302**: Question 4 (Dynamic Programming memoization complexity) exhibited a 31% error rate. Suggest notifying instructor Dr. Sarah Chen to review recurrence relations in tomorrow's lecture.`,
      toolsUsed: ['getTodayQuizPerformance'],
      createdAt: new Date(Date.now() - 86400000 + 1200000).toISOString(),
      status: 'COMPLETED',
    },
  ],
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export const aiConversationApi = {
  async getConversations(): Promise<AiConversation[]> {
    const list = loadStorage<AiConversation[]>(STORAGE_KEY_CONVERSATIONS, INITIAL_CONVERSATIONS);
    // Sort descending by updatedAt
    return [...list].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async getConversation(id: string): Promise<AiConversation | null> {
    const list = await this.getConversations();
    const conv = list.find((c) => c.id === id);
    if (!conv) return null;
    const messages = await this.getMessages(id);
    return { ...conv, messages };
  },

  async getMessages(conversationId: string): Promise<AiMessage[]> {
    const allMessages = loadStorage<Record<string, AiMessage[]>>(
      STORAGE_KEY_MESSAGES,
      INITIAL_MESSAGES
    );
    return allMessages[conversationId] || [];
  },

  async createConversation(title?: string): Promise<AiConversation> {
    const conversations = await this.getConversations();
    const newConv: AiConversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title && title.trim() ? title.trim().slice(0, 150) : 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    const updated = [newConv, ...conversations];
    saveStorage(STORAGE_KEY_CONVERSATIONS, updated);

    // Initialize empty messages in map
    const allMessages = loadStorage<Record<string, AiMessage[]>>(
      STORAGE_KEY_MESSAGES,
      INITIAL_MESSAGES
    );
    allMessages[newConv.id] = [];
    saveStorage(STORAGE_KEY_MESSAGES, allMessages);

    return newConv;
  },

  async renameConversation(conversationId: string, newTitle: string): Promise<AiConversation> {
    const trimmed = newTitle.trim().slice(0, 150);
    if (!trimmed) {
      throw new Error('Conversation title cannot be blank.');
    }

    const conversations = await this.getConversations();
    const index = conversations.findIndex((c) => c.id === conversationId);
    if (index === -1) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    const updatedConv: AiConversation = {
      ...conversations[index],
      title: trimmed,
      updatedAt: new Date().toISOString(),
    };

    conversations[index] = updatedConv;
    saveStorage(STORAGE_KEY_CONVERSATIONS, conversations);
    return updatedConv;
  },

  async deleteConversation(conversationId: string): Promise<{ success: boolean }> {
    const conversations = await this.getConversations();
    const filtered = conversations.filter((c) => c.id !== conversationId);
    saveStorage(STORAGE_KEY_CONVERSATIONS, filtered);

    const allMessages = loadStorage<Record<string, AiMessage[]>>(
      STORAGE_KEY_MESSAGES,
      INITIAL_MESSAGES
    );
    delete allMessages[conversationId];
    saveStorage(STORAGE_KEY_MESSAGES, allMessages);

    return { success: true };
  },

  async saveMessage(conversationId: string, message: AiMessage): Promise<void> {
    const allMessages = loadStorage<Record<string, AiMessage[]>>(
      STORAGE_KEY_MESSAGES,
      INITIAL_MESSAGES
    );
    if (!allMessages[conversationId]) {
      allMessages[conversationId] = [];
    }

    // Replace if exists (e.g. status transition) or append
    const existingIdx = allMessages[conversationId].findIndex((m) => m.id === message.id);
    if (existingIdx !== -1) {
      allMessages[conversationId][existingIdx] = message;
    } else {
      allMessages[conversationId].push(message);
    }
    saveStorage(STORAGE_KEY_MESSAGES, allMessages);

    // Update conversation updatedAt timestamp & generate title if was default
    const conversations = await this.getConversations();
    const convIdx = conversations.findIndex((c) => c.id === conversationId);
    if (convIdx !== -1) {
      const conv = conversations[convIdx];
      let newTitle = conv.title;
      if (
        (conv.title === 'New Conversation' || !conv.title) &&
        message.role === 'user' &&
        message.content
      ) {
        newTitle = message.content.slice(0, 48) + (message.content.length > 48 ? '...' : '');
      }

      conversations[convIdx] = {
        ...conv,
        title: newTitle,
        updatedAt: new Date().toISOString(),
      };
      saveStorage(STORAGE_KEY_CONVERSATIONS, conversations);
    }
  },
};
