import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import { Building2, Folder, Github, UserCog, UserRound, ShieldCheck } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { Inline, PageHeader } from '../components/playground';
import { useShellSettings } from '../lib/useShellSettings';
import { OAUTH_PROVIDERS, initials, providerName } from '../lib/auth';
import config from '../../shellui.config.json';

const FIELDS = [
  'id',
  'name',
  'email',
  'profilePicture',
  'authProvider',
  'groups',
  'isStaff',
  'isCompanyOwner',
];

const cardClass = 'rounded-xl border border-border bg-card text-card-foreground';
const focus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const outlineButton = `inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted ${focus}`;

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28a7.2 7.2 0 0 1 0-4.56V6.61H1.27a12 12 0 0 0 0 10.78l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.27 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      aria-hidden
    >
      <path
        fill="#F25022"
        d="M1 1h10.5v10.5H1z"
      />
      <path
        fill="#7FBA00"
        d="M12.5 1H23v10.5H12.5z"
      />
      <path
        fill="#00A4EF"
        d="M1 12.5h10.5V23H1z"
      />
      <path
        fill="#FFB900"
        d="M12.5 12.5H23V23H12.5z"
      />
    </svg>
  );
}

function ProviderIcon({ id }) {
  if (id === 'google') return <GoogleIcon />;
  if (id === 'microsoft') return <MicrosoftIcon />;
  if (id === 'github')
    return (
      <Github
        className="size-4"
        aria-hidden
      />
    );
  return (
    <UserRound
      className="size-4"
      aria-hidden
    />
  );
}

/** How a value reads in JSON; `undefined` for fields the shell did not send. */
function FieldValue({ value }) {
  if (value === undefined) return <span className="text-muted-foreground">undefined</span>;
  const text = JSON.stringify(value).replace(/","/g, '", "');
  const muted = value === null || typeof value === 'boolean';
  return <span className={muted ? 'text-muted-foreground' : 'text-foreground'}>{text}</span>;
}

function SignedOut({ t }) {
  return (
    <section
      className={`${cardClass} grid items-center gap-6 p-5 min-[760px]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] min-[760px]:p-6`}
      aria-labelledby="account-out-h"
    >
      <div
        className="relative flex h-[132px] items-center justify-center overflow-hidden rounded-xl bg-muted/70"
        aria-hidden
      >
        <span className="absolute size-36 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_30%,transparent),transparent_70%)] motion-reduce:opacity-70" />
        <span className="absolute size-[88px] rounded-full border border-dashed border-primary/70" />
        <span className="relative flex size-14 items-center justify-center rounded-full border border-border bg-card shadow-sm">
          <UserRound className="size-6 text-foreground" />
        </span>
      </div>
      <div className="min-w-0">
        <h2
          id="account-out-h"
          className="m-0 font-heading text-lg font-semibold"
        >
          {t('account.out.title')}
        </h2>
        <p className="mt-1.5 mb-4 max-w-[52ch] text-sm leading-[1.55] text-muted-foreground">
          {t('account.out.text')}
        </p>
        <ul className="m-0 grid max-w-[320px] list-none gap-2 p-0">
          {OAUTH_PROVIDERS.map((provider) => (
            <li key={provider}>
              <button
                type="button"
                className={`${outlineButton} w-full`}
                onClick={() => shellui.login({ method: 'oauth', provider })}
              >
                <ProviderIcon id={provider} />
                {t('account.continueWith', { provider: providerName(provider) })}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 mb-0 text-xs text-muted-foreground">
          <Inline text={t('account.providersHelp')} />
        </p>
      </div>
    </section>
  );
}

function Profile({ user, t }) {
  const name = user.name || user.email || user.id;
  return (
    <section
      className={`${cardClass} p-5`}
      aria-labelledby="account-name"
    >
      <div className="flex min-w-0 items-center gap-3">
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={t('account.avatarAlt', { name })}
            className="size-12 flex-none rounded-full object-cover"
          />
        ) : (
          <span
            className="flex size-12 flex-none items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground"
            aria-hidden
          >
            {initials(name)}
          </span>
        )}
        <div className="min-w-0">
          <h2
            id="account-name"
            className="m-0 truncate font-heading text-lg font-semibold"
          >
            {name}
          </h2>
          {user.email && <p className="m-0 truncate text-sm text-muted-foreground">{user.email}</p>}
        </div>
      </div>
      <ul className="m-0 mt-4 grid list-none gap-1.5 p-0 text-sm">
        {user.authProvider && (
          <li className="flex items-center gap-2">
            <ProviderIcon id={user.authProvider} />
            {t('account.signedInWith', { provider: providerName(user.authProvider) })}
          </li>
        )}
        {user.isCompanyOwner === true && (
          <li className="flex items-center gap-2">
            <Building2
              className="size-4"
              aria-hidden
            />
            {t('account.owner')}
          </li>
        )}
        {user.isStaff === true && (
          <li className="flex items-center gap-2">
            <ShieldCheck
              className="size-4"
              aria-hidden
            />
            {t('account.staff')}
          </li>
        )}
      </ul>
      <div className="mt-4 border-t border-border pt-4">
        <button
          type="button"
          className={outlineButton}
          onClick={() => shellui.openModal('/__settings/user')}
        >
          <UserCog
            className="size-4"
            aria-hidden
          />
          {t('account.manage')}
        </button>
        <p className="mt-2 mb-0 text-xs text-muted-foreground">{t('account.signOutHelp')}</p>
      </div>
    </section>
  );
}

function Fields({ user, t }) {
  return (
    <section
      className={`${cardClass} min-w-0 overflow-hidden`}
      aria-labelledby="account-fields-h"
    >
      <div className="px-4 pt-3.5 pb-2">
        <h2
          id="account-fields-h"
          className="m-0 text-sm font-semibold"
        >
          {t('account.fields')}
        </h2>
        <p className="m-0 font-mono text-xs text-muted-foreground">settings.user</p>
      </div>
      <dl className="m-0">
        {FIELDS.map((field) => (
          <div
            key={field}
            className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-3 border-t border-border px-4 py-2"
          >
            <dt>
              <code className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[11.5px] text-foreground">
                {field}
              </code>
            </dt>
            <dd className="m-0 font-mono text-xs break-all">
              <FieldValue value={user[field]} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function Account() {
  const { t } = useTranslation();
  const settings = useShellSettings();
  const user = settings?.user;
  const signedIn = Boolean(user?.id);

  const authCode = `// ${t('account.code.c1')}
shellui.login({ method: 'oauth', provider: '${OAUTH_PROVIDERS[0]}' });

// ${t('account.code.c2')}
const user = shellui.initialSettings.user;
if (user?.id) greet(user.name);

// ${t('account.code.c3')}
shellui.addMessageListener('SHELLUI_SETTINGS', (message) =>
  setUser(message.payload.settings.user),
);`;

  const filesItem = config.navigation
    .flatMap((entry) => entry.items ?? [entry])
    .find((item) => item.path === 'files');
  const filesCode = JSON.stringify(
    {
      label: filesItem?.label,
      path: filesItem?.path,
      requiresAuth: filesItem?.requiresAuth,
      hideWhenLoggedOut: filesItem?.hideWhenLoggedOut,
    },
    null,
    2,
  );

  return (
    <div className="max-w-[1180px] font-body text-foreground">
      <PageHeader
        group={t('home.g.account')}
        icon={UserRound}
        title={t('account.title')}
        lede={t('account.lede')}
        apis={['login', 'settings.user']}
        docs="https://docs.shellui.com/features/authentication"
      />

      <div aria-live="polite">
        {signedIn ? (
          <div className="grid items-start gap-4 min-[760px]:grid-cols-[minmax(0,4fr)_minmax(0,5fr)]">
            <Profile
              user={user}
              t={t}
            />
            <Fields
              user={user}
              t={t}
            />
          </div>
        ) : (
          <SignedOut t={t} />
        )}
      </div>

      <section
        className="mt-4 grid overflow-hidden rounded-xl border border-border bg-card text-card-foreground min-[760px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        aria-labelledby="account-code-h"
      >
        <div className="p-5">
          <h2
            id="account-code-h"
            className="m-0 font-heading text-lg font-semibold"
          >
            {t('account.code.t')}
          </h2>
          <p className="mt-2 mb-0 text-sm leading-[1.55]">{t('account.code.d')}</p>
        </div>
        <div className="min-w-0 p-3 min-[760px]:pl-0">
          <CodeBlock
            code={authCode}
            title="auth.js"
            labelKey={null}
            copy
            className=""
          />
        </div>
      </section>

      <section
        className="mt-4 grid overflow-hidden rounded-xl border border-border bg-card text-card-foreground min-[760px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        aria-labelledby="account-gate-h"
      >
        <div className="p-5">
          <h2
            id="account-gate-h"
            className="m-0 font-heading text-lg font-semibold"
          >
            {t('account.gate.t')}
          </h2>
          <p className="mt-2 mb-0 text-sm leading-[1.55]">
            <Inline text={t('account.gate.d')} />
          </p>
          <p className="mt-4 mb-0 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm">
            <Folder
              className="size-4"
              aria-hidden
            />
            <b className="font-semibold">{filesItem?.label ?? 'Files'}</b>
            <span className="rounded-md border border-border px-1.5 py-px text-xs text-muted-foreground">
              {signedIn ? t('account.gate.visible') : t('account.gate.hidden')}
            </span>
          </p>
        </div>
        <div className="min-w-0 p-3 min-[760px]:pl-0">
          <CodeBlock
            code={filesCode}
            language="json"
            title="shellui.config.json"
            labelKey={null}
            copy
            className=""
          />
        </div>
      </section>
    </div>
  );
}
