import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import { TriangleAlert } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ShowCode from '../components/ShowCode';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';

const hasActionsApi = () =>
  typeof shellui?.actions?.set === 'function' && typeof shellui?.actions?.clear === 'function';

const INBOX_CODE = `// Inbox — title + trailing, no back
shellui.actions.set({
  title: 'Inbox',
  trailing: [
    { id: 'share', label: 'Share', icon: 'share', onClick: () => {} },
    { id: 'edit', label: 'Edit', icon: 'edit', onClick: () => {} },
    { id: 'archive', label: 'Archive', icon: 'archive', onClick: () => {} },
    { id: 'delete', label: 'Delete', icon: 'delete', variant: 'destructive', onClick: () => {} },
  ],
  primary: { id: 'compose', icon: 'plus', onClick: () => {} },
});`;

const DETAIL_CODE = `// Detail — back, refresh (spin), edit, delete, and FAB
shellui.actions.set({
  back: { id: 'back', onClick: () => navigate('/actions') },
  title: 'Message detail',
  trailing: [
    { id: 'refresh', icon: 'refresh', onClick: () => {} },
    { id: 'edit', label: 'Edit', icon: 'edit', onClick: () => {} },
    { id: 'delete', label: 'Delete', icon: 'delete', variant: 'destructive', onClick: () => {} },
  ],
  primary: { id: 'compose', icon: 'plus', onClick: () => {} },
});`;

function useActionsAvailable() {
  const [available, setAvailable] = useState(() => hasActionsApi());
  useEffect(() => {
    setAvailable(hasActionsApi());
  }, []);
  return available;
}

function useActionClickLog() {
  const { t } = useTranslation();
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

  return { lastClick, clickLog, logClick };
}

function ClickLog({ lastClick, clickLog }) {
  const { t } = useTranslation();
  return (
    <>
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
    </>
  );
}

/** Clears chrome only when leaving the whole /actions tree. */
export function ActionsLayout() {
  useEffect(() => {
    return () => {
      if (!hasActionsApi()) return;
      try {
        shellui.actions.clear();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return <Outlet />;
}

export function ActionsInbox() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const available = useActionsAvailable();
  const { lastClick, clickLog, logClick } = useActionClickLog();
  const [chromeActive, setChromeActive] = useState(true);

  const applyInboxActions = useCallback(() => {
    if (!hasActionsApi()) return;
    shellui.actions.set({
      title: t('actionsTitleInbox'),
      trailing: [
        {
          id: 'share',
          label: t('actionsTrailingShare'),
          icon: 'share',
          onClick: () => logClick('share'),
        },
        {
          id: 'edit',
          label: t('actionsTrailingEdit'),
          icon: 'edit',
          onClick: () => logClick('edit'),
        },
        {
          id: 'archive',
          label: t('actionsTrailingArchive'),
          icon: 'archive',
          onClick: () => logClick('archive'),
        },
        {
          id: 'delete',
          label: t('actionsTrailingDelete'),
          icon: 'delete',
          variant: 'destructive',
          onClick: () => logClick('delete'),
        },
        {
          id: 'star',
          label: t('actionsTrailingStar'),
          icon: 'star',
          variant: 'ghost',
          onClick: () => logClick('star'),
        },
      ],
      primary: {
        id: 'compose',
        label: t('actionsPrimaryCompose'),
        icon: 'plus',
        onClick: () => logClick('compose'),
      },
    });
    setChromeActive(true);
  }, [logClick, t]);

  const clearChromeActions = useCallback(() => {
    if (!hasActionsApi()) return;
    shellui.actions.clear();
    setChromeActive(false);
  }, []);

  useEffect(() => {
    applyInboxActions();
  }, [applyInboxActions]);

  return (
    <div className="font-body text-foreground max-w-3xl">
      <PageHeader
        title={t('pageActionsTitle')}
        description={t('pageActionsDescription')}
      />

      {!available && (
        <Alert
          className="mb-4"
          variant="destructive"
        >
          <TriangleAlert />
          <AlertTitle>{t('pageActionsMissingTitle')}</AlertTitle>
          <AlertDescription>{t('pageActionsMissing')}</AlertDescription>
        </Alert>
      )}

      <section className="rounded-lg border border-border p-4 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              {t('actionsInboxHeading')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('actionsInboxHint')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!available || !chromeActive}
              onClick={clearChromeActions}
            >
              {t('actionsClearChrome')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!available || chromeActive}
              onClick={applyInboxActions}
            >
              {t('actionsReactivateChrome')}
            </Button>
          </div>
        </div>

        <ul className="divide-y divide-border rounded-md border border-border">
          {[1, 2, 3].map((n) => (
            <li key={n}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate('/actions/detail')}
              >
                <span className="min-w-0">
                  <span className="block font-medium text-foreground truncate">
                    {t('actionsMessageTitle', { n })}
                  </span>
                  <span className="block text-sm text-muted-foreground truncate">
                    {t('actionsMessagePreview')}
                  </span>
                </span>
                <span className="text-sm text-muted-foreground shrink-0">
                  {t('actionsOpenDetail')}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <ClickLog
          lastClick={lastClick}
          clickLog={clickLog}
        />
      </section>

      <ShowCode
        samples={[
          { title: t('actionsInboxHeading'), hint: t('pageActionsLifecycle'), code: INBOX_CODE },
        ]}
      />
    </div>
  );
}

export function ActionsDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const available = useActionsAvailable();
  const { lastClick, clickLog, logClick } = useActionClickLog();
  const refreshTimerRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [chromeActive, setChromeActive] = useState(true);

  const applyDetailActions = useCallback(
    (spinning) => {
      if (!hasActionsApi()) return;
      shellui.actions.set({
        back: {
          id: 'back',
          onClick: () => {
            logClick('back');
            navigate('/actions');
          },
        },
        title: t('actionsTitleDetail'),
        trailing: [
          {
            id: 'refresh',
            label: t('actionsTrailingRefresh'),
            icon: 'refresh',
            ...(spinning ? { animate: 'icon-rotate', disabled: true } : {}),
            onClick: () => {
              if (spinning) return;
              logClick('refresh');
              if (refreshTimerRef.current) {
                window.clearTimeout(refreshTimerRef.current);
              }
              setRefreshing(true);
              applyDetailActions(true);
              refreshTimerRef.current = window.setTimeout(() => {
                setRefreshing(false);
                applyDetailActions(false);
                refreshTimerRef.current = null;
              }, 2000);
            },
          },
          {
            id: 'edit',
            label: t('actionsTrailingEdit'),
            icon: 'edit',
            disabled: spinning,
            onClick: () => logClick('edit'),
          },
          {
            id: 'delete',
            label: t('actionsTrailingDelete'),
            icon: 'delete',
            variant: 'destructive',
            disabled: spinning,
            onClick: () => logClick('delete'),
          },
        ],
        primary: {
          id: 'compose',
          label: t('actionsPrimaryCompose'),
          icon: 'plus',
          disabled: spinning,
          onClick: () => logClick('compose'),
        },
      });
      setChromeActive(true);
    },
    [logClick, navigate, t],
  );

  const clearChromeActions = useCallback(() => {
    if (!hasActionsApi()) return;
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    setRefreshing(false);
    shellui.actions.clear();
    setChromeActive(false);
  }, []);

  useEffect(() => {
    applyDetailActions(false);
    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [applyDetailActions]);

  return (
    <div className="font-body text-foreground max-w-3xl">
      <PageHeader
        title={t('actionsTitleDetail')}
        description={t('actionsDetailDescription')}
      />

      {!available && (
        <Alert
          className="mb-4"
          variant="destructive"
        >
          <TriangleAlert />
          <AlertTitle>{t('pageActionsMissingTitle')}</AlertTitle>
          <AlertDescription>{t('pageActionsMissing')}</AlertDescription>
        </Alert>
      )}

      <section className="rounded-lg border border-border p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          {refreshing ? t('actionsDetailRefreshing') : t('actionsDetailChromeHint')}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/actions')}
          >
            {t('actionsBackToInbox')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!available || refreshing || !chromeActive}
            onClick={() => {
              logClick('refresh');
              if (refreshTimerRef.current) {
                window.clearTimeout(refreshTimerRef.current);
              }
              setRefreshing(true);
              applyDetailActions(true);
              refreshTimerRef.current = window.setTimeout(() => {
                setRefreshing(false);
                applyDetailActions(false);
                refreshTimerRef.current = null;
              }, 2000);
            }}
          >
            {t('actionsTryRefresh')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!available || !chromeActive}
            onClick={clearChromeActions}
          >
            {t('actionsClearChrome')}
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled={!available || chromeActive}
            onClick={() => applyDetailActions(false)}
          >
            {t('actionsReactivateChrome')}
          </Button>
        </div>
        <ClickLog
          lastClick={lastClick}
          clickLog={clickLog}
        />
        <p className="text-sm text-muted-foreground">
          <Link
            to="/actions"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {t('actionsBackToInbox')}
          </Link>
        </p>
      </section>

      <ShowCode samples={[{ title: t('actionsTitleDetail'), code: DETAIL_CODE }]} />
    </div>
  );
}

/** @deprecated Prefer ActionsLayout + inbox/detail routes. */
export default ActionsInbox;
