import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import { Info, TriangleAlert } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';

const hasActionsApi = () =>
  typeof shellui?.actions?.set === 'function' && typeof shellui?.actions?.clear === 'function';

const SET_CODE = `import shellui from '@shellui/sdk';

shellui.actions.set({
  back: { id: 'back' },
  title: 'Inbox',
  trailing: [
    { id: 'share', label: 'Share', icon: 'share' },
    { id: 'edit', label: 'Edit', icon: 'pencil' },
    { id: 'archive', label: 'Archive', icon: 'archive' },
    { id: 'delete', label: 'Delete', icon: 'trash' },
  ],
  primary: { id: 'add', label: 'Add', icon: 'plus' },
});

// Clicks post the action id back into this iframe (e.g. SHELLUI_ACTION).
shellui.addMessageListener('SHELLUI_ACTION', (message) => {
  const id = message?.payload?.id;
  if (id) shellui.toast({ title: \`Clicked: \${id}\`, type: 'success' });
});`;

const UPDATE_CODE = `// On in-app route changes, re-set (or clear) — the shell does not guess SPA routes.
shellui.actions.set({
  back: { id: 'back' },
  title: 'Message detail',
  trailing: [{ id: 'reply', label: 'Reply', icon: 'reply' }],
});`;

const CLEAR_CODE = `// Clear when leaving the screen, or when the shell navigates away from this view.
shellui.actions.clear();`;

function extractActionId(message) {
  const payload = message?.payload ?? message?.data ?? message;
  if (typeof payload === 'string') return payload;
  if (payload && typeof payload === 'object') {
    return payload.id ?? payload.actionId ?? payload.action?.id ?? null;
  }
  return null;
}

/** Register for floating-action clicks across likely SDK shapes from shellui#41. */
function subscribeActionClicks(onId) {
  const cleanups = [];
  const actions = shellui.actions;

  if (typeof actions?.onAction === 'function') {
    const result = actions.onAction(onId);
    if (typeof result === 'function') cleanups.push(result);
    else if (typeof actions.offAction === 'function') {
      cleanups.push(() => actions.offAction(onId));
    }
  } else if (typeof actions?.on === 'function') {
    const result = actions.on(onId);
    if (typeof result === 'function') cleanups.push(result);
  }

  if (typeof shellui.addMessageListener === 'function') {
    const handler = (message) => {
      const id = extractActionId(message);
      if (id) onId(id);
    };
    for (const type of ['SHELLUI_ACTION', 'shellui:action', 'SHELLUI_ACTIONS_CLICK']) {
      cleanups.push(shellui.addMessageListener(type, handler));
    }
  }

  return () => {
    for (const cleanup of cleanups) {
      try {
        cleanup();
      } catch {
        /* ignore */
      }
    }
  };
}

export default function Actions() {
  const { t } = useTranslation();
  const [available, setAvailable] = useState(() => hasActionsApi());
  const [lastClick, setLastClick] = useState(null);
  const [clickLog, setClickLog] = useState([]);

  useEffect(() => {
    setAvailable(hasActionsApi());
  }, []);

  useEffect(() => {
    if (!hasActionsApi()) return undefined;

    const handleClick = (id) => {
      setLastClick(id);
      setClickLog((prev) => [{ id, at: Date.now() }, ...prev].slice(0, 8));
      if (typeof shellui.toast === 'function') {
        shellui.toast({
          title: t('actionsClickToast', { id }),
          type: 'success',
        });
      }
    };

    const unsubscribe = subscribeActionClicks(handleClick);

    // Sensible default chrome while this demo page is active.
    shellui.actions.set({
      back: { id: 'back' },
      title: t('actionsDefaultTitle'),
      primary: { id: 'add', label: t('actionsPrimaryAdd'), icon: 'plus' },
    });

    return () => {
      unsubscribe();
      try {
        shellui.actions.clear();
      } catch {
        /* ignore */
      }
    };
  }, [t]);

  const setBackAndTitle = () => {
    if (!hasActionsApi()) return;
    shellui.actions.set({
      back: { id: 'back' },
      title: t('actionsTitleInbox'),
    });
  };

  const setTrailing = () => {
    if (!hasActionsApi()) return;
    shellui.actions.set({
      back: { id: 'back' },
      title: t('actionsTitleInbox'),
      trailing: [
        { id: 'share', label: t('actionsTrailingShare'), icon: 'share' },
        { id: 'edit', label: t('actionsTrailingEdit'), icon: 'pencil' },
        { id: 'archive', label: t('actionsTrailingArchive'), icon: 'archive' },
        { id: 'delete', label: t('actionsTrailingDelete'), icon: 'trash' },
        { id: 'star', label: t('actionsTrailingStar'), icon: 'star' },
      ],
    });
  };

  const setPrimary = () => {
    if (!hasActionsApi()) return;
    shellui.actions.set({
      back: { id: 'back' },
      title: t('actionsTitleInbox'),
      primary: { id: 'add', label: t('actionsPrimaryAdd'), icon: 'plus' },
    });
  };

  const updateActions = () => {
    if (!hasActionsApi()) return;
    shellui.actions.set({
      back: { id: 'back' },
      title: t('actionsTitleDetail'),
      trailing: [{ id: 'reply', label: t('actionsTrailingReply'), icon: 'reply' }],
      primary: { id: 'compose', label: t('actionsPrimaryCompose'), icon: 'plus' },
    });
  };

  const clearActions = () => {
    if (!hasActionsApi()) return;
    shellui.actions.clear();
  };

  return (
    <div className="font-body text-foreground max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        {t('pageActionsTitle')}
      </h1>
      <p className="mt-2 text-foreground">{t('pageActionsDescription')}</p>

      <Alert className="mt-4">
        <Info />
        <AlertTitle>{t('pageActionsLifecycleTitle')}</AlertTitle>
        <AlertDescription>{t('pageActionsLifecycle')}</AlertDescription>
      </Alert>

      {!available && (
        <Alert
          className="mt-4"
          variant="destructive"
        >
          <TriangleAlert />
          <AlertTitle>{t('pageActionsMissingTitle')}</AlertTitle>
          <AlertDescription>{t('pageActionsMissing')}</AlertDescription>
        </Alert>
      )}

      <section className="mt-6 space-y-8">
        <div>
          <h2 className="font-heading text-lg font-medium text-foreground mb-2">
            {t('exampleTitleActionsTry')}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Button
              variant="default"
              size="sm"
              disabled={!available}
              onClick={setBackAndTitle}
            >
              {t('actionsSetBackTitle')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!available}
              onClick={setTrailing}
            >
              {t('actionsSetTrailing')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!available}
              onClick={setPrimary}
            >
              {t('actionsSetPrimary')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!available}
              onClick={updateActions}
            >
              {t('actionsUpdate')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!available}
              onClick={clearActions}
            >
              {t('actionsClear')}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {lastClick ? t('actionsLastClick', { id: lastClick }) : t('actionsLastClickEmpty')}
          </p>
          {clickLog.length > 0 && (
            <ul className="mb-3 text-sm text-muted-foreground list-disc pl-5 space-y-0.5">
              {clickLog.map((entry) => (
                <li key={`${entry.id}-${entry.at}`}>
                  <code className="text-foreground">{entry.id}</code>
                </li>
              ))}
            </ul>
          )}
          <CodeBlock code={SET_CODE} />
        </div>

        <div>
          <h2 className="font-heading text-lg font-medium text-foreground mb-2">
            {t('exampleTitleActionsUpdate')}
          </h2>
          <p className="text-sm text-muted-foreground mb-2">{t('actionsUpdateHint')}</p>
          <CodeBlock code={UPDATE_CODE} />
        </div>

        <div>
          <h2 className="font-heading text-lg font-medium text-foreground mb-2">
            {t('exampleTitleActionsClear')}
          </h2>
          <CodeBlock code={CLEAR_CODE} />
        </div>
      </section>
    </div>
  );
}
