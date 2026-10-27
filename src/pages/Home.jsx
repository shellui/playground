import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import { Apple, ArrowRight, ArrowUpRight, BookOpen, Github, Terminal } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import RunConsole from '../components/home/RunConsole';
import ShellContext from '../components/home/ShellContext';
import TourCard from '../components/home/TourCard';
import {
  ActionsIllustration,
  AuthIllustration,
  DialogIllustration,
  LanguageIllustration,
  LayoutsIllustration,
  OverlaysIllustration,
  StorageIllustration,
  ThemesIllustration,
  ToastsIllustration,
} from '../components/home/illustrations';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LangContext';
import { useShellSettings } from '../lib/useShellSettings';
import { layout as configLayout } from '../../shellui.config.json';

const REPO_URL = 'https://github.com/shellui/playground';
const RELEASES_URL = 'https://github.com/shellui/playground/releases';
const DOCS_URL = 'https://docs.shellui.com';
const QUICKSTART_URL = 'https://docs.shellui.com/quickstart';

/** "Open Settings" opens the shell Settings modal, the same URL as the Settings nav item. */
const SHOW_OPEN_SETTINGS = true;

const inlineCode =
  '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-foreground';

const CONFIG_SAMPLE = `// shellui.config.json
{
  "navigation": [{
    "label": "Playground",
    "path": "home",
    "url": "http://localhost:5173/#/"
  }]
}`;

const INIT_SAMPLE = `// main.jsx
import shellui from '@shellui/sdk';

await shellui.init();
const s = shellui.initialSettings;
applyThemeToDocument(s.appearance);
i18n.changeLanguage(s.language.code);`;

const TOAST_SAMPLE = `// any component
shellui.toast({
  title: 'Saved',
  type: 'success',
});`;

const TERMINAL_SAMPLE = `git clone https://github.com/shellui/playground.git
cd playground && pnpm install
pnpm start`;

function Html({ as: Tag = 'span', html, className = '' }) {
  return (
    <Tag
      className={`${inlineCode} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function SectionHeader({ id, title, body }) {
  return (
    <header className="max-w-[62ch]">
      <h2
        id={id}
        className="font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground"
      >
        {title}
      </h2>
      {body && <p className="mt-2 text-[15px] text-muted-foreground">{body}</p>}
    </header>
  );
}

function GroupRow({ title, body, children }) {
  return (
    <div className="grid min-w-0 gap-4 border-t border-border py-6 min-[760px]:grid-cols-[220px_minmax(0,1fr)] min-[760px]:gap-6">
      <div className="min-w-0">
        <h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
      {children}
    </div>
  );
}

function Hero() {
  const { t } = useTranslation();
  const version = shellui.getVersion?.();
  const title2 = t('home.title2', { interpolation: { escapeValue: false } });
  return (
    <div className="relative min-w-0 pt-2 min-[1180px]:pt-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 -z-10 size-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_70%)] blur-[40px] dark:opacity-45 motion-reduce:hidden"
      />
      <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
        <span
          className="size-2 shrink-0 rounded-full bg-success"
          aria-hidden
        />
        {t('home.chip')}
        {version && (
          <span className="truncate rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-normal text-muted-foreground">
            @shellui/sdk {version}
          </span>
        )}
      </p>
      <h1 className="font-heading mt-5 text-[32px] leading-[1.12] font-semibold tracking-[-0.028em] text-foreground min-[760px]:text-[40px] min-[760px]:leading-[1.1]">
        {t('home.title1')}
        <br />
        <span
          className="[&_.gold]:text-primary-ink"
          dangerouslySetInnerHTML={{
            __html: title2.replace(/<gold>(.*?)<\/gold>/, '<span class="gold">$1</span>'),
          }}
        />
      </h1>
      <Html
        as="p"
        className="mt-4 block max-w-[52ch] text-[17px] leading-relaxed text-muted-foreground"
        html={t('home.lede')}
      />
      <div className="mt-6 flex flex-col gap-2 min-[760px]:flex-row min-[760px]:flex-wrap min-[760px]:items-center min-[760px]:gap-3">
        <a
          href="#tour"
          onClick={(event) => {
            event.preventDefault();
            document.getElementById('tour')?.scrollIntoView({
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto'
                : 'smooth',
            });
            document.getElementById('tour-title')?.focus({ preventScroll: true });
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground! no-underline! shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('home.tour')}
          <ArrowRight
            className="size-4"
            aria-hidden
          />
        </a>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-foreground! no-underline! transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Github
            className="size-4"
            aria-hidden
          />
          shellui/playground
        </a>
        <a
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-1 rounded-md px-3 text-sm font-medium text-foreground! underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('home.docs')}
          <ArrowUpRight
            className="size-3.5"
            aria-hidden
          />
        </a>
      </div>
    </div>
  );
}

function NewBadge() {
  const { t } = useTranslation();
  return (
    <span className="inline-flex h-[18px] items-center rounded-md border border-primary/40 bg-primary/15 px-1.5 text-[10.5px] font-medium text-foreground">
      {t('home.new')}
    </span>
  );
}

function Tour() {
  const { t } = useTranslation();
  const appearance = useTheme();
  const lang = useLang();
  const settings = useShellSettings();
  const mode = appearance?.mode === 'dark' ? 'dark' : 'light';
  const themes = appearance?.availableThemes ?? [];
  const timeZone = settings?.region?.timezone;

  return (
    <section
      id="tour"
      aria-labelledby="tour-title"
      className="mt-16 scroll-mt-6"
    >
      <header className="mb-6 max-w-[62ch]">
        <h2
          id="tour-title"
          tabIndex={-1}
          className="font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground focus:outline-none"
        >
          {t('home.tourTitle')}
        </h2>
        <p className="mt-2 text-[15px] text-muted-foreground">{t('home.tourBody')}</p>
      </header>

      <GroupRow
        title={t('home.g.overlays')}
        body={t('home.g.overlaysBody')}
      >
        <div className="grid min-w-0 gap-3 min-[760px]:grid-cols-2 min-[1180px]:grid-cols-3">
          <TourCard
            to="/dialog"
            title={t('home.c.dialogs')}
            body={t('home.c.dialogsBody')}
            api="shellui.dialog"
          >
            <DialogIllustration />
          </TourCard>
          <TourCard
            to="/toaster"
            title={t('home.c.toasts')}
            body={t('home.c.toastsBody')}
            api="shellui.toast"
          >
            <ToastsIllustration />
          </TourCard>
          <TourCard
            to="/modal"
            title={t('home.c.overlays')}
            body={t('home.c.overlaysBody')}
            api="openModal · openDrawer"
          >
            <OverlaysIllustration />
          </TourCard>
        </div>
      </GroupRow>

      <GroupRow
        title={t('home.g.chrome')}
        body={t('home.g.chromeBody')}
      >
        <div className="grid min-w-0 gap-3 min-[760px]:grid-cols-2">
          <TourCard
            to="/actions"
            title={t('home.c.actions')}
            body={t('home.c.actionsBody')}
            api="shellui.actions.set"
          >
            <ActionsIllustration />
          </TourCard>
          <TourCard
            to="/layout"
            title={t('home.c.layouts')}
            body={t('home.c.layoutsBody')}
            api="layout"
          >
            <LayoutsIllustration current={settings?.layout ?? configLayout ?? 'sidebar'} />
          </TourCard>
        </div>
      </GroupRow>

      <GroupRow
        title={t('home.g.prefs')}
        body={t('home.g.prefsBody')}
      >
        <div className="grid min-w-0 gap-3 min-[760px]:grid-cols-2">
          <TourCard
            to="/themes"
            title={t('home.c.themes')}
            body={t('home.c.themesBody', { count: themes.length })}
            api="settings.appearance"
          >
            <ThemesIllustration
              themes={themes}
              current={appearance?.name}
              mode={mode}
              countLabel={themes.length ? t('home.c.themesCount', { count: themes.length }) : null}
            />
          </TourCard>
          <TourCard
            to="/languages"
            title={t('home.c.language')}
            body={t('home.c.languageBody')}
            api="settings.language · region"
          >
            <LanguageIllustration
              lang={lang}
              timeZone={timeZone}
            />
          </TourCard>
        </div>
      </GroupRow>
      <GroupRow
        title={t('home.g.account')}
        body={t('home.g.accountBody')}
      >
        <div className="grid min-w-0 gap-3 min-[760px]:grid-cols-2">
          <TourCard
            to="/account"
            title={t('home.c.auth')}
            body={t('home.c.authBody')}
            api="shellui.login · settings.user"
            badge={<NewBadge />}
          >
            <AuthIllustration />
          </TourCard>
          <TourCard
            to="/storage"
            title={t('home.c.storage')}
            body={t('home.c.storageBody')}
            api="selectFiles · selectFolders"
            badge={<NewBadge />}
          >
            <StorageIllustration />
          </TourCard>
        </div>
      </GroupRow>
    </section>
  );
}

function Wiring() {
  const { t } = useTranslation();
  const steps = [
    { title: t('home.s1'), body: t('home.s1Body'), code: CONFIG_SAMPLE, language: 'json' },
    { title: t('home.s2'), body: t('home.s2Body'), code: INIT_SAMPLE, language: 'javascript' },
    { title: t('home.s3'), body: t('home.s3Body'), code: TOAST_SAMPLE, language: 'javascript' },
  ];
  return (
    <section
      aria-labelledby="wire-title"
      className="mt-16"
    >
      <SectionHeader
        id="wire-title"
        title={t('home.wireTitle')}
        body={t('home.wireBody')}
      />
      <ol className="mt-6 grid list-none gap-4 p-0 min-[1180px]:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={i}
            className="flex min-w-0 flex-col"
          >
            <div className="mb-3 flex gap-3">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  i === 2
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-card text-foreground'
                }`}
                aria-hidden
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <h3 className="font-heading text-sm font-semibold text-foreground">
                  <span className="sr-only">{i + 1}. </span>
                  {step.title}
                </h3>
                <Html
                  as="p"
                  className="mt-0.5 block text-xs text-muted-foreground"
                  html={step.body}
                />
              </div>
            </div>
            <CodeBlock
              labelKey={null}
              className="flex-1 [&>div]:h-full"
              code={step.code}
              language={step.language}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}

function LinkRow({ href, icon: Icon, title, body }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-w-0 items-center gap-3 rounded-lg border border-border bg-background p-3 text-foreground! no-underline! transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{body}</span>
      </span>
      <ArrowUpRight
        className="size-4 shrink-0 text-muted-foreground group-hover:text-primary-ink"
        aria-hidden
      />
    </a>
  );
}

function RunLocally() {
  const { t } = useTranslation();
  return (
    <section
      aria-labelledby="run-title"
      className="mt-16 grid min-w-0 gap-6 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm min-[1180px]:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] min-[760px]:p-6"
    >
      <div className="min-w-0">
        <h2
          id="run-title"
          className="font-heading text-xl font-semibold tracking-[-0.02em] text-foreground"
        >
          {t('home.runTitle')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('home.runBody')}</p>
        <CodeBlock
          labelKey={null}
          className="mt-4"
          title={
            <span className="inline-flex items-center gap-1.5">
              <Terminal
                className="size-3.5"
                aria-hidden
              />
              {t('home.terminal')}
            </span>
          }
          copy
          language="bash"
          code={TERMINAL_SAMPLE}
        />
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-2">
        <LinkRow
          href={REPO_URL}
          icon={Github}
          title={t('home.l.github')}
          body={t('home.l.githubBody')}
        />
        <LinkRow
          href={RELEASES_URL}
          icon={Apple}
          title={t('home.l.mac')}
          body={t('home.l.macBody')}
        />
        <LinkRow
          href={QUICKSTART_URL}
          icon={BookOpen}
          title={t('home.l.docs')}
          body={t('home.l.docsBody')}
        />
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useTranslation();
  return (
    <div className="relative isolate mx-auto max-w-[1180px] font-body text-foreground">
      <div className="grid min-w-0 items-start gap-10 min-[1180px]:grid-cols-[minmax(0,1fr)_480px]">
        <Hero />
        <RunConsole />
      </div>
      <div className="mt-10">
        <ShellContext showOpenSettings={SHOW_OPEN_SETTINGS} />
      </div>
      <Tour />
      <Wiring />
      <RunLocally />
      <Html
        as="p"
        className="mt-8 mb-4 block text-center text-sm text-muted-foreground"
        html={t('home.foot')}
      />
    </div>
  );
}
