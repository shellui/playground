const STORAGE_KEY = 'shellui-playground-chat-v1';

/**
 * @typedef {{ id: string, role: 'user' | 'assistant', content: string, createdAt: number }} ChatMessage
 * @typedef {{ id: string, title: string, updatedAt: number, messages: ChatMessage[] }} ChatConversation
 * @typedef {{ conversations: ChatConversation[], activeId: string | null }} ChatStore
 */

/** @returns {ChatStore} */
export function emptyChatStore() {
  return { conversations: [], activeId: null };
}

/** @returns {ChatStore} */
export function loadChatStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyChatStore();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.conversations)) return emptyChatStore();
    return {
      conversations: parsed.conversations,
      activeId: typeof parsed.activeId === 'string' ? parsed.activeId : null,
    };
  } catch {
    return emptyChatStore();
  }
}

/** @param {ChatStore} store */
export function saveChatStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore quota / private mode */
  }
}

export function createId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * @param {string} content
 * @param {string} fallback
 */
export function titleFromPrompt(content, fallback = 'New chat') {
  const trimmed = content.replace(/\s+/g, ' ').trim();
  if (!trimmed) return fallback;
  return trimmed.length > 42 ? `${trimmed.slice(0, 42)}…` : trimmed;
}
