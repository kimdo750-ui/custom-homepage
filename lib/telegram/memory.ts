interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface UserContext {
  userId: number;
  messages: ConversationMessage[];
  lastActivity: number;
  context: {
    marketingStage: 'planning' | 'preparation' | 'execution' | 'optimization';
    focusArea: string;
    notes: string[];
  };
}

// 메모리 저장소 (프로덕션에서는 DB 사용)
const conversationMemory = new Map<number, UserContext>();

const MAX_MEMORY_DAYS = 30;
const MAX_MESSAGES_PER_USER = 100;

export function getOrCreateUserContext(userId: number): UserContext {
  if (!conversationMemory.has(userId)) {
    conversationMemory.set(userId, {
      userId,
      messages: [],
      lastActivity: Date.now(),
      context: {
        marketingStage: 'preparation',
        focusArea: 'content-strategy',
        notes: [],
      },
    });
  }
  return conversationMemory.get(userId)!;
}

export function addMessage(userId: number, role: 'user' | 'assistant', content: string) {
  const context = getOrCreateUserContext(userId);
  context.messages.push({
    role,
    content,
    timestamp: Date.now(),
  });
  context.lastActivity = Date.now();

  // 최대 메시지 수 초과하면 오래된 것부터 삭제
  if (context.messages.length > MAX_MESSAGES_PER_USER) {
    context.messages = context.messages.slice(-MAX_MESSAGES_PER_USER);
  }
}

export function getConversationHistory(userId: number, maxMessages = 10): string {
  const context = getOrCreateUserContext(userId);
  const recentMessages = context.messages.slice(-maxMessages);

  if (recentMessages.length === 0) {
    return '[대화 없음 - 처음 시작]';
  }

  return recentMessages
    .map((msg) => `${msg.role === 'user' ? '사용자' : '어시스턴트'}: ${msg.content}`)
    .join('\n\n');
}

export function updateUserContext(userId: number, updates: Partial<UserContext['context']>) {
  const context = getOrCreateUserContext(userId);
  context.context = { ...context.context, ...updates };
}

export function addContextNote(userId: number, note: string) {
  const context = getOrCreateUserContext(userId);
  context.context.notes.push(note);
  if (context.context.notes.length > 20) {
    context.context.notes = context.context.notes.slice(-20);
  }
}

export function getUserSummary(userId: number): string {
  const context = getOrCreateUserContext(userId);
  const lastMessage = context.messages[context.messages.length - 1];
  const lastMessageTime = lastMessage
    ? new Date(lastMessage.timestamp).toLocaleString('ko-KR')
    : '없음';

  return `
사용자: ${userId}
마케팍 단계: ${context.context.marketingStage}
초점: ${context.context.focusArea}
마지막 활동: ${lastMessageTime}
대화 수: ${context.messages.length}
메모: ${context.context.notes.slice(-3).join(' | ') || '없음'}
  `.trim();
}

// 오래된 대화 정리 (매 시간)
export function cleanupOldConversations() {
  const now = Date.now();
  const maxAge = MAX_MEMORY_DAYS * 24 * 60 * 60 * 1000;

  for (const [userId, context] of conversationMemory.entries()) {
    if (now - context.lastActivity > maxAge) {
      conversationMemory.delete(userId);
    }
  }
}
