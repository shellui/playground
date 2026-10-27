import { useEffect, useMemo, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Check, Globe, Languages as LanguagesIcon, RotateCcw } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { Inline, PageHeader } from '../components/playground';
import { useLang } from '../contexts/LangContext';
import { updateShellSettings } from '../lib/shell';
import { useNow, useShellSettings } from '../lib/useShellSettings';

/** Names and samples stay in their own language. */
const LANGS = [
  { code: 'en', name: 'English', sample: 'Good morning, Ana' },
  { code: 'fr', name: 'Français', sample: 'Bonjour Ana' },
];

const PRESETS = [
  { tz: 'Europe/London', city: 'london' },
  { tz: 'America/New_York', city: 'newYork' },
  { tz: 'Asia/Tokyo', city: 'tokyo' },
  { tz: 'Australia/Sydney', city: 'sydney' },
];

const DEVICE_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';

const ALL_ZONES = (() => {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    return ['UTC', ...PRESETS.map((p) => p.tz)];
  }
})();

function safeFormat(fn) {
  try {
    return fn();
  } catch {
    return '';
  }
}

/** One row per Intl call. `run(locale, timeZone, now)` gives the value; `opts` is shown. */
const ROWS = [
  {
    key: 'date',
    api: 'DateTimeFormat',
    opts: "{ dateStyle: 'full' }",
    run: (l, timeZone, now) =>
      new Intl.DateTimeFormat(l, { dateStyle: 'full', timeZone }).format(now),
  },
  {
    key: 'time',
    api: 'DateTimeFormat',
    opts: "{ timeStyle: 'short', timeZone }",
    run: (l, timeZone, now) =>
      new Intl.DateTimeFormat(l, { timeStyle: 'short', timeZone }).format(now),
  },
  {
    key: 'relative',
    api: 'RelativeTimeFormat',
    opts: "(3, 'day')",
    run: (l) => new Intl.RelativeTimeFormat(l, { numeric: 'auto' }).format(3, 'day'),
  },
  {
    key: 'number',
    api: 'NumberFormat',
    opts: '()',
    run: (l) => new Intl.NumberFormat(l).format(1234567.89),
  },
  {
    key: 'percent',
    api: 'NumberFormat',
    opts: "{ style: 'percent' }",
    run: (l) => new Intl.NumberFormat(l, { style: 'percent' }).format(0.42),
  },
  {
    key: 'list',
    api: 'ListFormat',
    opts: "{ type: 'conjunction' }",
    run: (l) => new Intl.ListFormat(l, { type: 'conjunction' }).format(['Ana', 'Jonas', 'Léa']),
  },
  {
    key: 'fileSize',
    api: 'NumberFormat',
    opts: "{ style: 'unit', unit: 'megabyte' }",
    run: (l) => new Intl.NumberFormat(l, { style: 'unit', unit: 'megabyte' }).format(3.2),
  },
];

const cardClass = 'rounded-xl border border-border bg-card text-card-foreground';
const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

function CardHead({ icon: Icon, title, help, id }) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <span className="flex size-9 flex-none items-center justify-center rounded-lg bg-primary/15">
        <Icon
          className="size-[18px]"
          aria-hidden
        />
      </span>
      <div className="min-w-0">
        <h2
          id={id}
          className="m-0 font-heading text-base font-semibold"
        >
          {title}
        </h2>
        <p className="m-0 mt-0.5 text-[13px] text-muted-foreground">{help}</p>
      </div>
    </div>
  );
}

function LanguageCard({ lang, t }) {
  const refs = useRef([]);
  const pick = (code) =>
    code !== lang && updateShellSettings((s) => ({ language: { ...s.language, code } }));
  const onKeyDown = (event) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const index = LANGS.findIndex((l) => l.code === lang);
    const next = (index + step + LANGS.length) % LANGS.length;
    pick(LANGS[next].code);
    refs.current[next]?.focus();
  };
  return (
    <section
      className={`${cardClass} p-4`}
      aria-labelledby="lang-h"
    >
      <CardHead
        id="lang-h"
        icon={LanguagesIcon}
        title={t('lang.language')}
        help={t('lang.languageHelp')}
      />
      <div
        role="radiogroup"
        aria-labelledby="lang-h"
        className="flex flex-col gap-2"
        onKeyDown={onKeyDown}
      >
        {LANGS.map((l, i) => {
          const on = l.code === lang;
          return (
            <button
              key={l.code}
              ref={(node) => (refs.current[i] = node)}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              lang={l.code}
              onClick={() => pick(l.code)}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-left ${focus} ${on ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-foreground/25'}`}
            >
              <span className="flex size-8 flex-none items-center justify-center rounded-md border border-border bg-muted font-mono text-[11px] font-semibold uppercase">
                {l.code}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{l.name}</span>
                <span className="block text-xs text-muted-foreground">{l.sample}</span>
              </span>
              {on && (
                <Check
                  className="size-4 flex-none"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TimezoneCard({ timeZone, locale, now, t }) {
  const presets = useMemo(() => {
    const rest = PRESETS.some((p) => p.tz === DEVICE_TZ)
      ? [...PRESETS.filter((p) => p.tz !== DEVICE_TZ), { tz: 'UTC', city: 'utc' }]
      : PRESETS;
    return [{ tz: DEVICE_TZ, device: true }, ...rest];
  }, []);
  const pick = (tz) =>
    tz !== timeZone && updateShellSettings((s) => ({ region: { ...s.region, timezone: tz } }));
  const zones = ALL_ZONES.includes(timeZone) ? ALL_ZONES : [timeZone, ...ALL_ZONES];
  return (
    <section
      id="region"
      className={`${cardClass} scroll-mt-6 p-4`}
      aria-labelledby="tz-h"
    >
      <CardHead
        id="tz-h"
        icon={Globe}
        title={t('lang.timezone')}
        help={t('lang.timezoneHelp')}
      />
      <ul
        aria-label={t('lang.tzGroup')}
        className="m-0 grid list-none grid-cols-5 gap-2 p-0 max-[1179px]:grid-cols-3 max-[759px]:grid-cols-2"
      >
        {presets.map((p) => {
          const on = p.tz === timeZone;
          return (
            <li key={p.tz}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => pick(p.tz)}
                className={`flex w-full min-w-0 cursor-pointer flex-col items-start rounded-lg border px-2.5 py-2 text-left ${focus} ${on ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-card hover:border-foreground/25'}`}
              >
                <span className="font-mono text-[15px] font-semibold tabular-nums">
                  {safeFormat(() =>
                    new Intl.DateTimeFormat(locale, { timeStyle: 'short', timeZone: p.tz }).format(
                      now,
                    ),
                  )}
                </span>
                <span className="text-[12.5px]">
                  {p.device ? t('lang.device') : t(`lang.city.${p.city}`)}
                </span>
                <span className="w-full truncate font-mono text-[10.5px] text-muted-foreground">
                  {p.tz}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="min-w-[12rem] flex-1">
          <span className="sr-only">{t('lang.more')}</span>
          <select
            value={presets.some((p) => p.tz === timeZone) ? '' : timeZone}
            onChange={(event) => event.target.value && pick(event.target.value)}
            className={`h-9 w-full cursor-pointer rounded-md border border-input bg-background px-2.5 text-sm text-foreground ${focus}`}
          >
            <option value="">{t('lang.more')}</option>
            {zones.map((zone) => (
              <option
                key={zone}
                value={zone}
              >
                {zone}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => pick(DEVICE_TZ)}
          disabled={timeZone === DEVICE_TZ}
          className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border-0 bg-transparent px-3 text-sm font-medium hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 ${focus}`}
        >
          <RotateCcw
            className="size-4"
            aria-hidden
          />
          {t('lang.useDevice')}
        </button>
      </div>
    </section>
  );
}

export default function Languages() {
  const { t } = useTranslation();
  const lang = useLang();
  const settings = useShellSettings();
  const timeZone = settings?.region?.timezone ?? DEVICE_TZ;
  const now = useNow(15000);
  const { hash } = useLocation();

  // Home links here with #region: bring the timezone card into view.
  useEffect(() => {
    if (hash === '#region') document.getElementById('region')?.scrollIntoView();
  }, [hash]);

  const code = `const { language, region } = shellui.initialSettings;
const locale = language.code;      // ${t('lang.c1')}
const timeZone = region.timezone;  // '${timeZone}'

new Intl.DateTimeFormat(locale, { timeStyle: 'short', timeZone })
  .format(new Date());

i18n.changeLanguage(locale);`;

  const tint = 'bg-primary/10';

  return (
    <div className="max-w-[1180px] font-body text-foreground">
      <PageHeader
        group={t('home.g.prefs')}
        icon={LanguagesIcon}
        title={t('lang.title')}
        lede={t('lang.lede')}
        apis={['settings.language', 'settings.region']}
        docs="https://docs.shellui.com/features/internationalization"
      />

      <div className="grid items-start gap-4 min-[1180px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <LanguageCard
          lang={lang}
          t={t}
        />
        <TimezoneCard
          timeZone={timeZone}
          locale={lang}
          now={now}
          t={t}
        />
      </div>

      <section
        className={`${cardClass} mt-4 overflow-hidden`}
        aria-labelledby="fmt-h"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 pt-3.5 pb-2">
          <h2
            id="fmt-h"
            className="m-0 text-sm font-semibold"
          >
            {t('lang.table.title')}
          </h2>
          <p className="m-0 text-xs text-muted-foreground">
            <Trans
              i18nKey="lang.table.summary"
              values={{ code: lang, tz: timeZone }}
              components={{ b: <b className="font-semibold text-foreground" /> }}
            />
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th
                  scope="col"
                  className="w-[14%] px-4 py-2 font-normal"
                >
                  <span className="sr-only">{t('lang.table.title')}</span>
                </th>
                {LANGS.map((l) => (
                  <th
                    key={l.code}
                    scope="col"
                    lang={l.code}
                    className={`px-3 py-2 font-medium ${l.code === lang ? `${tint} text-foreground` : 'font-normal'}`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {l.name}
                      {l.code === lang && (
                        <span
                          lang={lang}
                          className="inline-flex h-[18px] items-center rounded-md border border-primary/40 bg-primary/15 px-1.5 text-[10.5px] font-medium text-foreground"
                        >
                          {t('lang.table.inUse')}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
                <th
                  scope="col"
                  className="px-3 py-2 font-normal max-[759px]:hidden"
                >
                  {t('lang.table.madeWith')}
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.key}
                  className="border-t border-border"
                >
                  <th
                    scope="row"
                    className="px-4 py-2.5 text-xs font-normal text-muted-foreground"
                  >
                    {t(`lang.row.${row.key}`)}
                  </th>
                  {LANGS.map((l) => (
                    <td
                      key={l.code}
                      lang={l.code}
                      className={`px-3 py-2.5 tabular-nums ${l.code === lang ? `${tint} font-semibold` : ''}`}
                    >
                      {safeFormat(() => row.run(l.code, timeZone, now))}
                    </td>
                  ))}
                  <td className="px-3 py-2 max-[759px]:hidden">
                    <code className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                      Intl.{row.api}
                    </code>
                    <span className="mt-0.5 block font-mono text-[10.5px] text-muted-foreground">
                      {row.opts}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-4 grid overflow-hidden rounded-xl border border-border bg-card text-card-foreground min-[1180px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="p-5">
          <h2 className="m-0 font-heading text-lg font-semibold">{t('lang.use.t')}</h2>
          <p className="mt-2 mb-0 text-sm leading-[1.55]">
            <Inline text={t('lang.use.d')} />
          </p>
          <p className="mt-3 mb-0 text-[13px] text-muted-foreground">{t('lang.use.help')}</p>
        </div>
        <div className="min-w-0 p-3 min-[1180px]:pl-0">
          <CodeBlock
            code={code}
            title="format.js"
            labelKey={null}
            copy
            className=""
          />
        </div>
      </section>
    </div>
  );
}
