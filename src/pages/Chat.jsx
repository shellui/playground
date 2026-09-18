import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import { Bot, Info, MessageSquarePlus, Trash2, TriangleAlert } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { createId, loadChatStore, saveChatStore, titleFromPrompt } from '../lib/chatStore';

const AVAILABILITY_CODE = `import shellui from '@shellui/sdk';

await shellui.init();

const availability = await shellui.ai.languageModel.availability();
// 'available' | 'downloadable' | 'downloading' | 'unavailable'

if (availability !== 'available') {
  // Open Settings → AI to enable providers / pull models
}`;

const PROMPT_CODE = `import shellui from '@shellui/sdk';

const session = await shellui.ai.languageModel.create();
const text = await session.prompt('Summarize this…');
session.destroy();`;

const STREAM_CODE = `import shellui from '@shellui/sdk';

const session = await shellui.ai.languageModel.create();
for await (const chunk of session.promptStreaming('Write a haiku…')) {
  // append chunk to the UI
}
session.destroy();`;

const LIST_MODELS_CODE = `import shellui from '@shellui/sdk';

const models = await shellui.ai.listModels();
const status = await shellui.ai.getStatus();
// status.defaultModelId, status.ollama.reachable, …`;

/** Feature-detect unified AI SDK (shellui#48). */
function hasAiApi() {
  return (
    typeof shellui?.ai?.languageModel?.availability === 'function' &&
    typeof shellui?.ai?.languageModel?.create === 'function'
  );
}

function openShellAiSettings() {
  try {
    if (typeof shellui.openModal === 'function') {
      shellui.openModal('/__settings');
      return;
    }
    if (typeof shellui.navigate === 'function') {
      shellui.navigate('/__settings');
    }
  } catch {
    /* ignore */
  }
}

/**
 * @param {import('../lib/chatStore').ChatMessage[]} messages
 * @returns {Array<{ role: 'user' | 'assistant', content: string }>}
 */
function toInitialPrompts(messages) {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }));
}

export default function Chat() {
  const { t } = useTranslation();
  const [sdkPresent, setSdkPresent] = useState(() => hasAiApi());
  const [availability, setAvailability] = useState(null);
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [checking, setChecking] = useState(true);

  const [store, setStore] = useState(() => loadChatStore());
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [streamHint, setStreamHint] = useState(null);
  const [sendError, setSendError] = useState(null);

  const threadRef = useRef(null);
  const sessionRef = useRef(null);
  const abortRef = useRef(false);
  /** Serializes async SDK destroys so a delayed shell destroy cannot race a new session. */
  const destroyChainRef = useRef(Promise.resolve());

  const conversations = store.conversations;
  const activeId = store.activeId;
  const active = conversations.find((c) => c.id === activeId) ?? conversations[0] ?? null;

  const persist = useCallback((updater) => {
    setStore((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveChatStore(next);
      return next;
    });
  }, []);

  const destroySession = useCallback(async () => {
    const session = sessionRef.current;
    sessionRef.current = null;

    const doDestroy = async () => {
      if (!session || typeof session.destroy !== 'function') return;
      try {
        const result = session.destroy();
        if (result != null && typeof result.then === 'function') {
          await result;
        }
      } catch {
        /* ignore */
      }
    };

    const next = destroyChainRef.current.then(() => doDestroy());
    destroyChainRef.current = next.catch(() => {});
    await next;
  }, []);

  const refreshAiStatus = useCallback(async () => {
    setChecking(true);
    setStatusError(null);
    const present = hasAiApi();
    setSdkPresent(present);
    if (!present) {
      setAvailability(null);
      setStatus(null);
      setChecking(false);
      return;
    }
    try {
      const value = await shellui.ai.languageModel.availability();
      setAvailability(value);
      let snapshot = null;
      if (typeof shellui.ai.getStatus === 'function') {
        snapshot = await shellui.ai.getStatus();
        setStatus(snapshot);
      } else if (typeof shellui.ai.listModels === 'function') {
        const models = await shellui.ai.listModels();
        snapshot = { models, defaultModelId: null };
        setStatus(snapshot);
      } else {
        setStatus(null);
      }
    } catch (err) {
      setAvailability('unavailable');
      setStatus(null);
      setStatusError(err instanceof Error ? err.message : String(err));
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    refreshAiStatus();
    return () => {
      abortRef.current = true;
      void destroySession();
    };
  }, [refreshAiStatus, destroySession]);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [active?.messages, sending]);

  const ensureActiveConversation = useCallback(() => {
    if (active) return active;
    const created = {
      id: createId('chat'),
      title: t('chatNewConversation'),
      updatedAt: Date.now(),
      messages: [],
    };
    persist((prev) => ({
      conversations: [created, ...prev.conversations],
      activeId: created.id,
    }));
    return created;
  }, [active, persist, t]);

  const startNewConversation = useCallback(() => {
    // Chain destroy without blocking the UI; handleSend awaits the chain before create.
    void destroySession();
    setSendError(null);
    setStreamHint(null);
    const created = {
      id: createId('chat'),
      title: t('chatNewConversation'),
      updatedAt: Date.now(),
      messages: [],
    };
    persist((prev) => ({
      conversations: [created, ...prev.conversations],
      activeId: created.id,
    }));
  }, [destroySession, persist, t]);

  const selectConversation = useCallback(
    (id) => {
      if (id === activeId) return;
      void destroySession();
      setSendError(null);
      setStreamHint(null);
      persist((prev) => ({ ...prev, activeId: id }));
    },
    [activeId, destroySession, persist],
  );

  const deleteConversation = useCallback(
    (id) => {
      void destroySession();
      persist((prev) => {
        const remaining = prev.conversations.filter((c) => c.id !== id);
        const nextActive = prev.activeId === id ? (remaining[0]?.id ?? null) : prev.activeId;
        return { conversations: remaining, activeId: nextActive };
      });
    },
    [destroySession, persist],
  );

  const updateConversation = useCallback(
    (id, updater) => {
      persist((prev) => ({
        ...prev,
        conversations: prev.conversations.map((c) => (c.id === id ? updater(c) : c)),
      }));
    },
    [persist],
  );

  const ready = sdkPresent && availability === 'available';

  const handleSend = useCallback(
    async (event) => {
      event?.preventDefault?.();
      const prompt = input.trim();
      if (!prompt || sending || !ready) return;

      setSendError(null);
      setStreamHint(null);
      setSending(true);
      abortRef.current = false;

      const conversation = ensureActiveConversation();
      const userMessage = {
        id: createId('msg'),
        role: 'user',
        content: prompt,
        createdAt: Date.now(),
      };
      const assistantId = createId('msg');
      const assistantPlaceholder = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
      };

      const priorMessages = conversation.messages;
      const withUser = [...priorMessages, userMessage, assistantPlaceholder];
      const title =
        priorMessages.length === 0
          ? titleFromPrompt(prompt, t('chatNewConversation'))
          : conversation.title;

      updateConversation(conversation.id, (c) => ({
        ...c,
        title,
        updatedAt: Date.now(),
        messages: withUser,
      }));
      setInput('');

      let session = sessionRef.current;
      try {
        // Wait for any in-flight session.destroy() from conversation switches.
        await destroyChainRef.current;
        session = sessionRef.current;
        if (!session) {
          session = await shellui.ai.languageModel.create({
            initialPrompts: toInitialPrompts(priorMessages),
          });
          sessionRef.current = session;
        }

        let fullText = '';
        let usedStreaming = false;

        if (typeof session.promptStreaming === 'function') {
          usedStreaming = true;
          setStreamHint('streaming');
          for await (const chunk of session.promptStreaming(prompt)) {
            if (abortRef.current) break;
            fullText += chunk;
            const snapshot = fullText;
            updateConversation(conversation.id, (c) => ({
              ...c,
              updatedAt: Date.now(),
              messages: c.messages.map((m) =>
                m.id === assistantId ? { ...m, content: snapshot } : m,
              ),
            }));
          }
        } else {
          setStreamHint('oneshot');
          fullText = await session.prompt(prompt);
          updateConversation(conversation.id, (c) => ({
            ...c,
            updatedAt: Date.now(),
            messages: c.messages.map((m) =>
              m.id === assistantId ? { ...m, content: fullText } : m,
            ),
          }));
        }

        if (!fullText.trim()) {
          updateConversation(conversation.id, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantId ? { ...m, content: t('chatEmptyReply') } : m,
            ),
          }));
        }

        setStreamHint(usedStreaming ? 'streaming' : 'oneshot');
      } catch (err) {
        void destroySession();
        const message = err instanceof Error ? err.message : String(err);
        setSendError(message);
        updateConversation(conversation.id, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: m.content.trim() ? m.content : t('chatErrorReply', { message }),
                }
              : m,
          ),
        }));
      } finally {
        setSending(false);
      }
    },
    [destroySession, ensureActiveConversation, input, ready, sending, t, updateConversation],
  );

  const defaultModelLabel =
    status?.defaultModelId || status?.models?.find((m) => m.status === 'ready')?.id || null;

  const availabilityLabel = !sdkPresent
    ? t('chatAvailabilityMissing')
    : checking
      ? t('chatAvailabilityChecking')
      : availability
        ? t(`chatAvailability_${availability}`, {
            defaultValue: availability,
          })
        : t('chatAvailability_unavailable');

  return (
    <div className="font-body text-foreground max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {t('pageChatTitle')}
          </h1>
          <p className="mt-2 text-foreground max-w-2xl">{t('pageChatDescription')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              'inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium',
              ready
                ? 'border-border bg-muted/60 text-foreground'
                : 'border-border bg-muted/40 text-muted-foreground',
            ].join(' ')}
            title={statusError || undefined}
          >
            {availabilityLabel}
            {ready && defaultModelLabel ? ` · ${defaultModelLabel}` : ''}
          </span>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={refreshAiStatus}
            disabled={checking}
          >
            {t('chatRefreshStatus')}
          </Button>
        </div>
      </div>

      {!sdkPresent && (
        <Alert
          variant="destructive"
          className="mt-4"
        >
          <TriangleAlert />
          <AlertTitle>{t('pageChatMissingTitle')}</AlertTitle>
          <AlertDescription>{t('pageChatMissing')}</AlertDescription>
        </Alert>
      )}

      {sdkPresent && !checking && availability !== 'available' && (
        <Alert className="mt-4">
          <Info />
          <AlertTitle>{t('pageChatUnavailableTitle')}</AlertTitle>
          <AlertDescription>
            <p>{t('pageChatUnavailable')}</p>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={openShellAiSettings}
              >
                {t('openSettings')}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <section className="mt-6 grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-4 min-h-[420px]">
        <aside className="flex flex-col border border-border rounded-lg overflow-hidden bg-muted/20">
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
            <h2 className="font-heading text-sm font-medium text-foreground">
              {t('chatConversations')}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="h-8 w-8"
              onClick={startNewConversation}
              aria-label={t('chatNewConversation')}
              title={t('chatNewConversation')}
            >
              <MessageSquarePlus className="size-4" />
            </Button>
          </div>
          <ul className="flex-1 overflow-y-auto list-none m-0 p-1 space-y-0.5 max-h-56 md:max-h-none">
            {conversations.length === 0 && (
              <li className="px-2 py-3 text-sm text-muted-foreground">
                {t('chatNoConversations')}
              </li>
            )}
            {conversations.map((c) => {
              const selected = c.id === (active?.id ?? null);
              return (
                <li key={c.id}>
                  <div
                    className={[
                      'group flex items-center gap-1 rounded-md',
                      selected ? 'bg-accent text-accent-foreground' : '',
                    ].join(' ')}
                  >
                    <button
                      type="button"
                      className={[
                        'flex-1 min-w-0 text-left px-2 py-2 text-sm truncate rounded-md',
                        selected ? 'text-accent-foreground' : 'text-foreground hover:bg-accent/60',
                      ].join(' ')}
                      onClick={() => selectConversation(c.id)}
                    >
                      {c.title || t('chatNewConversation')}
                    </button>
                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 text-muted-foreground hover:text-destructive"
                      aria-label={t('chatDeleteConversation')}
                      title={t('chatDeleteConversation')}
                      onClick={() => deleteConversation(c.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="flex flex-col border border-border rounded-lg overflow-hidden min-h-[420px]">
          <div
            ref={threadRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-background"
          >
            {(!active || active.messages.length === 0) && (
              <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center px-4">
                <Bot className="size-8 text-muted-foreground mb-3" />
                <p className="font-heading text-base font-medium text-foreground">
                  {t('chatEmptyTitle')}
                </p>
                <p className="mt-1 text-sm text-muted-foreground max-w-md">
                  {ready ? t('chatEmptyReady') : t('chatEmptyUnavailable')}
                </p>
              </div>
            )}
            {active?.messages.map((m) => (
              <div
                key={m.id}
                className={['flex', m.role === 'user' ? 'justify-end' : 'justify-start'].join(' ')}
              >
                <div
                  className={[
                    'max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground',
                  ].join(' ')}
                >
                  {m.content || (sending && m.role === 'assistant' ? t('chatThinking') : '')}
                </div>
              </div>
            ))}
          </div>

          <form
            className="border-t border-border p-3 space-y-2 bg-muted/10"
            onSubmit={handleSend}
          >
            {sendError && <p className="text-sm text-destructive">{sendError}</p>}
            {streamHint && !sendError && (
              <p className="text-xs text-muted-foreground">
                {streamHint === 'streaming' ? t('chatUsingStreaming') : t('chatUsingOneshot')}
              </p>
            )}
            <div className="flex gap-2 items-end">
              <label
                className="sr-only"
                htmlFor="chat-prompt"
              >
                {t('chatPromptLabel')}
              </label>
              <textarea
                id="chat-prompt"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={!ready || sending}
                placeholder={ready ? t('chatPromptPlaceholder') : t('chatPromptDisabled')}
                className="flex-1 min-h-[64px] resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={!ready || sending || !input.trim()}
              >
                {sending ? t('chatSending') : t('chatSend')}
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section className="mt-10 space-y-8">
        <div>
          <h2 className="font-heading text-lg font-medium text-foreground mb-2">
            {t('exampleTitleChatAvailability')}
          </h2>
          <p className="text-sm text-muted-foreground mb-2">{t('exampleChatAvailabilityHint')}</p>
          <CodeBlock code={AVAILABILITY_CODE} />
        </div>

        <div>
          <h2 className="font-heading text-lg font-medium text-foreground mb-2">
            {t('exampleTitleChatPrompt')}
          </h2>
          <CodeBlock code={PROMPT_CODE} />
        </div>

        <div>
          <h2 className="font-heading text-lg font-medium text-foreground mb-2">
            {t('exampleTitleChatStreaming')}
          </h2>
          <CodeBlock code={STREAM_CODE} />
        </div>

        <div>
          <h2 className="font-heading text-lg font-medium text-foreground mb-2">
            {t('exampleTitleChatListModels')}
          </h2>
          <CodeBlock code={LIST_MODELS_CODE} />
        </div>
      </section>
    </div>
  );
}
