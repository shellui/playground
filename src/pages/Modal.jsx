import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import { GripVertical, Layers, X } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import {
  ChipSet,
  Field,
  Inline,
  MiniScreen,
  OptionGroup,
  PageHeader,
  SelectField,
  Switch,
  Workbench,
  inputClass,
  usePageOptions,
  useShellClock,
} from '../components/playground';
import { raw, sdkCall } from '../lib/codegen';
import { appRouteUrl } from '../lib/shell';

const PHONE = '(max-width: 759px)';
const ROUTES = ['/overlay-sample', '/themes', '/languages'];
const ROUTE_KEY = { '/overlay-sample': 'sample', '/themes': 'themes', '/languages': 'languages' };
const SIDES = ['left', 'top', 'bottom', 'right'];

/** Widths from core overlaySize.ts. */
const MODAL_SIZES = [
  { value: 'sm', hint: '24rem' },
  { value: 'md', hint: '32rem' },
  { value: 'lg', hint: '56rem' },
  { value: 'xl', hint: '72rem' },
  { value: 'full', hintKey: 'overlays.o.viewport' },
  { value: 'content', hintKey: 'overlays.o.fits' },
];
const DRAWER_SIZES = ['sm', 'md', 'lg', 'xl', 'full'];
const DRAWER_HINT = {
  horizontal: { sm: '20rem', md: '28rem', lg: '36rem', xl: '48rem', full: '100%' },
  vertical: { sm: '40%', md: '55%', lg: '75%', xl: '90%', full: '100%' },
};
/** Drawing sizes, in px of the mini screen (width) or % of its height. */
const MODAL_DRAW_W = { sm: 260, md: 330, lg: 440, xl: 520 };
const DRAWER_DRAW = {
  horizontal: { sm: 150, md: 200, lg: 250, xl: 320, full: 'calc(100% - 12px)' },
  vertical: { sm: '40%', md: '55%', lg: '75%', xl: '90%', full: 'calc(100% - 12px)' },
};

const MODAL_DEFAULTS = {
  route: '/overlay-sample',
  size: 'md',
  movable: true,
  resizable: true,
  showCloseButton: true,
  dismissible: true,
  closeOnOverlayClick: true,
};
const DRAWER_DEFAULTS = {
  route: '/overlay-sample',
  position: 'right',
  size: 'md',
  custom: '',
  showDragHandle: true,
  resizable: true,
  dismissible: true,
  closeOnOverlayClick: true,
};

function useMedia(query) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatch(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);
  return match;
}

/** The route with the `in` flag the sample route reads. */
function routePath(route, where) {
  return route === '/overlay-sample' ? `${route}?in=${where}` : route;
}

function RouteSelect({ value, onChange }) {
  const { t } = useTranslation();
  return (
    <SelectField
      label={t('overlays.o.route')}
      prop="url"
      value={value}
      onChange={onChange}
      help={t('overlays.o.routeHelp')}
      options={ROUTES.map((route) => ({
        value: route,
        label: `${t(`overlays.routes.${ROUTE_KEY[route]}`)}  ${route}`,
      }))}
    />
  );
}

/** Sample content drawn inside the modal or drawer. */
function SampleBody({ where, route }) {
  const { t } = useTranslation();
  if (route !== '/overlay-sample') {
    return (
      <div className="flex flex-col gap-2 p-3">
        <b className="block h-2.5 w-1/2 rounded-[3px] bg-foreground/55" />
        <i className="pg-mini-line" />
        <i className="pg-mini-line w-[80%]" />
        <div className="mt-1 grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-8 rounded-md border border-border bg-card"
            />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="p-3 text-left">
      <p className="m-0 font-mono text-[10px] text-muted-foreground">
        {t(where === 'drawer' ? 'overlays.drawer' : 'overlays.modal')}
      </p>
      <p className="m-0 mt-0.5 text-[13px] font-semibold">{t('sample.title')}</p>
      <p className="m-0 mt-1 text-[11px] leading-snug text-muted-foreground">
        {t('sample.body', {
          where: t(where === 'drawer' ? 'sample.whereDrawer' : 'sample.whereModal'),
        })}
      </p>
      <div className="mt-2 flex flex-col divide-y divide-border rounded-md border border-border">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="flex items-center gap-1.5 px-2 py-1.5"
          >
            <span className="size-2 rounded-[2px] bg-primary/60" />
            <i className="pg-mini-line w-[70%]" />
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 text-[10.5px]">
        <span className="rounded border border-border px-1.5 py-0.5">+ {t('sample.addRow')}</span>
        <span className="rounded px-1.5 py-0.5">{t('sample.close')}</span>
      </div>
    </div>
  );
}

function ModalDrawing({ o, phone, label }) {
  const { t } = useTranslation();
  const title = t(`overlays.routes.${ROUTE_KEY[o.route]}`);
  const bar = (
    <div className="flex h-7 flex-none items-center gap-1.5 border-b border-border px-2 text-[11.5px] font-medium">
      {o.movable && !phone && (
        <GripVertical
          className="size-3.5 text-muted-foreground"
          aria-hidden
        />
      )}
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {o.showCloseButton && (
        <X
          className="size-3.5 text-muted-foreground"
          aria-hidden
        />
      )}
    </div>
  );
  if (phone) {
    return (
      <MiniScreen
        scrim
        label={label}
        sidebar={false}
      >
        <div className="absolute inset-x-0 bottom-0 z-[2] max-h-[78%] overflow-hidden rounded-t-xl border border-b-0 border-border bg-background text-foreground shadow-lg">
          <span className="mx-auto mt-1.5 block h-1 w-9 rounded-full bg-foreground/20" />
          {bar}
          <SampleBody
            where="modal"
            route={o.route}
          />
        </div>
      </MiniScreen>
    );
  }
  const full = o.size === 'full';
  const width = full ? 'calc(100% - 12px)' : o.size === 'content' ? 'auto' : MODAL_DRAW_W[o.size];
  return (
    <MiniScreen
      scrim
      label={label}
    >
      <div
        className={`absolute top-1/2 left-1/2 z-[2] flex max-w-[calc(100%-12px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-lg transition-[width] duration-200 motion-reduce:transition-none ${full ? 'h-[calc(100%-12px)]' : ''} ${o.size === 'content' ? 'w-max max-w-[300px]' : ''}`}
        style={o.size === 'content' ? undefined : { width }}
      >
        {bar}
        <SampleBody
          where="modal"
          route={o.route}
        />
        {o.resizable && (
          <span
            className="absolute right-0.5 bottom-0.5 size-2.5 border-r-2 border-b-2 border-muted-foreground/60"
            aria-hidden
          />
        )}
      </div>
    </MiniScreen>
  );
}

function DrawerDrawing({ o, phone, label }) {
  const side = phone ? 'bottom' : o.position;
  const vertical = side === 'top' || side === 'bottom';
  const dims = DRAWER_DRAW[vertical ? 'vertical' : 'horizontal'];
  const custom = o.custom.trim();
  const size = custom ? (vertical ? '50%' : 220) : (dims[o.size] ?? dims.md);
  // Floating panel: a small gap on its outer sides, like the real drawer.
  const place = phone
    ? 'inset-x-1 bottom-1 rounded-xl border'
    : {
        left: 'inset-y-1.5 left-1.5 rounded-lg border',
        right: 'inset-y-1.5 right-1.5 rounded-lg border',
        top: 'inset-x-1.5 top-1.5 rounded-lg border',
        bottom: 'inset-x-1.5 bottom-1.5 rounded-lg border',
      }[side];
  const grip = {
    left: 'right-1 top-1/2 h-8 w-1 -translate-y-1/2',
    right: 'left-1 top-1/2 h-8 w-1 -translate-y-1/2',
    top: 'bottom-1 left-1/2 h-1 w-8 -translate-x-1/2',
    bottom: 'top-1 left-1/2 h-1 w-8 -translate-x-1/2',
  }[side];
  return (
    <MiniScreen
      scrim
      label={label}
      sidebar={!phone}
    >
      <div
        className={`absolute z-[2] max-w-full overflow-hidden border-border bg-background text-foreground shadow-lg ${place}`}
        style={vertical ? { height: size } : { width: size }}
      >
        {(o.showDragHandle || (o.resizable && !phone)) && (
          <span
            className={`absolute rounded-full bg-foreground/25 ${grip}`}
            aria-hidden
          />
        )}
        <div className={vertical ? 'pt-2' : side === 'right' ? 'pl-2' : 'pr-2'}>
          <SampleBody
            where="drawer"
            route={o.route}
          />
        </div>
      </div>
    </MiniScreen>
  );
}

function SidePicker({ value, onChange, label }) {
  const { t } = useTranslation();
  const refs = useRef([]);
  const index = SIDES.indexOf(value);
  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + SIDES.length) % SIDES.length;
    onChange(SIDES[next]);
    refs.current[next]?.focus();
  };
  const panel = {
    left: 'inset-y-0.5 left-0.5 w-[35%] rounded-[3px]',
    right: 'inset-y-0.5 right-0.5 w-[35%] rounded-[3px]',
    top: 'inset-x-0.5 top-0.5 h-[40%] rounded-[3px]',
    bottom: 'inset-x-0.5 bottom-0.5 h-[40%] rounded-[3px]',
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="grid grid-cols-4 gap-1.5"
    >
      {SIDES.map((side, i) => {
        const on = side === value;
        return (
          <button
            key={side}
            ref={(node) => (refs.current[i] = node)}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(side)}
            className="flex cursor-pointer flex-col items-center gap-1 rounded-md text-[11px] text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
          >
            <span
              className={`relative block h-[30px] w-full overflow-hidden rounded-[5px] border bg-muted ${on ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
            >
              <span
                className={`absolute ${panel[side]} ${on ? 'bg-primary' : 'bg-foreground/20'}`}
              />
            </span>
            <span className={on ? 'font-medium text-foreground' : ''}>
              {t(`overlays.side.${side}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function BenchTitle({ title, hint }) {
  return (
    <div className="mt-8 mb-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 className="m-0 font-heading text-base font-semibold">{title}</h2>
      <p className="m-0 text-[13px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function urlArg(route, where) {
  return raw(`appRouteUrl('${routePath(route, where)}')`);
}

function ModalBench({ phone }) {
  const { t } = useTranslation();
  const now = useShellClock();
  const [o, setOptions, set] = usePageOptions('modal', MODAL_DEFAULTS);
  const [result, setResult] = useState(null);
  const options = {
    size: o.size,
    movable: o.movable,
    resizable: o.resizable,
    showCloseButton: o.showCloseButton,
    dismissible: o.dismissible,
    closeOnOverlayClick: o.closeOnOverlayClick,
  };
  const code = sdkCall('openModal', { url: urlArg(o.route, 'modal'), ...options });
  const locked = !o.showCloseButton && !o.dismissible && !o.closeOnOverlayClick;
  const run = () => {
    const path = routePath(o.route, 'modal');
    shellui.openModal({ url: appRouteUrl(path), ...options });
    setResult({ time: now(), path: o.route });
  };
  const sizeHint = (s) => (s.hintKey ? t(s.hintKey) : s.hint);
  return (
    <>
      <BenchTitle
        title={t('overlays.modal')}
        hint={t('overlays.modalHint')}
      />
      <Workbench
        label={t('overlays.bench.modal')}
        stage={
          <ModalDrawing
            o={o}
            phone={phone}
            label={t('overlays.drawModal', { size: o.size, path: o.route })}
          />
        }
        code={code}
        fileName="modals.jsx"
        result={result ? <Inline text={t('overlays.modalOpened', result)} /> : t('overlays.ready')}
        secondary={{ label: t('pg.reset'), onClick: () => setOptions(MODAL_DEFAULTS) }}
        run={{ label: t('overlays.openModal'), onClick: run }}
        options={
          <>
            <OptionGroup title={t('overlays.g.what')}>
              <RouteSelect
                value={o.route}
                onChange={(route) => set({ route })}
              />
            </OptionGroup>
            <OptionGroup title={t('overlays.g.size')}>
              <Field
                as="fieldset"
                label={t('overlays.o.preset')}
                prop="size"
              >
                <ChipSet
                  mono
                  label={t('overlays.o.preset')}
                  value={o.size}
                  onChange={(size) => set({ size })}
                  options={MODAL_SIZES.map((s) => ({
                    value: s.value,
                    label: s.value,
                    hint: sizeHint(s),
                  }))}
                />
              </Field>
            </OptionGroup>
            <OptionGroup title={t('overlays.g.behavior')}>
              <Switch
                label={t('overlays.o.movable')}
                prop="movable"
                checked={o.movable}
                onChange={(movable) => set({ movable })}
                help={phone ? t('overlays.o.desktopOnly') : undefined}
              />
              <Switch
                label={t('overlays.o.resizable')}
                prop="resizable"
                checked={o.resizable}
                onChange={(resizable) => set({ resizable })}
                help={phone ? t('overlays.o.desktopOnly') : undefined}
              />
              <Switch
                label={t('overlays.o.closeButton')}
                prop="showCloseButton"
                checked={o.showCloseButton}
                onChange={(showCloseButton) => set({ showCloseButton })}
              />
              <Switch
                label={t('overlays.o.escape')}
                prop="dismissible"
                checked={o.dismissible}
                onChange={(dismissible) => set({ dismissible })}
              />
              <Switch
                label={t('overlays.o.backdrop')}
                prop="closeOnOverlayClick"
                checked={o.closeOnOverlayClick}
                onChange={(closeOnOverlayClick) => set({ closeOnOverlayClick })}
                help={locked ? t('overlays.o.onlyInside') : undefined}
                helpTone="warning"
              />
            </OptionGroup>
          </>
        }
      />
    </>
  );
}

function DrawerBench({ phone }) {
  const { t } = useTranslation();
  const now = useShellClock();
  const [o, setOptions, set] = usePageOptions('drawer', DRAWER_DEFAULTS);
  const [result, setResult] = useState(null);
  const vertical = o.position === 'top' || o.position === 'bottom';
  const custom = o.custom.trim();
  const options = {
    position: o.position,
    size: custom || o.size,
    showDragHandle: o.showDragHandle,
    resizable: o.resizable,
    dismissible: o.dismissible,
    closeOnOverlayClick: o.closeOnOverlayClick,
  };
  const code = sdkCall(
    'openDrawer',
    { url: urlArg(o.route, 'drawer'), ...options },
    { after: '\n\n// inside the route, when done\nshellui.closeDrawer();' },
  );
  const run = () => {
    shellui.openDrawer({ url: appRouteUrl(routePath(o.route, 'drawer')), ...options });
    setResult({ time: now(), side: t(`overlays.sidePhrase.${o.position}`) });
  };
  const hints = DRAWER_HINT[vertical ? 'vertical' : 'horizontal'];
  return (
    <>
      <BenchTitle
        title={t('overlays.drawer')}
        hint={t('overlays.drawerHint')}
      />
      <Workbench
        label={t('overlays.bench.drawer')}
        stage={
          <DrawerDrawing
            o={o}
            phone={phone}
            label={t('overlays.drawDrawer', {
              side: t(`overlays.sidePhrase.${phone ? 'bottom' : o.position}`),
              size: options.size,
            })}
          />
        }
        code={code}
        fileName="drawers.jsx"
        result={result ? t('overlays.drawerOpened', result) : t('overlays.ready')}
        secondary={{ label: t('pg.reset'), onClick: () => setOptions(DRAWER_DEFAULTS) }}
        run={{ label: t('overlays.openDrawer'), onClick: run }}
        options={
          <>
            <OptionGroup title={t('overlays.g.what')}>
              <RouteSelect
                value={o.route}
                onChange={(route) => set({ route })}
              />
            </OptionGroup>
            <OptionGroup title={t('overlays.g.place')}>
              <Field
                as="fieldset"
                label={t('overlays.o.position')}
                prop="position"
                help={phone ? t('overlays.mobileSheet') : undefined}
              >
                <SidePicker
                  label={t('overlays.o.position')}
                  value={o.position}
                  onChange={(position) => set({ position })}
                />
              </Field>
              <Field
                as="fieldset"
                label={t('overlays.o.preset')}
                prop="size"
                disabled={Boolean(custom)}
              >
                <ChipSet
                  mono
                  label={t('overlays.o.preset')}
                  value={custom ? null : o.size}
                  onChange={(size) => set({ size, custom: '' })}
                  options={DRAWER_SIZES.map((s) => ({ value: s, label: s, hint: hints[s] }))}
                />
              </Field>
              <Field
                label={t('overlays.o.custom')}
                prop="size"
                htmlFor="drawer-custom-size"
                help={<Inline text={t('overlays.o.customHelp')} />}
              >
                <input
                  id="drawer-custom-size"
                  value={o.custom}
                  placeholder={vertical ? '40vh' : '400px'}
                  onChange={(event) => set({ custom: event.target.value })}
                  className={`${inputClass} h-[34px] font-mono`}
                />
              </Field>
            </OptionGroup>
            <OptionGroup title={t('overlays.g.behavior')}>
              <Switch
                label={t('overlays.o.dragHandle')}
                prop="showDragHandle"
                checked={o.showDragHandle}
                onChange={(showDragHandle) => set({ showDragHandle })}
              />
              <Switch
                label={t('overlays.o.resizableEdge')}
                prop="resizable"
                checked={o.resizable}
                onChange={(resizable) => set({ resizable })}
                help={phone ? t('overlays.o.desktopOnly') : undefined}
              />
              <Switch
                label={t('overlays.o.escapeSwipe')}
                prop="dismissible"
                checked={o.dismissible}
                onChange={(dismissible) => set({ dismissible })}
              />
              <Switch
                label={t('overlays.o.backdrop')}
                prop="closeOnOverlayClick"
                checked={o.closeOnOverlayClick}
                onChange={(closeOnOverlayClick) => set({ closeOnOverlayClick })}
              />
            </OptionGroup>
          </>
        }
      />
    </>
  );
}

const NAV_SNIPPET = `// shellui.config.json, navigation item
{
  "label": { "en": "Settings", "fr": "Paramètres" },
  "path": "settings",
  "url": "/__settings",
  "icon": "/icons/settings.svg",
  "openIn": "modal",
  "position": "end"
}`;

const SAMPLE_SNIPPET = `import shellui from '@shellui/sdk';

// Reports the height when the overlay was opened with size: 'content'.
useEffect(() => shellui.overlay.autoSize(), []);

const close = inDrawer
  ? () => shellui.closeDrawer()
  : () => shellui.closeModal();`;

function InfoCard({ title, body, code, fileName }) {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-card p-4 text-card-foreground">
      <h2 className="m-0 font-heading text-sm font-semibold">{title}</h2>
      <p className="mt-2 mb-3 text-[13px] leading-[1.55] text-muted-foreground">
        <Inline text={body} />
      </p>
      <CodeBlock
        code={code}
        title={fileName}
        labelKey={null}
        copy
        className=""
      />
    </section>
  );
}

export default function Modal() {
  const { t } = useTranslation();
  const phone = useMedia(PHONE);
  return (
    <div className="max-w-[1180px] font-body text-foreground">
      <PageHeader
        group={t('dialogs.group')}
        icon={Layers}
        title={t('overlays.title')}
        lede={t('overlays.lede')}
        apis={['shellui.openModal', 'shellui.openDrawer']}
        docs="https://docs.shellui.com/features/modals-drawers"
      />
      <ModalBench phone={phone} />
      <DrawerBench phone={phone} />
      <div className="mt-6 grid gap-4 min-[1180px]:grid-cols-2">
        <InfoCard
          title={t('overlays.navTitle')}
          body={t('overlays.navBody')}
          code={NAV_SNIPPET}
          fileName="shellui.config.json"
        />
        <InfoCard
          title={t('overlays.sampleTitle')}
          body={t('overlays.sampleBody')}
          code={SAMPLE_SNIPPET}
          fileName="OverlaySample.jsx"
        />
      </div>
    </div>
  );
}
