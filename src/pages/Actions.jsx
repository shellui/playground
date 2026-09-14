import { useCallback, useEffect, useState } from 'react';
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
  back: { id: 'back', onClick: () => history.back() },
  title: 'Inbox',
  trailing: [
    { id: 'edit', label: 'Edit', onClick: () => {} },
    { id: 'share', label: 'Share', onClick: () => {} },
    { id: 'archive', label: 'Archive', onClick: () => {} },
    { id: 'delete', label: 'Delete', onClick: () => {} },
  ],
  primary: { id: 'compose', icon: 'plus', onClick: () => {} },
});

// Shell posts SHELLUI_ACTION { id }; the SDK invokes the matching onClick from the last set.
// Callbacks stay registered until the next set() / clear().`;

const UPDATE_CODE = `// On in-app route changes, re-set (or clear) — the shell does not guess SPA routes.
shellui.actions.set({
  back: { id: 'back', onClick: () => history.back() },
  title: 'Message detail',
  trailing: [{ id: 'reply', label: 'Reply', onClick: () => {} }],
  primary: { id: 'compose', icon: 'plus', onClick: () => {} },
});`;

const CLEAR_CODE = `// Clear when leaving the screen. Shell navigation away also clears this view's actions.
shellui.actions.clear();`;

export default function Actions() {
  const { t } = useTranslation();
  const [available, setAvailable] = useState(() => hasActionsApi());
  const [lastClick, setLastClick] = useState(null);
  const [clickLog, setClickLog] = useState([]);

  const logClick = useCallback(
    (id) => {
      setLastClick(id);
      setClickLog((prev) => [{ id, at: Date.now() }, ...prev].slice(0, 8));
      if (typeof shellui.toast === 'function') {
        shellui.toast({
          title: t('actionsClickToast', { id }),
          type: 'success',
        });
      }
    },
    [t],
  );

  const control = useCallback(
    (id, extras = {}) => ({
      id,
      ...extras,
      onClick: () => logClick(id),
    }),
    [logClick],
  );

  useEffect(() => {
    setAvailable(hasActionsApi());
  }, []);

  useEffect(() => {
    if (!hasActionsApi()) return undefined;

    shellui.actions.set({
      back: control('back'),
      title: t('actionsDefaultTitle'),
      primary: control('add', { label: t('actionsPrimaryAdd'), icon: 'plus' }),
    });

    return () => {
      try {
        shellui.actions.clear();
      } catch {
        /* ignore */
      }
    };
  }, [control, t]);

  const setBackAndTitle = () => {
    if (!hasActionsApi()) return;
    shellui.actions.set({
      back: control('back'),
      title: t('actionsTitleInbox'),
    });
  };

  const setTrailing = () => {
    if (!hasActionsApi()) return;
    // Five trailing → ≤3 visible; remainder in ··· overflow menu.
    shellui.actions.set({
      back: control('back'),
      title: t('actionsTitleInbox'),
      trailing: [
        control('share', { label: t('actionsTrailingShare') }),
        control('edit', { label: t('actionsTrailingEdit') }),
        control('archive', { label: t('actionsTrailingArchive') }),
        control('delete', { label: t('actionsTrailingDelete') }),
        control('star', { label: t('actionsTrailingStar') }),
      ],
    });
  };

  const setPrimary = () => {
    if (!hasActionsApi()) return;
    shellui.actions.set({
      back: control('back'),
      title: t('actionsTitleInbox'),
      primary: control('add', { label: t('actionsPrimaryAdd'), icon: 'plus' }),
    });
  };

  const updateActions = () => {
    if (!hasActionsApi()) return;
    shellui.actions.set({
      back: control('back'),
      title: t('actionsTitleDetail'),
      trailing: [control('reply', { label: t('actionsTrailingReply') })],
      primary: control('compose', { label: t('actionsPrimaryCompose'), icon: 'plus' }),
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
