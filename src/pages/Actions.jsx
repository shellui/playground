import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Filter,
  MousePointerClick,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  Share2,
  Star,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/Alert';
import {
  ChipSet,
  EventLog,
  Field,
  OptionGroup,
  PageHeader,
  Segmented,
  SelectField,
  Switch,
  TextField,
  Workbench,
  useEventLog,
  usePageOptions,
  usePrefs,
  useShellClock,
} from '../components/playground';
import { raw, sdkCall } from '../lib/codegen';

const hasActionsApi = () =>
  typeof shellui?.actions?.set === 'function' && typeof shellui?.actions?.clear === 'function';

/** The shell's built-in glyphs (core ChromeActionIcons.tsx) and their lucide look-alikes. */
const ICONS = {
  back: ChevronLeft,
  plus: Plus,
  more: Ellipsis,
  edit: Pencil,
  share: Share2,
  filter: Filter,
  archive: Archive,
  settings: Settings,
  delete: Trash2,
  star: Star,
  refresh: RefreshCw,
};
const TRAILING = ['refresh', 'edit', 'share', 'archive', 'delete', 'star', 'filter', 'settings'];
const VISIBLE_TRAILING = 3; // CHROME_ACTIONS_VISIBLE_TRAILING
const REFRESH_MS = 1200;

const MESSAGES = [
  { id: '1', name: 'Léa Martin', subject: 'm1', body: 'b1', time: '07:31', tone: 'bg-primary/20' },
  {
    id: '2',
    name: 'Jonas Keller',
    subject: 'm2',
    body: 'b2',
    time: 'yesterday',
    tone: 'bg-info/20',
  },
  { id: '3', name: 'Ana Ruiz', subject: 'm3', body: 'b3', time: 'monday', tone: 'bg-success/20' },
];
const initials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('');

function useActionsAvailable() {
  const [available, setAvailable] = useState(() => hasActionsApi());
  useEffect(() => setAvailable(hasActionsApi()), []);
  return available;
}

/** Log a click from the shell, and show the success toast when that preference is on. */
function useClickLog() {
  const { t } = useTranslation();
  const prefs = usePrefs();
  const { rows, log, clear } = useEventLog();
  // Read at click time: the shell keeps the callbacks set when the buttons were applied.
  const toastOn = useRef(prefs.actionToast);
  toastOn.current = prefs.actionToast;
  const logClick = useCallback(
    (id, kind) => {
      log(id, t(`actions.d.${kind}`));
      if (toastOn.current) shellui.toast({ type: 'success', title: t('actions.toast', { id }) });
    },
    [log, t],
  );
  return { rows, clear, logClick };
}

function MissingApi() {
  const { t } = useTranslation();
  return (
    <Alert
      className="mb-4"
      variant="warning"
    >
      <TriangleAlert />
      <AlertDescription>{t('actions.missing')}</AlertDescription>
    </Alert>
  );
}

/** Clears the buttons only when leaving the whole /actions tree. */
export function ActionsLayout() {
  useEffect(
    () => () => {
      if (hasActionsApi()) shellui.actions.clear();
    },
    [],
  );
  return <Outlet />;
}

const DEFAULTS = {
  title: '',
  back: false,
  trailing: ['refresh', 'edit', 'share', 'archive'],
  spin: true,
  variant: 'outline',
  primary: true,
  icon: 'plus',
};

/** The spec sent to the shell. `onClick` gets the id; the code view prints `log(id)`. */
function buildSpec(o, title, editLabel, onClick) {
  const item = (id, extra = {}) => ({ id, icon: id, ...extra, onClick: onClick(id) });
  const spec = {};
  if (o.variant !== 'outline') spec.variant = o.variant;
  if (o.back) spec.back = { id: 'back', onClick: onClick('back') };
  spec.title = title;
  if (o.trailing.length) {
    spec.trailing = o.trailing.map((id) =>
      item(
        id,
        id === 'refresh' && o.spin
          ? { animate: 'icon-rotate' }
          : id === 'edit'
            ? { label: editLabel }
            : id === 'delete'
              ? { variant: 'destructive' }
              : {},
      ),
    );
  }
  if (o.primary) spec.primary = { id: 'compose', icon: o.icon, onClick: onClick('compose') };
  return spec;
}

function Marker({ n }) {
  return (
    <span
      className="inline-flex size-[18px] flex-none items-center justify-center rounded-full bg-primary font-mono text-[10px] font-semibold text-primary-foreground"
      aria-hidden
    >
      {n}
    </span>
  );
}

function FrameButton({ id, spec }) {
  const Icon = ICONS[id] ?? ICONS.more;
  const destructive = spec?.variant === 'destructive';
  return (
    <span
      className={`inline-flex h-6 items-center gap-1 rounded-md border px-1.5 text-[10.5px] ${destructive ? 'border-destructive/40 text-destructive' : 'border-border text-foreground'}`}
    >
      <Icon
        className={`size-3 ${spec?.animate ? 'motion-safe:animate-spin' : ''}`}
        aria-hidden
      />
      {spec?.label}
    </span>
  );
}

function Frame({ spec, narrow, inbox }) {
  const trailing = spec.trailing ?? [];
  // Core ChromeActionsHost: 3 buttons then more; on phones and tablets only more.
  const shown = narrow ? [] : trailing.slice(0, VISIBLE_TRAILING);
  const more = narrow ? trailing.length > 0 : trailing.length > VISIBLE_TRAILING;
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-[10px] border border-border bg-background shadow-[0_12px_32px_-18px_rgb(16_24_40/0.3)] ${narrow ? 'w-[172px] flex-none' : 'min-w-0 flex-1'}`}
    >
      <div className="flex h-10 items-center gap-1.5 border-b border-border px-2.5">
        {!narrow && <Marker n={1} />}
        {spec.back && <FrameButton id="back" />}
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">{spec.title}</span>
        <span className="flex flex-none gap-1">
          {shown.map((item) => (
            <FrameButton
              key={item.id}
              id={item.id}
              spec={item}
            />
          ))}
          {more && <FrameButton id="more" />}
        </span>
        {!narrow && trailing.length > 0 && <Marker n={2} />}
      </div>
      <ul className="m-0 flex flex-1 list-none flex-col p-0">
        {inbox.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-2 border-b border-border px-2.5 py-2 last:border-b-0"
          >
            <span
              className={`flex size-6 flex-none items-center justify-center rounded-full text-[9px] font-semibold ${m.tone}`}
            >
              {initials(m.name)}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-[11px] font-medium">{m.name}</span>
              <i className="pg-mini-line w-[70%]" />
            </span>
          </li>
        ))}
      </ul>
      {spec.primary && (
        <span className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
            {(() => {
              const Icon = ICONS[spec.primary.icon] ?? Plus;
              return (
                <Icon
                  className="size-4"
                  aria-hidden
                />
              );
            })()}
          </span>
          {!narrow && <Marker n={3} />}
        </span>
      )}
    </div>
  );
}

function Anatomy({ spec, label }) {
  const { t } = useTranslation();
  const inbox = [...MESSAGES, { id: '4', name: 'Tom Becker', tone: 'bg-warning/20' }];
  const legend = [
    { n: 1, prop: 'title', text: t('actions.l.title') },
    { n: 2, prop: 'trailing', text: t('actions.l.trailing') },
    { n: 3, prop: 'primary', text: t('actions.l.primary') },
    { n: '-', prop: 'back', text: spec.back ? '' : t('actions.l.backOff'), off: !spec.back },
  ];
  return (
    <div>
      <div
        role="img"
        aria-label={label}
        className="mt-1 flex gap-4 max-[759px]:flex-col"
      >
        <Frame
          spec={spec}
          inbox={inbox}
        />
        <div className="flex flex-col gap-1.5 max-[759px]:items-start">
          <Frame
            spec={spec}
            narrow
            inbox={inbox}
          />
          <p className="m-0 w-[172px] text-center text-[11px] text-muted-foreground max-[759px]:text-left">
            {t('actions.narrow')}
          </p>
        </div>
      </div>
      <ul className="m-0 mt-4 grid list-none grid-cols-4 gap-3 p-0 text-[11.5px] max-[759px]:grid-cols-2">
        {legend.map((item) => (
          <li
            key={item.prop}
            className={item.off ? 'opacity-60' : ''}
          >
            <span className="flex items-center gap-1.5">
              {typeof item.n === 'number' ? (
                <Marker n={item.n} />
              ) : (
                <span className="inline-flex size-[18px] items-center justify-center rounded-full border border-border text-[10px]">
                  -
                </span>
              )}
              <code className="font-mono text-[11px]">{item.prop}</code>
            </span>
            {item.text && <p className="m-0 mt-1 text-muted-foreground">{item.text}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MessageList() {
  const { t } = useTranslation();
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5">
        <div>
          <h2 className="m-0 font-heading text-sm font-semibold">{t('actions.flowTitle')}</h2>
          <p className="m-0 mt-1 text-[13px] text-muted-foreground">{t('actions.flowBody')}</p>
        </div>
        <code className="flex-none rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[11.5px]">
          /actions/detail
        </code>
      </div>
      <ul className="m-0 list-none p-0">
        {MESSAGES.map((m) => (
          <li
            key={m.id}
            className="border-b border-border last:border-b-0"
          >
            <Link
              to={`/actions/detail?id=${m.id}`}
              className="flex items-center gap-3 px-4 py-3 text-foreground! no-underline! hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              <span
                className={`flex size-8 flex-none items-center justify-center rounded-full text-[11px] font-semibold ${m.tone}`}
                aria-hidden
              >
                {initials(m.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{m.name}</span>
                <span className="block truncate text-[13px] text-muted-foreground">
                  {t(`actions.${m.subject}`)}
                </span>
              </span>
              <span className="flex-none text-xs text-muted-foreground">
                {m.time.includes(':') ? m.time : t(`actions.${m.time}`)}
              </span>
              <ChevronRight
                className="size-4 flex-none text-muted-foreground"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function IconGallery() {
  const { t } = useTranslation();
  return (
    <section className="mt-4 rounded-xl border border-border bg-card text-card-foreground">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <h2 className="m-0 font-heading text-sm font-semibold">{t('actions.icons')}</h2>
        <span className="text-xs text-muted-foreground">{t('actions.iconsHint')}</span>
      </div>
      <ul className="pg-icons m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-2 p-4">
        {Object.entries(ICONS).map(([name, Icon]) => (
          <li
            key={name}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-border px-2 py-3"
          >
            <Icon
              className="size-4"
              aria-hidden
            />
            <code className="font-mono text-[11px] text-muted-foreground">{name}</code>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Actions() {
  const { t } = useTranslation();
  const available = useActionsAvailable();
  const now = useShellClock();
  const [o, , set] = usePageOptions('actions', DEFAULTS);
  const { rows, clear, logClick } = useClickLog();
  const [result, setResult] = useState(null);
  const title = o.title.trim() || t('actions.inbox');
  const editLabel = t('actions.edit');

  const kind = (id) => (id === 'compose' ? 'main' : id === 'back' ? 'back' : 'trailing');
  const apply = useCallback(
    (options) => {
      if (!hasActionsApi()) return;
      shellui.actions.set(
        buildSpec(options, title, editLabel, (id) => () => {
          logClick(id, kind(id));
          if (id === 'back') window.history.back();
        }),
      );
      setResult({ time: now() });
    },
    [title, editLabel, logClick, now],
  );

  // Set the buttons on arrival with the saved options. A ref keeps this to mount only,
  // so editing options does not resend until Apply is pressed.
  const latest = useRef(null);
  latest.current = () => apply(o);
  useEffect(() => latest.current(), []);

  const codeSpec = buildSpec(o, title, editLabel, (id) =>
    raw(id === 'back' ? '() => history.back()' : `() => log('${id}')`),
  );
  const code = `${sdkCall('actions.set', codeSpec, { width: 78 })}\n\n// on leave, or before the next screen sets its own\nshellui.actions.clear();`;
  const drawing = buildSpec(o, title, editLabel, () => undefined);

  const toggleTrailing = (trailing) => set({ trailing: trailing.slice(0, 8) });

  return (
    <div className="max-w-[1180px] font-body text-foreground">
      <PageHeader
        group={t('home.g.chrome')}
        icon={MousePointerClick}
        title={t('actions.title')}
        lede={t('actions.lede')}
        apis={['shellui.actions.set', 'shellui.actions.clear']}
        docs="https://docs.shellui.com/features/chrome-actions"
      />
      {!available && <MissingApi />}
      <Workbench
        label={t('actions.bench')}
        stageLabel={t('actions.stage')}
        stage={
          <Anatomy
            spec={drawing}
            label={t('actions.drawing', { count: o.trailing.length })}
          />
        }
        code={code}
        fileName="actions.jsx"
        result={
          result?.cleared
            ? t('actions.cleared')
            : result
              ? t('actions.applied', { time: result.time })
              : t('actions.ready')
        }
        secondary={{
          label: t('actions.clear'),
          onClick: () => {
            if (!hasActionsApi()) return;
            shellui.actions.clear();
            setResult({ cleared: true });
          },
        }}
        run={{ label: t('actions.apply'), onClick: () => apply(o), disabled: !available }}
        options={
          <>
            <OptionGroup title={t('actions.g.titleBack')}>
              <TextField
                label={t('actions.o.title')}
                prop="title"
                value={o.title}
                placeholder={t('actions.inbox')}
                onChange={(value) => set({ title: value })}
              />
              <Switch
                label={t('actions.o.back')}
                prop="back"
                checked={o.back}
                onChange={(back) => set({ back })}
              />
            </OptionGroup>
            <OptionGroup title={t('actions.g.trailing')}>
              <Field
                as="fieldset"
                label={t('actions.o.actions')}
                prop="trailing"
                help={t('actions.o.actionsHelp')}
              >
                <ChipSet
                  mono
                  multiple
                  label={t('actions.o.actions')}
                  value={o.trailing}
                  onChange={toggleTrailing}
                  options={TRAILING.map((id) => ({ value: id, label: id, icon: ICONS[id] }))}
                />
              </Field>
              <Switch
                label={t('actions.o.spin')}
                prop="animate: 'icon-rotate'"
                checked={o.spin}
                disabled={!o.trailing.includes('refresh')}
                onChange={(spin) => set({ spin })}
              />
              <Field
                as="fieldset"
                label={t('actions.o.variant')}
                prop="variant"
              >
                <Segmented
                  label={t('actions.o.variant')}
                  value={o.variant}
                  onChange={(variant) => set({ variant })}
                  options={['outline', 'secondary', 'ghost'].map((v) => ({ value: v, label: v }))}
                />
              </Field>
            </OptionGroup>
            <OptionGroup title={t('actions.g.main')}>
              <Switch
                label={t('actions.g.main')}
                prop="primary"
                checked={o.primary}
                onChange={(primary) => set({ primary })}
              />
              {o.primary && (
                <SelectField
                  label={t('actions.o.icon')}
                  prop="primary.icon"
                  value={o.icon}
                  onChange={(icon) => set({ icon })}
                  options={Object.keys(ICONS).map((name) => ({ value: name, label: name }))}
                />
              )}
            </OptionGroup>
          </>
        }
      />
      <div className="mt-4 grid gap-4 min-[1180px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <MessageList />
        <EventLog
          title={t('actions.log')}
          rows={rows}
          onClear={clear}
        />
      </div>
      <IconGallery />
    </div>
  );
}

export function ActionsDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const available = useActionsAvailable();
  const { rows, clear, logClick } = useClickLog();
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef(null);
  const message = MESSAGES.find((m) => m.id === params.get('id')) ?? MESSAGES[0];

  const refresh = useCallback(() => {
    if (timer.current) return;
    setRefreshing(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setRefreshing(false);
    }, REFRESH_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!hasActionsApi()) return;
    shellui.actions.set({
      back: {
        id: 'back',
        onClick: () => {
          logClick('back', 'back');
          navigate('/actions');
        },
      },
      title: t('actions.detailTitle'),
      trailing: [
        {
          id: 'refresh',
          icon: 'refresh',
          ...(refreshing ? { animate: 'icon-rotate', disabled: true } : {}),
          onClick: () => {
            logClick('refresh', 'refresh');
            refresh();
          },
        },
        {
          id: 'edit',
          icon: 'edit',
          label: t('actions.edit'),
          onClick: () => logClick('edit', 'trailing'),
        },
        {
          id: 'delete',
          icon: 'delete',
          variant: 'destructive',
          onClick: () => logClick('delete', 'trailing'),
        },
      ],
      primary: { id: 'compose', icon: 'plus', onClick: () => logClick('compose', 'main') },
    });
  }, [logClick, navigate, refresh, refreshing, t]);

  return (
    <div className="max-w-[1180px] font-body text-foreground">
      {!available && <MissingApi />}
      <Link
        to="/actions"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground! no-underline! hover:text-foreground!"
      >
        <ChevronLeft
          className="size-4"
          aria-hidden
        />
        {t('actions.backInbox')}
      </Link>
      <div className="mt-4 grid gap-4 min-[1180px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <article className="rounded-xl border border-border bg-card p-5 text-card-foreground">
          <div className="flex items-center gap-3">
            <span
              className={`flex size-10 flex-none items-center justify-center rounded-full text-sm font-semibold ${message.tone}`}
              aria-hidden
            >
              {initials(message.name)}
            </span>
            <div className="min-w-0">
              <h1 className="m-0 font-heading text-lg font-semibold">
                {t(`actions.${message.subject}`)}
              </h1>
              <p className="m-0 text-[13px] text-muted-foreground">
                {t('actions.from', { name: message.name })}
              </p>
            </div>
          </div>
          <p className="mt-4 mb-0 text-sm leading-relaxed">{t(`actions.${message.body}`)}</p>
          <p
            className="mt-4 mb-0 min-h-5 text-[13px] text-muted-foreground"
            aria-live="polite"
          >
            {refreshing ? t('actions.refreshing') : ''}
          </p>
        </article>
        <EventLog
          title={t('actions.log')}
          rows={rows}
          onClear={clear}
        />
      </div>
    </div>
  );
}
