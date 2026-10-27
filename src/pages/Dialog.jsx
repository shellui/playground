import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import { Cookie, Layers, Trash2 } from 'lucide-react';
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
} from '../components/playground';
import { raw, sdkCall } from '../lib/codegen';

const MODES = ['ok', 'okCancel', 'confirm', 'delete', 'onlyCancel'];
const DEFAULT_OK = { ok: 'ok', okCancel: 'ok', confirm: 'confirm', delete: 'delete' };

/** Recipe id -> options. Texts are i18n keys under dialogs.recipe.{id}. */
const RECIPES = {
  alert: { mode: 'ok' },
  confirm: { mode: 'confirm' },
  unsaved: { mode: 'okCancel', ok: true, cancel: true },
  delete: { mode: 'delete', ok: true, cancel: true },
  cookie: {
    mode: 'okCancel',
    position: 'bottom-left',
    icon: 'cookie',
    size: 'sm',
    ok: true,
    cancel: true,
    secondary: true,
  },
  upload: { mode: 'onlyCancel', cancel: true },
};

function recipeOptions(id, t) {
  const r = RECIPES[id];
  const text = (k) => t(`dialogs.recipe.${id}.${k}`);
  return {
    recipe: id,
    title: text('title'),
    description: text('description'),
    mode: r.mode,
    okLabel: r.ok ? text('ok') : '',
    cancelLabel: r.cancel ? text('cancel') : '',
    secondaryOn: Boolean(r.secondary),
    secondaryLabel: r.secondary ? text('secondary') : '',
    size: r.size ?? 'default',
    position: r.position ?? 'center',
    icon: r.icon ?? 'none',
  };
}

/** What the shell actually renders for these options (checked in core DialogContext). */
function resolve(o, t, lang) {
  const bottomLeft = o.position === 'bottom-left';
  const secondary = bottomLeft && o.secondaryOn && o.secondaryLabel.trim() !== '';
  const translate = lang !== 'en';
  const okDefault = t(`dialogs.defaults.${secondary ? 'ok' : (DEFAULT_OK[o.mode] ?? 'ok')}`);
  const cancelDefault = t('dialogs.defaults.cancel');
  const hasOk = secondary || o.mode !== 'onlyCancel';
  const hasCancel = secondary ? o.mode === 'okCancel' : o.mode !== 'ok';
  // The shell's own default labels are English, so other languages pass them.
  const okLabel = o.okLabel.trim() || (translate ? okDefault : '');
  const cancelLabel = o.cancelLabel.trim() || (translate ? cancelDefault : '');
  return {
    bottomLeft,
    secondary,
    hasOk,
    hasCancel,
    okText: okLabel || okDefault,
    cancelText: cancelLabel || cancelDefault,
    sent: {
      title: o.title,
      description: o.description.trim() || undefined,
      mode: o.mode === 'ok' ? undefined : o.mode,
      okLabel: hasOk && okLabel ? okLabel : undefined,
      cancelLabel: hasCancel && cancelLabel ? cancelLabel : undefined,
      size: !bottomLeft && o.size === 'sm' ? 'sm' : undefined,
      position: bottomLeft ? 'bottom-left' : undefined,
      icon: bottomLeft && o.icon === 'cookie' ? 'cookie' : undefined,
    },
  };
}

function DrawnButton({ kind, children, small }) {
  const styles = {
    ok: 'bg-primary text-primary-foreground',
    cancel: 'border border-border bg-card text-foreground',
    ghost: 'text-foreground',
    delete: 'bg-destructive text-white',
  };
  return (
    <span
      className={`inline-flex h-8 items-center justify-center rounded-md px-3 text-[13px] font-medium whitespace-nowrap ${styles[kind]} ${small ? 'min-w-0 flex-1' : ''}`}
    >
      <span className="truncate">{children}</span>
    </span>
  );
}

function DialogDrawing({ o, r, label }) {
  const small = o.size === 'sm' && !r.bottomLeft;
  const okKind = o.mode === 'delete' && !r.secondary ? 'delete' : 'ok';
  const cancelKind = r.bottomLeft && r.secondary ? 'ghost' : 'cancel';
  const buttons = (
    <>
      {r.hasCancel && <DrawnButton kind={cancelKind}>{r.cancelText}</DrawnButton>}
      {r.hasOk && <DrawnButton kind={okKind}>{r.okText}</DrawnButton>}
    </>
  );
  const title = o.title.trim() || '…';

  if (r.bottomLeft) {
    return (
      <MiniScreen
        label={label}
        scrim
      >
        <div className="pg-shadow absolute bottom-3 left-3 z-[2] w-[min(380px,calc(100%-24px))] rounded-xl border border-border bg-background text-[13px] text-foreground">
          <div className="flex items-start gap-3 p-4">
            {o.icon === 'cookie' && (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Cookie
                  className="size-[18px] text-primary-ink dark:text-primary"
                  aria-hidden
                />
              </span>
            )}
            <div className="min-w-0">
              <p className="m-0 text-[14.5px] leading-tight font-semibold">{title}</p>
              {o.description.trim() && (
                <p className="mt-1.5 mb-0 leading-relaxed text-muted-foreground">{o.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-b-xl border-t border-border bg-muted/50 px-4 py-2.5">
            {r.secondary ? (
              <>
                <DrawnButton kind="ghost">{o.secondaryLabel}</DrawnButton>
                <div className="flex gap-2">{buttons}</div>
              </>
            ) : (
              buttons
            )}
          </div>
        </div>
      </MiniScreen>
    );
  }

  return (
    <MiniScreen
      label={label}
      scrim
    >
      <div
        className={`pg-shadow absolute top-1/2 left-1/2 z-[2] w-[calc(100%-24px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-[18px] text-[13px] text-card-foreground ${small ? 'max-w-[300px] text-center' : 'max-w-[360px]'}`}
      >
        {o.mode === 'delete' && (
          <span
            className={`mb-3 flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive dark:bg-destructive/20 ${small ? 'mx-auto' : ''}`}
          >
            <Trash2
              className="size-[18px]"
              aria-hidden
            />
          </span>
        )}
        <p className="m-0 text-[15px] font-semibold">{title}</p>
        {o.description.trim() && (
          <p className="mt-1.5 mb-0 leading-normal whitespace-pre-line text-muted-foreground">
            {o.description}
          </p>
        )}
        <div className={`mt-4 flex gap-2 ${small ? '' : 'justify-end'}`}>
          {small ? (
            <>
              {r.hasCancel && (
                <DrawnButton
                  kind="cancel"
                  small
                >
                  {r.cancelText}
                </DrawnButton>
              )}
              {r.hasOk && (
                <DrawnButton
                  kind={okKind}
                  small
                >
                  {r.okText}
                </DrawnButton>
              )}
            </>
          ) : (
            buttons
          )}
        </div>
      </div>
    </MiniScreen>
  );
}

function Thumb({ id }) {
  const r = RECIPES[id];
  const corner = r.position === 'bottom-left';
  return (
    <div
      className={`flex w-[64%] flex-col gap-[5px] rounded-[7px] border border-border bg-card p-2 shadow-[0_8px_16px_-8px_rgb(0_0_0/0.25)] ${corner ? 'absolute bottom-2 left-2 w-[56%]' : ''}`}
    >
      {r.icon && (
        <Cookie
          className="size-3 text-primary-ink dark:text-primary"
          aria-hidden
        />
      )}
      <b className="block h-1.5 w-[55%] rounded-[3px] bg-foreground/55" />
      <i className="block h-[5px] rounded-[3px] bg-foreground/16" />
      <span className="mt-0.5 flex justify-end gap-1">
        {r.mode !== 'ok' && (
          <span className="h-2.5 w-6 rounded-[3px] border border-border bg-card" />
        )}
        {r.mode !== 'onlyCancel' && (
          <span
            className={`h-2.5 w-6 rounded-[3px] ${r.mode === 'delete' ? 'bg-destructive' : 'bg-primary'}`}
          />
        )}
      </span>
    </div>
  );
}

export default function DialogPage() {
  const { t, i18n } = useTranslation();
  const initial = useMemo(() => recipeOptions('delete', t), [t]);
  const [o, setOptions, set] = usePageOptions('dialogs', initial);
  const { rows, log, clear } = useEventLog();

  const edit = (patch) => set({ ...patch, recipe: null });
  const r = resolve(o, t, i18n.language);
  const recipeName = o.recipe ? t(`dialogs.r.${o.recipe}`) : null;

  const record = (cb, label) => {
    const detail =
      t('dialogs.pressed', { label }) +
      (recipeName ? t('dialogs.fromRecipe', { recipe: recipeName }) : '');
    log(cb, detail, { label });
  };

  const call = useMemo(() => {
    const sent = { ...r.sent };
    const codeOptions = { ...sent };
    if (r.hasOk) codeOptions.onOk = raw("() => log('onOk')");
    if (r.hasCancel) codeOptions.onCancel = raw("() => log('onCancel')");
    if (r.secondary) {
      codeOptions.secondaryButton = {
        label: o.secondaryLabel,
        onClick: raw("() => log('secondary')"),
      };
    }
    return { sent, code: sdkCall('dialog', codeOptions) };
  }, [r, o.secondaryLabel]);

  const run = () => {
    const { okText, cancelText, secondary } = r;
    shellui.dialog({
      ...call.sent,
      onOk: () => record('onOk', okText),
      onCancel: () => record('onCancel', cancelText),
      secondaryButton: secondary
        ? { label: o.secondaryLabel, onClick: () => record('secondary', o.secondaryLabel) }
        : undefined,
    });
  };

  const result = rows[0] ? (
    <Inline
      text={t('dialogs.result', {
        cb: rows[0].name,
        time: rows[0].time,
        label: rows[0].label,
      })}
    />
  ) : (
    t('dialogs.ready')
  );

  const modeOptions = MODES.map((m) => ({ value: m, label: m }));
  const placeholderOk = t(`dialogs.defaults.${DEFAULT_OK[o.mode] ?? 'ok'}`);

  return (
    <div className="max-w-[1180px] font-body text-foreground">
      <PageHeader
        group={t('dialogs.group')}
        icon={Layers}
        title={t('dialogs.title')}
        lede={t('dialogs.lede')}
        apis={['shellui.dialog']}
        docs="https://docs.shellui.com/features/dialogs"
      />
      <RecipeGrid
        active={o.recipe}
        onPick={(id) => setOptions(recipeOptions(id, t))}
        recipes={Object.keys(RECIPES).map((id) => ({
          id,
          name: t(`dialogs.r.${id}`),
          sub: RECIPES[id].position ?? RECIPES[id].mode,
          thumb: <Thumb id={id} />,
        }))}
      />
      <Workbench
        label={t('dialogs.bench')}
        stage={
          <DialogDrawing
            o={o}
            r={r}
            label={t('dialogs.drawing', { title: o.title })}
          />
        }
        code={call.code}
        fileName="dialogs.jsx"
        result={result}
        secondary={{ label: t('pg.reset'), onClick: () => setOptions(initial) }}
        run={{ label: t('pg.run'), onClick: run, disabled: o.title.trim() === '' }}
        options={
          <>
            <OptionGroup title={t('dialogs.g.content')}>
              <TextField
                label={t('dialogs.o.title')}
                prop="title"
                value={o.title}
                onChange={(title) => edit({ title })}
                help={o.title.trim() === '' ? t('dialogs.o.titleRequired') : undefined}
              />
              <TextField
                multiline
                label={t('dialogs.o.description')}
                prop="description"
                value={o.description}
                onChange={(description) => edit({ description })}
              />
            </OptionGroup>
            <OptionGroup title={t('dialogs.g.buttons')}>
              <Field
                as="fieldset"
                label={t('dialogs.o.mode')}
                prop="mode"
              >
                <ChipSet
                  mono
                  label={t('dialogs.o.mode')}
                  value={o.mode}
                  onChange={(mode) => edit({ mode })}
                  options={modeOptions}
                />
              </Field>
              <div className="grid grid-cols-2 gap-2.5">
                {r.hasOk ? (
                  <LabelInput
                    label={t('dialogs.o.okLabel')}
                    prop="okLabel"
                    value={o.okLabel}
                    placeholder={r.secondary ? t('dialogs.defaults.ok') : placeholderOk}
                    onChange={(okLabel) => edit({ okLabel })}
                  />
                ) : (
                  <span />
                )}
                {r.hasCancel && (
                  <LabelInput
                    label={t('dialogs.o.cancelLabel')}
                    prop="cancelLabel"
                    value={o.cancelLabel}
                    placeholder={t('dialogs.defaults.cancel')}
                    onChange={(cancelLabel) => edit({ cancelLabel })}
                  />
                )}
              </div>
              <Switch
                label={t('dialogs.o.secondary')}
                prop="secondaryButton"
                checked={o.secondaryOn && r.bottomLeft}
                disabled={!r.bottomLeft}
                onChange={(secondaryOn) => edit({ secondaryOn })}
                help={
                  !r.bottomLeft
                    ? t('dialogs.o.secondaryHelp')
                    : o.secondaryOn && o.mode !== 'ok' && o.mode !== 'okCancel'
                      ? t('dialogs.o.secondaryModes')
                      : undefined
                }
              />
              {r.bottomLeft && o.secondaryOn && (
                <input
                  aria-label={t('dialogs.o.secondaryLabel')}
                  value={o.secondaryLabel}
                  onChange={(event) => edit({ secondaryLabel: event.target.value })}
                  className={`${inputClass} h-[34px]`}
                />
              )}
            </OptionGroup>
            <OptionGroup title={t('dialogs.g.look')}>
              <Field
                as="fieldset"
                label={t('dialogs.o.size')}
                prop="size"
                disabled={r.bottomLeft}
                help={r.bottomLeft ? t('dialogs.o.sizeHelp') : undefined}
              >
                <Segmented
                  label={t('dialogs.o.size')}
                  value={o.size}
                  disabled={r.bottomLeft}
                  onChange={(size) => edit({ size })}
                  options={[
                    { value: 'default', label: t('dialogs.o.sizeDefault') },
                    { value: 'sm', label: t('dialogs.o.sizeSmall') },
                  ]}
                />
              </Field>
              <Field
                as="fieldset"
                label={t('dialogs.o.position')}
                prop="position"
              >
                <Segmented
                  label={t('dialogs.o.position')}
                  value={o.position}
                  onChange={(position) => edit({ position })}
                  options={[
                    { value: 'center', label: t('dialogs.o.center') },
                    { value: 'bottom-left', label: t('dialogs.o.bottomLeft') },
                  ]}
                />
              </Field>
              <Field
                as="fieldset"
                label={t('dialogs.o.icon')}
                prop="icon"
                disabled={!r.bottomLeft}
                help={!r.bottomLeft ? t('dialogs.o.iconHelp') : undefined}
              >
                <Segmented
                  label={t('dialogs.o.icon')}
                  value={o.icon}
                  disabled={!r.bottomLeft}
                  onChange={(icon) => edit({ icon })}
                  options={[
                    { value: 'none', label: t('dialogs.o.none') },
                    { value: 'cookie', label: t('dialogs.o.cookie'), icon: Cookie },
                  ]}
                />
              </Field>
            </OptionGroup>
          </>
        }
      />
      <Below>
        <EventLog
          title={t('dialogs.log')}
          rows={rows}
          onClear={clear}
        />
        <Notes items={[t('dialogs.n1'), t('dialogs.n2'), t('dialogs.n3'), t('dialogs.n4')]} />
      </Below>
    </div>
  );
}

function LabelInput({ label, prop, value, placeholder, onChange }) {
  return (
    <TextField
      label={
        <span className="flex flex-col">
          {label}
          <small className="font-mono text-[11px] text-muted-foreground">{prop}</small>
        </span>
      }
      value={value}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
}
