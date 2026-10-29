import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import {
  Circle,
  CircleCheck,
  CircleX,
  Info,
  Layers,
  LoaderCircle,
  TriangleAlert,
} from 'lucide-react';
import {
  Below,
  ChipSet,
  EventLog,
  Field,
  Inline,
  MiniScreen,
  Notes,
  OptionGroup,
  PageHeader,
  RecipeGrid,
  Segmented,
  Switch,
  TextField,
  Workbench,
  inputClass,
  useEventLog,
  usePageOptions,
  useShellClock,
} from '../components/playground';
import { jsValue, raw, sdkCall } from '../lib/codegen';

const TYPES = [
  { value: 'default', icon: Circle, tone: 'text-muted-foreground' },
  { value: 'success', icon: CircleCheck, tone: 'text-success dark:text-green-400' },
  { value: 'error', icon: CircleX, tone: 'text-destructive' },
  { value: 'warning', icon: TriangleAlert, tone: 'text-warning dark:text-amber-400' },
  { value: 'info', icon: Info, tone: 'text-info dark:text-blue-400' },
  { value: 'loading', icon: LoaderCircle, tone: 'text-muted-foreground' },
];
const POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];
/** Shell defaults (core sonner.tsx and sonner itself). */
const SHELL_POSITION = 'top-center';
const SHELL_DURATION = 4000;
const UPDATE_DELAY = 2000;

const RECIPES = {
  saved: { type: 'success' },
  failed: { type: 'error', action: true },
  storage: { type: 'warning' },
  version: { type: 'info', action: true, reload: true },
  upload: { type: 'loading', update: true },
  undo: { type: 'default', action: true, duration: 4000, position: 'bottom-right' },
};

function recipeOptions(id, t) {
  const r = RECIPES[id];
  const text = (k) => t(`toasts.recipe.${id}.${k}`);
  return {
    recipe: id,
    type: r.type,
    title: text('title'),
    description: text('description'),
    duration: r.duration ?? SHELL_DURATION,
    position: r.position ?? SHELL_POSITION,
    actionOn: Boolean(r.action),
    actionLabel: r.action ? text('action') : t('toasts.recipe.undo.action'),
    reload: Boolean(r.reload),
    cancelOn: false,
    cancelLabel: t('toasts.defaultCancel'),
    update: Boolean(r.update),
  };
}

function typeInfo(type) {
  return TYPES.find((x) => x.value === type) ?? TYPES[0];
}

/** Options sent to the shell, without values equal to the shell defaults. */
function sentOptions(o) {
  return {
    type: o.type === 'default' ? undefined : o.type,
    title: o.title.trim() || undefined,
    description: o.description.trim() || undefined,
    duration: o.type !== 'loading' && o.duration !== SHELL_DURATION ? o.duration : undefined,
    position: o.position !== SHELL_POSITION ? o.position : undefined,
  };
}

function PositionPicker({ value, onChange, label }) {
  const refs = useRef([]);
  const index = POSITIONS.indexOf(value);
  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 3, ArrowUp: -3 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + POSITIONS.length) % POSITIONS.length;
    onChange(POSITIONS[next]);
    refs.current[next]?.focus();
  };
  return (
    <div>
      <div
        role="radiogroup"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="grid h-[76px] w-[132px] grid-cols-3 grid-rows-[1fr_auto_1fr] gap-1 rounded-lg border border-border bg-muted p-1.5"
      >
        {POSITIONS.map((position, i) => {
          const on = position === value;
          return (
            <button
              key={position}
              ref={(node) => (refs.current[i] = node)}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={position}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(position)}
              className={`flex cursor-pointer items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring ${i >= 3 ? 'row-start-3' : ''} ${i % 3 === 0 ? 'justify-start' : i % 3 === 2 ? 'justify-end' : ''}`}
            >
              <span
                className={`block h-2.5 w-7 rounded-[3px] ${on ? 'bg-primary' : 'border border-border bg-card'}`}
              />
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 font-mono text-xs text-muted-foreground">{value}</p>
    </div>
  );
}

function ToastCard({ o, className = '', older = false, olderTitle }) {
  const info = typeInfo(older ? 'success' : o.type);
  const Icon = info.icon;
  return (
    <div
      className={`flex w-[280px] max-w-[calc(100%-24px)] items-start gap-2.5 rounded-lg border border-border bg-background px-3.5 py-3 text-[13px] text-foreground shadow-lg ${className}`}
    >
      <Icon
        className={`mt-px size-4 shrink-0 ${info.tone}`}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate font-medium">
          {older ? olderTitle : o.title.trim() || typeLabel(o.type)}
        </p>
        {!older && o.description.trim() && (
          <p className="mt-0.5 mb-0 text-xs leading-snug text-muted-foreground">{o.description}</p>
        )}
      </div>
      {!older && (o.cancelOn || o.actionOn) && (
        <div className="flex shrink-0 items-center gap-1.5 self-center">
          {o.cancelOn && (
            <span className="rounded bg-muted px-2 py-1 text-[11.5px] text-muted-foreground">
              {o.cancelLabel}
            </span>
          )}
          {o.actionOn && (
            <span className="rounded bg-primary px-2 py-1 text-[11.5px] font-medium text-primary-foreground">
              {o.actionLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** The shell's fallback titles (core SonnerContext) when none is passed. */
function typeLabel(type) {
  return (
    {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
      loading: 'Loading...',
    }[type] ?? 'Notification'
  );
}

function ToastDrawing({ o, label, olderTitle }) {
  const [y, x] = o.position.split('-');
  const top = y === 'top';
  const place = `${top ? 'top-3' : 'bottom-3'} ${
    x === 'left' ? 'left-3' : x === 'right' ? 'right-3' : 'left-1/2 -translate-x-1/2'
  }`;
  return (
    <MiniScreen label={label}>
      <div
        className={`absolute z-[2] flex w-[280px] max-w-[calc(100%-24px)] flex-col ${place} ${top ? '' : 'flex-col-reverse'}`}
      >
        <ToastCard
          o={o}
          className="relative z-[2] max-w-full"
        />
        <ToastCard
          o={o}
          older
          olderTitle={olderTitle}
          className={`relative z-[1] mx-auto max-w-full scale-[0.94] opacity-70 ${top ? '-mt-8' : '-mb-8'}`}
        />
      </div>
    </MiniScreen>
  );
}

function Thumb({ id }) {
  const r = RECIPES[id];
  const info = typeInfo(r.type);
  const Icon = info.icon;
  return (
    <div className="flex w-[72%] items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1.5 shadow-[0_6px_12px_-8px_rgb(0_0_0/0.3)]">
      <Icon
        className={`size-3 flex-none ${info.tone}`}
        aria-hidden
      />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <b className="block h-1.5 w-[70%] rounded-[3px] bg-foreground/55" />
        <i className="block h-[5px] rounded-[3px] bg-foreground/16" />
      </span>
      {r.action && <span className="h-3 w-5 flex-none rounded-[3px] bg-primary" />}
    </div>
  );
}

export default function ToasterPage() {
  const { t } = useTranslation();
  const initial = useMemo(() => recipeOptions('undo', t), [t]);
  const [o, setOptions, set] = usePageOptions('toasts', initial);
  const { rows, log, clear } = useEventLog();
  const now = useShellClock();
  const [last, setLast] = useState(null);
  const record = (cb, detail, label) => setLast({ cb, label, time: log(cb, detail) });
  const edit = (patch) => set({ ...patch, recipe: null });

  const call = useMemo(() => {
    const sent = sentOptions(o);
    const shown = { ...sent };
    if (o.actionOn) {
      shown.action = {
        label: o.actionLabel,
        onClick: raw(o.reload ? '() => window.location.reload()' : "() => log('action')"),
      };
    }
    if (o.cancelOn) shown.cancel = { label: o.cancelLabel, onClick: raw("() => log('cancel')") };
    const update = { type: 'success', title: t('toasts.updated'), position: sent.position };
    const code = o.update
      ? sdkCall('toast', shown, {
          before: 'const id = ',
          after: `\n\nsetTimeout(() => {\n  shellui.toast(${jsValue({ id: raw('id'), ...update }, '  ')});\n}, ${UPDATE_DELAY});`,
        })
      : sdkCall('toast', shown);
    return { sent, update, code };
  }, [o, t]);

  const run = () => {
    const { actionLabel, cancelLabel, reload } = o;
    const id = shellui.toast({
      ...call.sent,
      action: o.actionOn
        ? {
            label: actionLabel,
            onClick: () => {
              record('action', t('toasts.pressed', { label: actionLabel }), actionLabel);
              if (reload) window.location.reload();
            },
          }
        : undefined,
      cancel: o.cancelOn
        ? {
            label: cancelLabel,
            onClick: () =>
              record('cancel', t('toasts.pressed', { label: cancelLabel }), cancelLabel),
          }
        : undefined,
    });
    setLast({ time: now() });
    if (o.update && typeof id === 'string') {
      const update = call.update;
      setTimeout(() => {
        shellui.toast({ id, ...update });
        log('update', t('toasts.replaced'));
      }, UPDATE_DELAY);
    }
  };

  const result = !last ? (
    t('toasts.ready')
  ) : last.cb ? (
    <Inline text={t('toasts.result', { cb: last.cb, time: last.time, label: last.label })} />
  ) : (
    t('toasts.shown', { time: last.time })
  );

  return (
    <div className="max-w-[1180px] font-body text-foreground">
      <PageHeader
        group={t('dialogs.group')}
        icon={Layers}
        title={t('toasts.title')}
        lede={t('toasts.lede')}
        apis={['shellui.toast']}
        docs="https://docs.shellui.com/features/toasts"
      />
      <RecipeGrid
        active={o.recipe}
        onPick={(id) => setOptions(recipeOptions(id, t))}
        recipes={Object.keys(RECIPES).map((id) => ({
          id,
          name: t(`toasts.r.${id}`),
          sub: RECIPES[id].type,
          thumb: <Thumb id={id} />,
        }))}
      />
      <Workbench
        label={t('toasts.bench')}
        stage={
          <ToastDrawing
            o={o}
            olderTitle={t('toasts.older')}
            label={t('toasts.drawing', {
              position: t(`toasts.positions.${o.position}`),
              title: o.title,
            })}
          />
        }
        code={call.code}
        fileName="toasts.jsx"
        result={result}
        secondary={{ label: t('pg.reset'), onClick: () => setOptions(initial) }}
        run={{ label: t('toasts.run'), onClick: run }}
        options={
          <>
            <OptionGroup title={t('toasts.g.content')}>
              <Field
                as="fieldset"
                label={t('toasts.o.type')}
                prop="type"
              >
                <ChipSet
                  mono
                  label={t('toasts.o.type')}
                  value={o.type}
                  onChange={(type) => edit({ type })}
                  options={TYPES.map((x) => ({ value: x.value, label: x.value, icon: x.icon }))}
                />
              </Field>
              <TextField
                label={t('toasts.o.title')}
                prop="title"
                value={o.title}
                placeholder={typeLabel(o.type)}
                onChange={(title) => edit({ title })}
              />
              <TextField
                multiline
                label={t('toasts.o.description')}
                prop="description"
                value={o.description}
                onChange={(description) => edit({ description })}
              />
            </OptionGroup>
            <OptionGroup title={t('toasts.g.timing')}>
              <Field
                as="fieldset"
                label={t('toasts.o.duration')}
                prop="duration"
                disabled={o.type === 'loading'}
                help={o.type === 'loading' ? t('toasts.o.durationLoading') : undefined}
              >
                <Segmented
                  label={t('toasts.o.duration')}
                  value={String(o.duration)}
                  disabled={o.type === 'loading'}
                  onChange={(duration) => edit({ duration: Number(duration) })}
                  options={[2000, 4000, 8000].map((ms) => ({
                    value: String(ms),
                    label: `${ms / 1000} s`,
                  }))}
                />
              </Field>
              <Field
                as="fieldset"
                label={t('toasts.o.position')}
                prop="position"
              >
                <PositionPicker
                  label={t('toasts.o.position')}
                  value={o.position}
                  onChange={(position) => edit({ position })}
                />
              </Field>
            </OptionGroup>
            <OptionGroup title={t('toasts.g.buttons')}>
              <Switch
                label={t('toasts.o.action')}
                prop="action"
                checked={o.actionOn}
                onChange={(actionOn) => edit({ actionOn })}
              />
              {o.actionOn && (
                <input
                  aria-label={t('toasts.o.actionLabel')}
                  value={o.actionLabel}
                  onChange={(event) => edit({ actionLabel: event.target.value })}
                  className={`${inputClass} h-[34px]`}
                />
              )}
              <Switch
                label={t('toasts.o.cancel')}
                prop="cancel"
                checked={o.cancelOn}
                onChange={(cancelOn) => edit({ cancelOn })}
              />
              {o.cancelOn && (
                <input
                  aria-label={t('toasts.o.cancelLabel')}
                  value={o.cancelLabel}
                  onChange={(event) => edit({ cancelLabel: event.target.value })}
                  className={`${inputClass} h-[34px]`}
                />
              )}
              <Switch
                label={t('toasts.o.update')}
                prop="id"
                checked={o.update}
                onChange={(update) => edit({ update })}
                help={t('toasts.o.updateHelp')}
              />
            </OptionGroup>
          </>
        }
      />
      <Below>
        <EventLog
          title={t('toasts.log')}
          rows={rows}
          onClear={clear}
        />
        <Notes items={[t('toasts.n1'), t('toasts.n2'), t('toasts.n3'), t('toasts.n4')]} />
      </Below>
    </div>
  );
}
