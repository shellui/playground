import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import shellui from '@shellui/sdk';
import {
  Building2,
  Check,
  Cloud,
  File,
  FileText,
  Folder,
  FolderOpen,
  FolderSearch,
  Image,
  Lock,
  LogIn,
  UserRound,
} from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import {
  Field,
  GhostButton,
  Inline,
  MiniScreen,
  Notes,
  OptionGroup,
  PageHeader,
  RecipeGrid,
  Segmented,
  Switch,
  Workbench,
  usePageOptions,
  useResetSignal,
  useShellClock,
} from '../components/playground';
import { useShellSettings } from '../lib/useShellSettings';

const RECIPES = {
  attach: { mode: 'files', multiple: true, sub: 'selectFiles, multiple' },
  folder: { mode: 'folders', multiple: false, sub: 'selectFolders' },
  any: { mode: 'both', multiple: false, sub: 'selectStorage, any' },
};

const DEFAULTS = { recipe: 'attach', mode: 'files', multiple: true };

const cardClass = 'rounded-xl border border-border bg-card text-card-foreground';
const outlineButton =
  'inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';
const chip =
  'inline-flex items-center rounded-md border border-border px-1.5 py-px font-mono text-[11px] text-muted-foreground';

/** The SDK call each mode runs, as code and as a function. */
function pickerCall(o) {
  if (o.mode === 'folders') {
    return {
      name: 'selectFolders',
      args: `{ multiple: ${o.multiple} }`,
      run: () => shellui.selectFolders({ multiple: o.multiple }),
    };
  }
  if (o.mode === 'both') {
    return {
      name: 'selectStorage',
      args: `{ multiple: ${o.multiple}, mode: 'any' }`,
      run: () => shellui.selectStorage({ multiple: o.multiple, mode: 'any' }),
    };
  }
  return {
    name: 'selectFiles',
    args: `{ multiple: ${o.multiple} }`,
    run: () => shellui.selectFiles({ multiple: o.multiple }),
  };
}

function shortId(id) {
  if (!id) return '';
  return id.length > 10 ? `${id.slice(0, 4)}…${id.slice(-4)}` : id;
}

function fileIcon(name, type) {
  if (type === 'folder') return Folder;
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(name)) return Image;
  if (/\.(pdf|md|txt|docx?)$/i.test(name)) return FileText;
  return File;
}

/** Folder that "List this folder" opens: a picked folder itself, or a file's parent. */
function folderOf(item) {
  if (item.type === 'folder') return item.path;
  const parts = item.path.split('/');
  parts.pop();
  return parts.join('/');
}

function Mark({ on, multiple, disabled }) {
  const shape = multiple ? 'rounded-[3px]' : 'rounded-full';
  if (disabled) return <span className={`size-3 flex-none border border-border ${shape}`} />;
  return on ? (
    <span
      className={`flex size-3 flex-none items-center justify-center bg-primary text-primary-foreground ${shape}`}
    >
      {multiple ? (
        <Check className="size-2.5" />
      ) : (
        <span className="size-1 rounded-full bg-primary-foreground" />
      )}
    </span>
  ) : (
    <span className={`size-3 flex-none border border-muted-foreground/50 bg-card ${shape}`} />
  );
}

function PickerDrawing({ o, t, label }) {
  const rows = [
    { name: 'Assets', type: 'folder', meta: t('storage.draw.items', { count: 4 }) },
    { name: 'brief.pdf', type: 'file', meta: '240 KB' },
    { name: 'cover.png', type: 'file', meta: '1.8 MB' },
    { name: 'budget.xlsx', type: 'file', meta: '56 KB' },
    { name: 'notes.md', type: 'file', meta: '4 KB' },
  ];
  const picked = (row) => {
    if (o.mode === 'folders') return row.type === 'folder';
    if (row.type === 'folder') return false;
    return o.multiple
      ? row.name === 'brief.pdf' || row.name === 'cover.png'
      : row.name === 'brief.pdf';
  };
  const count = rows.filter(picked).length;
  const buckets = [
    { Icon: UserRound, name: t('storage.draw.myFiles'), on: true },
    { Icon: Building2, name: t('storage.draw.team') },
    { Icon: Cloud, name: t('storage.draw.drive') },
  ];
  return (
    <MiniScreen
      label={label}
      scrim
    >
      <div className="pg-shadow absolute top-1/2 left-1/2 z-[2] flex w-[calc(100%-24px)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border bg-background text-[11.5px] text-foreground">
        <div className="flex w-[128px] flex-none flex-col gap-0.5 border-r border-border bg-sidebar p-2 max-[759px]:hidden">
          <span className="px-1.5 pb-1 text-[10.5px] text-muted-foreground">
            {t('storage.draw.buckets')}
          </span>
          {buckets.map(({ Icon, name, on }) => (
            <span
              key={name}
              className={`flex items-center gap-1.5 truncate rounded-md px-1.5 py-1 ${on ? 'bg-card font-semibold shadow-sm' : ''}`}
            >
              <Icon className="size-3 flex-none" />
              <span className="truncate">{name}</span>
            </span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="truncate border-b border-border px-3 py-2 text-muted-foreground">
            {t('storage.draw.myFiles')} / {t('storage.draw.projects')} /{' '}
            <b className="font-semibold text-foreground">Launch</b>
          </div>
          <ul className="m-0 list-none p-1">
            {rows.map((row) => {
              const Icon = fileIcon(row.name, row.type);
              const on = picked(row);
              const greyed = o.mode === 'folders' && row.type === 'file';
              const selectable = !greyed && !(o.mode === 'files' && row.type === 'folder');
              return (
                <li
                  key={row.name}
                  className={`flex items-center gap-2 rounded-md px-2 py-1 ${on ? 'bg-primary/12' : ''} ${greyed ? 'opacity-40' : ''}`}
                >
                  {selectable ? (
                    <Mark
                      on={on}
                      multiple={o.multiple}
                    />
                  ) : (
                    <span className="size-3 flex-none" />
                  )}
                  <Icon className="size-3.5 flex-none text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{row.name}</span>
                  <span className="flex-none text-[10.5px] text-muted-foreground">{row.meta}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-auto flex items-center gap-1.5 border-t border-border px-3 py-2">
            <span className="flex-1 truncate text-muted-foreground">
              {t('storage.draw.selected', { count })}
            </span>
            <span className="rounded-md border border-border bg-card px-2 py-0.5">
              {t('storage.draw.cancel')}
            </span>
            <span className="rounded-md bg-primary px-2 py-0.5 font-medium text-primary-foreground">
              {t('storage.draw.select')}
            </span>
          </div>
        </div>
      </div>
    </MiniScreen>
  );
}

function Thumb({ id }) {
  const icons = { attach: [FileText, Image], folder: [Folder], any: [Folder, File] }[id];
  return (
    <div className="flex gap-1.5">
      {icons.map((Icon, i) => (
        <span
          key={i}
          className="flex size-7 items-center justify-center rounded-md border border-border bg-card shadow-sm"
        >
          <Icon className="size-3.5 text-foreground" />
        </span>
      ))}
    </div>
  );
}

function SignInBanner({ t }) {
  return (
    <section
      className={`${cardClass} mb-[18px] flex flex-wrap items-center gap-3 p-4`}
      aria-labelledby="storage-gate-h"
    >
      <span className="flex size-9 flex-none items-center justify-center rounded-lg bg-primary/15">
        <Lock
          className="size-4"
          aria-hidden
        />
      </span>
      <div className="min-w-0 flex-1 basis-[240px]">
        <h2
          id="storage-gate-h"
          className="m-0 text-sm font-semibold"
        >
          {t('storage.gate.t')}
        </h2>
        <p className="m-0 mt-0.5 text-[13px] text-muted-foreground">{t('storage.gate.d')}</p>
      </div>
      <button
        type="button"
        onClick={() => shellui.navigate('/account')}
        className={`${outlineButton} max-[759px]:w-full max-[759px]:justify-center`}
      >
        <LogIn
          className="size-4"
          aria-hidden
        />
        {t('storage.gate.btn')}
      </button>
    </section>
  );
}

function PickedCard({ picked, onClear, t }) {
  const [folder, setFolder] = useState(null); // { path, bucket, loading, rows, error }

  useEffect(() => setFolder(null), [picked]);

  const listFolder = async () => {
    const first = picked[0];
    const path = folderOf(first);
    setFolder({ path, bucket: first.bucket, loading: true, rows: [] });
    try {
      const { data, error } = await shellui.storage.from(first.bucket).list(path);
      setFolder({ path, bucket: first.bucket, rows: data ?? [], error: error?.message });
    } catch (error) {
      setFolder({ path, bucket: first.bucket, rows: [], error: String(error?.message ?? error) });
    }
  };

  const th = 'px-4 py-2 text-xs font-normal text-muted-foreground';
  const td = 'px-4 py-2.5';

  return (
    <section
      className={`${cardClass} min-w-0 overflow-hidden`}
      aria-labelledby="storage-picked-h"
    >
      <div className="flex flex-wrap items-center gap-2 px-4 pt-3 pb-2">
        <h2
          id="storage-picked-h"
          className="m-0 flex-1 text-sm font-semibold"
        >
          {folder ? t('storage.folderContents') : t('storage.picked')}
          {folder && (
            <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
              {folder.bucket}/{folder.path}
            </span>
          )}
        </h2>
        {folder ? (
          <GhostButton onClick={() => setFolder(null)}>{t('storage.backToPicked')}</GhostButton>
        ) : (
          <>
            <button
              type="button"
              className={outlineButton}
              disabled={picked.length === 0}
              onClick={listFolder}
            >
              <FolderSearch
                className="size-4"
                aria-hidden
              />
              {t('storage.listFolder')}
            </button>
            <GhostButton
              onClick={onClear}
              disabled={picked.length === 0}
              className="disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('pg.clear')}
            </GhostButton>
          </>
        )}
      </div>

      <div
        className="overflow-x-auto"
        aria-live="polite"
      >
        {folder ? (
          folder.loading ? (
            <p className="m-0 border-t border-border px-4 py-3 text-[13px] text-muted-foreground">
              {t('storage.listing')}
            </p>
          ) : folder.error ? (
            <p className="m-0 border-t border-border px-4 py-3 text-[13px] text-destructive">
              {folder.error}
            </p>
          ) : folder.rows.length === 0 ? (
            <p className="m-0 border-t border-border px-4 py-3 text-[13px] text-muted-foreground">
              {t('storage.emptyFolder')}
            </p>
          ) : (
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr>
                  <th className={th}>{t('storage.col.name')}</th>
                  <th className={th}>{t('storage.col.type')}</th>
                  <th className={th}>{t('storage.col.size')}</th>
                </tr>
              </thead>
              <tbody>
                {folder.rows.map((row) => {
                  const type = row.id ? 'file' : 'folder';
                  const Icon = fileIcon(row.name, type);
                  const size = row.metadata?.size;
                  return (
                    <tr
                      key={`${row.name}-${row.id ?? row.folder_id ?? ''}`}
                      className="border-t border-border"
                    >
                      <td className={td}>
                        <span className="flex items-center gap-2">
                          <Icon
                            className="size-4 flex-none text-muted-foreground"
                            aria-hidden
                          />
                          {row.name}
                        </span>
                      </td>
                      <td className={td}>
                        <span className={chip}>{type}</span>
                      </td>
                      <td className={`${td} tabular-nums text-muted-foreground`}>
                        {typeof size === 'number'
                          ? new Intl.NumberFormat(undefined, {
                              style: 'unit',
                              unit: 'kilobyte',
                              maximumFractionDigits: 0,
                            }).format(size / 1024)
                          : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : picked.length === 0 ? (
          <p className="m-0 border-t border-border px-4 py-3 text-[13px] text-muted-foreground">
            {t('storage.emptyPicked')}
          </p>
        ) : (
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr>
                <th className={th}>{t('storage.col.name')}</th>
                <th className={th}>{t('storage.col.type')}</th>
                <th className={`${th} max-[759px]:hidden`}>{t('storage.col.bucket')}</th>
                <th className={th}>{t('storage.col.path')}</th>
                <th className={`${th} max-[759px]:hidden`}>{t('storage.col.id')}</th>
              </tr>
            </thead>
            <tbody>
              {picked.map((item) => {
                const Icon = fileIcon(item.name, item.type);
                return (
                  <tr
                    key={item.id}
                    className="border-t border-border"
                  >
                    <td className={td}>
                      <span className="flex items-center gap-2">
                        <Icon
                          className="size-4 flex-none text-muted-foreground"
                          aria-hidden
                        />
                        {item.name}
                      </span>
                    </td>
                    <td className={td}>
                      <span className={chip}>{item.type}</span>
                    </td>
                    <td
                      className={`${td} font-mono text-xs text-muted-foreground max-[759px]:hidden`}
                    >
                      {item.bucket}
                    </td>
                    <td className={`${td} font-mono text-xs break-all text-muted-foreground`}>
                      {item.path === '' ? "''" : item.path}
                    </td>
                    <td
                      className={`${td} font-mono text-xs text-muted-foreground max-[759px]:hidden`}
                    >
                      <span title={item.id}>{shortId(item.id)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <p className="m-0 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
        <Inline text={t('storage.idHelp')} />
      </p>
    </section>
  );
}

const KIND_ICON = { user: UserRound, company: Building2, connector: Cloud };

function DirectCard({ user, signedIn, picked, t }) {
  const [state, setState] = useState({ loading: false, buckets: [], error: null });

  useEffect(() => {
    if (!signedIn) {
      setState({ loading: false, buckets: [], error: null });
      return undefined;
    }
    let live = true;
    setState({ loading: true, buckets: [], error: null });
    shellui.storage
      .listBuckets()
      .then(({ data, error }) => {
        if (live) setState({ loading: false, buckets: data ?? [], error: error?.message ?? null });
      })
      .catch((error) => {
        if (live) setState({ loading: false, buckets: [], error: String(error?.message ?? error) });
      });
    return () => {
      live = false;
    };
  }, [signedIn, user?.id]);

  const sample = picked[0];
  const bucket = sample?.bucket ?? state.buckets[0]?.name ?? 'my-bucket';
  const path = sample ? folderOf(sample) : '';
  const code = `const { data: buckets, error } = await shellui.storage.listBuckets();
const { data: files } = await shellui.storage
  .from('${bucket}')
  .list('${path}');`;

  return (
    <section
      className="mt-4 grid overflow-hidden rounded-xl border border-border bg-card text-card-foreground min-[1180px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      aria-labelledby="storage-direct-h"
    >
      <div className="min-w-0 p-5">
        <h2
          id="storage-direct-h"
          className="m-0 font-heading text-lg font-semibold"
        >
          {t('storage.direct.t')}
        </h2>
        <p className="mt-2 mb-3 text-sm leading-[1.55]">
          <Inline text={t('storage.direct.d')} />
        </p>
        <div aria-live="polite">
          {!signedIn ? (
            <p className="m-0 text-[13px] text-muted-foreground">{t('storage.direct.out')}</p>
          ) : state.loading ? (
            <p className="m-0 text-[13px] text-muted-foreground">{t('storage.direct.loading')}</p>
          ) : state.error ? (
            <p className="m-0 text-[13px] text-destructive">{state.error}</p>
          ) : state.buckets.length === 0 ? (
            <p className="m-0 text-[13px] text-muted-foreground">{t('storage.direct.empty')}</p>
          ) : (
            <>
              <ul className="m-0 grid list-none gap-1.5 p-0">
                {state.buckets.map((b) => {
                  const Icon = KIND_ICON[b.kind] ?? FolderOpen;
                  return (
                    <li
                      key={b.id}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[13px]"
                    >
                      <Icon
                        className="size-4 flex-none text-muted-foreground"
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {b.display_name ?? b.name}
                      </span>
                      {b.kind && <span className={chip}>{b.kind}</span>}
                      <span className="text-xs text-muted-foreground">
                        {b.public ? t('storage.public') : t('storage.private')}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 mb-0 text-xs text-muted-foreground">
                <Inline
                  text={t('storage.direct.help', { name: user?.name || user?.email || '' })}
                />
              </p>
            </>
          )}
        </div>
      </div>
      <div className="min-w-0 p-3 min-[1180px]:pl-0">
        <CodeBlock
          code={code}
          title="storage.js"
          labelKey={null}
          copy
          className=""
        />
      </div>
    </section>
  );
}

export default function StoragePage() {
  const { t } = useTranslation();
  const settings = useShellSettings();
  const user = settings?.user;
  const signedIn = Boolean(user?.id);
  const [o, setOptions, set] = usePageOptions('storage', DEFAULTS);
  const now = useShellClock();
  const [result, setResult] = useState(null);
  const [picked, setPicked] = useState([]);
  const [busy, setBusy] = useState(false);

  useResetSignal(() => {
    setResult(null);
    setPicked([]);
  });

  const edit = (patch) => set({ ...patch, recipe: null });
  const call = pickerCall(o);
  const modeLabel = t(`storage.mode.${o.mode}`);

  const code = useMemo(
    () => `const result = await shellui.${call.name}(${call.args});

if (!result) return; // cancelled
for (const item of result.items) {
  // { id, bucket, path, name, type }
  attach(item.id, item.name);
}`,
    [call.name, call.args],
  );
  const fileName = { files: 'attach.js', folders: 'pick-folder.js', both: 'pick.js' }[o.mode];

  const run = async () => {
    setBusy(true);
    try {
      const res = await call.run();
      const time = now();
      if (!res) {
        setResult({ text: t('storage.res.cancelled', { time }) });
      } else {
        setPicked(res.items);
        setResult({ text: t('storage.res.picked', { count: res.items.length, time }) });
      }
    } catch (error) {
      setResult({
        error: true,
        text: t('storage.res.error', {
          time: now(),
          message: String(error?.message ?? error),
        }),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-[1180px] font-body text-foreground">
      <PageHeader
        group={t('home.g.account')}
        icon={FolderOpen}
        title={t('storage.title')}
        lede={t('storage.lede')}
        apis={['selectFiles', 'selectFolders', 'selectStorage', 'storage']}
        docs="https://docs.shellui.com/features/storage-picker"
      />
      {!signedIn && <SignInBanner t={t} />}
      <RecipeGrid
        active={o.recipe}
        onPick={(id) =>
          setOptions({ recipe: id, mode: RECIPES[id].mode, multiple: RECIPES[id].multiple })
        }
        recipes={Object.keys(RECIPES).map((id) => ({
          id,
          name: t(`storage.r.${id}`),
          sub: RECIPES[id].sub,
          thumb: <Thumb id={id} />,
        }))}
      />
      <Workbench
        label={t('storage.bench')}
        stage={
          <PickerDrawing
            o={o}
            t={t}
            label={t('storage.draw.label', {
              mode: modeLabel,
              selection: o.multiple ? t('storage.draw.multiple') : t('storage.draw.single'),
            })}
          />
        }
        code={code}
        fileName={fileName}
        result={
          result ? (
            <span className={result.error ? 'text-destructive' : undefined}>
              <Inline text={result.text} />
            </span>
          ) : (
            t('storage.ready')
          )
        }
        secondary={{ label: t('pg.reset'), onClick: () => setOptions(DEFAULTS) }}
        run={{ label: t('storage.run'), onClick: run, disabled: busy, icon: FolderOpen }}
        options={
          <>
            <OptionGroup title={t('storage.g.what')}>
              <Field
                as="fieldset"
                label={t('storage.o.mode')}
                prop="mode"
                help={o.mode === 'files' ? t('storage.o.modeHelp') : undefined}
              >
                <Segmented
                  label={t('storage.o.mode')}
                  value={o.mode}
                  onChange={(mode) => edit({ mode })}
                  options={['files', 'folders', 'both'].map((value) => ({
                    value,
                    label: t(`storage.mode.${value}`),
                  }))}
                />
              </Field>
            </OptionGroup>
            <OptionGroup title={t('storage.g.selection')}>
              <Switch
                label={t('storage.o.multiple')}
                prop="multiple"
                checked={o.multiple}
                onChange={(multiple) => edit({ multiple })}
              />
            </OptionGroup>
            <OptionGroup title={t('storage.g.calls')}>
              <p className="m-0 text-[12.5px] leading-[1.6] text-muted-foreground">
                <Inline text={t('storage.o.calls')} />
              </p>
            </OptionGroup>
          </>
        }
      />
      <div className="mt-4">
        <PickedCard
          picked={picked}
          onClear={() => setPicked([])}
          t={t}
        />
      </div>
      <DirectCard
        user={user}
        signedIn={signedIn}
        picked={picked}
        t={t}
      />
      <div className="mt-4">
        <Notes
          items={[t('storage.note1'), t('storage.note2'), t('storage.note3'), t('storage.note4')]}
        />
      </div>
    </div>
  );
}
