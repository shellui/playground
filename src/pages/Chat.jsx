import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import { Bot, Info, MessageSquarePlus, Trash2, TriangleAlert } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import MarkdownMessage from '../components/MarkdownMessage';
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

const session = await shellui.ai.languageModel.create({
  model: 'ollama:llama3.2', // optional; defaults to Settings → AI
});
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
// status.defaultModelId, status.ollama.reachable, …

// Settings pushes (same pattern as ThemeContext):
shellui.addMessageListener('SHELLUI_SETTINGS_UPDATED', (message) => {
  const defaultModelId = message?.payload?.settings?.ai?.defaultModelId;
  // refresh Chat’s model list / selection
});`;

const STATUS_POLL_MS = 30_000;

/** Feature-detect unified AI SDK (shellui#48). */
function hasAiApi() {
  return (
    typeof shellui?.ai?.languageModel?.availability === 'function' &&
    typeof shellui?.ai?.languageModel?.create === 'function'
  );
}

/**
 * @param {unknown} message
 * @returns {string | null | undefined} undefined = no ai settings in payload
 */
function defaultModelIdFromSettingsMessage(message) {
  const payload = message?.payload;
  if (!payload || typeof payload !== 'object') return undefined;
  const settings = payload.settings ?? (payload.ai != null ? payload : null);
  if (!settings || typeof settings !== 'object') return undefined;
  if (!('ai' in settings) || settings.ai == null) return undefined;
  const id = settings.ai.defaultModelId;
  if (id == null || id === '') return null;
  return String(id);
}

/**
 * @param {{ models?: Array<{ id?: string, status?: string }>, defaultModelId?: string | null } | null} status
 * @returns {Array<{ id: string, status?: string }>}
 */
function readyModelsFromStatus(status) {
  const models = Array.isArray(status?.models) ? status.models : [];
  return models.filter((m) => m?.id && m.status === 'ready');
}

/**
 * Resolve which model id the selector should show.
 * Prefer shell default when ready; else first ready model.
 * @param {{ models?: Array<{ id?: string, status?: string }>, defaultModelId?: string | null } | null} status
 * @param {string | null} settingsDefaultId
 */
function resolveDefaultModelId(status, settingsDefaultId) {
  const ready = readyModelsFromStatus(status);
  const readyIds = new Set(ready.map((m) => m.id));
  const candidates = [settingsDefaultId, status?.defaultModelId ?? null, ready[0]?.id ?? null];
  for (const id of candidates) {
    if (id && readyIds.has(id)) return id;
  }
  return ready[0]?.id ?? null;
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

  /** Model id for the next create(); null until status loads. */
  const [selectedModelId, setSelectedModelId] = useState(null);
  /**
   * When true, Settings defaultModelId changes do not overwrite the selector.
   * Cleared if the picked model leaves the ready list.
   */
  const [userPickedModel, setUserPickedModel] = useState(false);
  /** Latest Settings → AI default (from SHELLUI_SETTINGS* payloads). */
  const settingsDefaultRef = useRef(shellui.initialSettings?.ai?.defaultModelId ?? null);

  const threadRef = useRef(null);
  const sessionRef = useRef(null);
  /** Model id the live session was created with (null if none). */
  const sessionModelRef = useRef(null);
  const abortRef = useRef(false);
  /** AbortSignal passed to languageModel.create when the SDK honors it. */
  const promptAbortRef = useRef(null);
  /** Bumped on Stop so a finishing send cannot overwrite a newer turn. */
  const sendGenRef = useRef(0);
  /** Serializes async SDK destroys so a delayed shell destroy cannot race a new session. */
  const destroyChainRef = useRef(Promise.resolve());
  const selectedModelIdRef = useRef(selectedModelId);
  const userPickedModelRef = useRef(userPickedModel);
  const statusRef = useRef(status);

  selectedModelIdRef.current = selectedModelId;
  userPickedModelRef.current = userPickedModel;
  statusRef.current = status;

  const conversations = store.conversations;
  const activeId = store.activeId;
  const active = conversations.find((c) => c.id === activeId) ?? conversations[0] ?? null;

  const readyModels = useMemo(() => readyModelsFromStatus(status), [status]);

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
    sessionModelRef.current = null;

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

  const cancelInFlight = useCallback(() => {
    abortRef.current = true;
    sendGenRef.current += 1;
    try {
      promptAbortRef.current?.abort();
    } catch {
      /* ignore */
    }
    promptAbortRef.current = null;
    const session = sessionRef.current;
    // Prefer session.abort() when the SDK wires op:'abort'; else destroy interrupts the shell.
    if (session && typeof session.abort === 'function') {
      try {
        session.abort();
      } catch {
        /* ignore */
      }
    }
    void destroySession();
    setSending(false);
    setStreamHint(null);
  }, [destroySession]);

  const applyModelSelection = useCallback((snapshot, settingsDefaultId) => {
    const resolved = resolveDefaultModelId(snapshot, settingsDefaultId);
    const readyIds = new Set(readyModelsFromStatus(snapshot).map((m) => m.id));
    const current = selectedModelIdRef.current;
    const picked = userPickedModelRef.current;

    if (picked && current && readyIds.has(current)) {
      return;
    }

    if (picked && current && !readyIds.has(current)) {
      setUserPickedModel(false);
    }

    setSelectedModelId((prev) => (prev === resolved ? prev : resolved));
  }, []);

  const refreshAiStatus = useCallback(async () => {
    setChecking(true);
    setStatusError(null);
    const present = hasAiApi();
    setSdkPresent(present);
    if (!present) {
      setAvailability(null);
      setStatus(null);
      setSelectedModelId(null);
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
        snapshot = {
          models,
          defaultModelId: settingsDefaultRef.current,
        };
        setStatus(snapshot);
      } else {
        setStatus(null);
      }
      applyModelSelection(snapshot, settingsDefaultRef.current);
    } catch (err) {
      setAvailability('unavailable');
      setStatus(null);
      setStatusError(err instanceof Error ? err.message : String(err));
    } finally {
      setChecking(false);
    }
  }, [applyModelSelection]);

  useEffect(() => {
    refreshAiStatus();
    return () => {
      abortRef.current = true;
      void destroySession();
    };
  }, [refreshAiStatus, destroySession]);

  // Prefer Settings message listeners; refresh on focus/visibility; light poll as backup.
  useEffect(() => {
    const onSettings = (message) => {
      const fromSettings = defaultModelIdFromSettingsMessage(message);
      if (fromSettings !== undefined) {
        settingsDefaultRef.current = fromSettings;
        if (!userPickedModelRef.current) {
          setSelectedModelId((prev) => {
            const readyIds = new Set(readyModelsFromStatus(statusRef.current).map((m) => m.id));
            // Optimistic update when we already know the model is ready; full refresh follows.
            if (fromSettings && (readyIds.size === 0 || readyIds.has(fromSettings))) {
              return fromSettings;
            }
            return prev;
          });
        }
      }
      void refreshAiStatus();
    };

    const onVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      void refreshAiStatus();
    };

    const cleanupUpdated =
      typeof shellui.addMessageListener === 'function'
        ? shellui.addMessageListener('SHELLUI_SETTINGS_UPDATED', onSettings)
        : () => {};
    const cleanupSettings =
      typeof shellui.addMessageListener === 'function'
        ? shellui.addMessageListener('SHELLUI_SETTINGS', onSettings)
        : () => {};

    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    const pollId = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      void refreshAiStatus();
    }, STATUS_POLL_MS);

    return () => {
      cleanupUpdated();
      cleanupSettings();
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(pollId);
    };
  }, [refreshAiStatus]);

  // Mid-conversation model change: tear down the session so the next send recreates with the new model.
  useEffect(() => {
    if (!selectedModelId) return;
    if (sessionModelRef.current && sessionModelRef.current !== selectedModelId) {
      cancelInFlight();
    }
  }, [selectedModelId, cancelInFlight]);

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
    cancelInFlight();
    setSendError(null);
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
  }, [cancelInFlight, persist, t]);

  const selectConversation = useCallback(
    (id) => {
      if (id === activeId) return;
      cancelInFlight();
      setSendError(null);
      persist((prev) => ({ ...prev, activeId: id }));
    },
    [activeId, cancelInFlight, persist],
  );

  const deleteConversation = useCallback(
    (id) => {
      cancelInFlight();
      persist((prev) => {
        const remaining = prev.conversations.filter((c) => c.id !== id);
        const nextActive = prev.activeId === id ? (remaining[0]?.id ?? null) : prev.activeId;
        return { conversations: remaining, activeId: nextActive };
      });
    },
    [cancelInFlight, persist],
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

  const handleModelChange = useCallback((event) => {
    const next = event.target.value || null;
    setUserPickedModel(true);
    setSelectedModelId(next);
  }, []);

  const ready = sdkPresent && availability === 'available';

  const markAssistantStopped = useCallback(
    (conversationId, assistantId) => {
      updateConversation(conversationId, (c) => ({
        ...c,
        updatedAt: Date.now(),
        messages: c.messages.map((m) =>
          m.id === assistantId && !m.content.trim() ? { ...m, content: t('chatStopped') } : m,
        ),
      }));
    },
    [t, updateConversation],
  );

  const handleStop = useCallback(() => {
    if (!sending) return;
    if (active) {
      const last = active.messages[active.messages.length - 1];
      if (last?.role === 'assistant') {
        markAssistantStopped(active.id, last.id);
      }
    }
    cancelInFlight();
  }, [active, cancelInFlight, markAssistantStopped, sending]);

  const handleSend = useCallback(
    async (event) => {
      event?.preventDefault?.();
      const prompt = input.trim();
      if (!prompt || sending || !ready) return;

      setSendError(null);
      setStreamHint(null);
      setSending(true);
      abortRef.current = false;
      const sendGen = ++sendGenRef.current;
      const isCurrent = () => sendGen === sendGenRef.current;
      const promptAbort = new AbortController();
      promptAbortRef.current = promptAbort;

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

      const modelForTurn = selectedModelIdRef.current;

      let session = sessionRef.current;
      try {
        // Wait for any in-flight session.destroy() from conversation switches / Stop / model change.
        await destroyChainRef.current;
        if (!isCurrent()) return;
        session = sessionRef.current;

        const needsNewSession =
          !session || (modelForTurn && sessionModelRef.current !== modelForTurn);

        if (needsNewSession) {
          if (session) {
            sessionRef.current = null;
            sessionModelRef.current = null;
            const stale = session;
            destroyChainRef.current = destroyChainRef.current
              .then(async () => {
                if (typeof stale.destroy !== 'function') return;
                try {
                  const result = stale.destroy();
                  if (result != null && typeof result.then === 'function') await result;
                } catch {
                  /* ignore */
                }
              })
              .catch(() => {});
            await destroyChainRef.current;
            if (!isCurrent()) return;
          }

          const createOptions = {
            initialPrompts: toInitialPrompts(priorMessages),
            signal: promptAbort.signal,
          };
          if (modelForTurn) {
            createOptions.model = modelForTurn;
          }

          session = await shellui.ai.languageModel.create(createOptions);
          if (!isCurrent()) {
            if (session && typeof session.destroy === 'function') {
              try {
                const result = session.destroy();
                if (result != null && typeof result.then === 'function') await result;
              } catch {
                /* ignore */
              }
            }
            return;
          }
          sessionRef.current = session;
          sessionModelRef.current = modelForTurn;
        }

        let fullText = '';
        let usedStreaming = false;

        if (typeof session.promptStreaming === 'function') {
          usedStreaming = true;
          setStreamHint('streaming');
          for await (const chunk of session.promptStreaming(prompt)) {
            if (!isCurrent() || abortRef.current) break;
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
          if (!isCurrent() || abortRef.current) {
            if (!fullText.trim()) markAssistantStopped(conversation.id, assistantId);
            return;
          }
          updateConversation(conversation.id, (c) => ({
            ...c,
            updatedAt: Date.now(),
            messages: c.messages.map((m) =>
              m.id === assistantId ? { ...m, content: fullText } : m,
            ),
          }));
        }

        if (!isCurrent()) return;

        if (abortRef.current) {
          if (!fullText.trim()) markAssistantStopped(conversation.id, assistantId);
        } else if (!fullText.trim()) {
          updateConversation(conversation.id, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantId ? { ...m, content: t('chatEmptyReply') } : m,
            ),
          }));
        } else {
          setStreamHint(usedStreaming ? 'streaming' : 'oneshot');
        }
      } catch (err) {
        if (!isCurrent() || abortRef.current) {
          markAssistantStopped(conversation.id, assistantId);
          return;
        }
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
        if (promptAbortRef.current === promptAbort) {
          promptAbortRef.current = null;
        }
        if (isCurrent()) setSending(false);
      }
    },
    [
      destroySession,
      ensureActiveConversation,
      input,
      markAssistantStopped,
      ready,
      sending,
      t,
      updateConversation,
    ],
  );

  const displayModelLabel = selectedModelId || status?.defaultModelId || null;

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
            {ready && displayModelLabel ? ` · ${displayModelLabel}` : ''}
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
                    'max-w-[85%] rounded-lg px-3 py-2 text-sm break-words',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground whitespace-pre-wrap'
                      : 'bg-muted text-foreground',
                  ].join(' ')}
                >
                  {m.role === 'assistant' ? (
                    m.content ? (
                      <MarkdownMessage content={m.content} />
                    ) : sending ? (
                      t('chatThinking')
                    ) : (
                      ''
                    )
                  ) : (
                    m.content
                  )}
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
            <div className="flex flex-wrap items-center gap-2">
              <label
                className="text-xs font-medium text-muted-foreground shrink-0"
                htmlFor="chat-model"
              >
                {t('chatModelLabel')}
              </label>
              <select
                id="chat-model"
                value={selectedModelId ?? ''}
                onChange={handleModelChange}
                disabled={!ready || sending || readyModels.length === 0}
                className="min-w-0 flex-1 max-w-xs h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                {readyModels.length === 0 ? (
                  <option value="">{t('chatModelNone')}</option>
                ) : (
                  readyModels.map((m) => (
                    <option
                      key={m.id}
                      value={m.id}
                    >
                      {m.id}
                      {m.id === (status?.defaultModelId || settingsDefaultRef.current)
                        ? ` (${t('chatModelDefault')})`
                        : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
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
                    if (!sending) handleSend();
                  }
                }}
                disabled={!ready || sending}
                placeholder={ready ? t('chatPromptPlaceholder') : t('chatPromptDisabled')}
                className="flex-1 min-h-[64px] resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
              {sending ? (
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleStop}
                >
                  {t('chatStop')}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!ready || !input.trim()}
                >
                  {t('chatSend')}
                </Button>
              )}
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
