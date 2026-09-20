import { createId } from './chatStore';

const now = 1_700_000_000_000;

/**
 * Polished sample threads so Chat screenshots are never an empty state.
 * Only used when localStorage has no chat key yet.
 * @param {(key: string) => string} t
 */
export function buildSeededStore(t) {
  const shellId = 'seed_shell';
  const themeId = 'seed_theme';
  const layoutId = 'seed_layout';

  return {
    conversations: [
      {
        id: shellId,
        title: t('chatSeedShellTitle'),
        updatedAt: now + 3,
        messages: [
          {
            id: createId('msg'),
            role: 'user',
            content: t('chatSeedShellUser'),
            createdAt: now,
          },
          {
            id: createId('msg'),
            role: 'assistant',
            content: t('chatSeedShellAssistant'),
            createdAt: now + 1,
          },
        ],
      },
      {
        id: themeId,
        title: t('chatSeedThemeTitle'),
        updatedAt: now + 2,
        messages: [
          {
            id: createId('msg'),
            role: 'user',
            content: t('chatSeedThemeUser'),
            createdAt: now,
          },
          {
            id: createId('msg'),
            role: 'assistant',
            content: t('chatSeedThemeAssistant'),
            createdAt: now + 1,
          },
        ],
      },
      {
        id: layoutId,
        title: t('chatSeedLayoutTitle'),
        updatedAt: now + 1,
        messages: [
          {
            id: createId('msg'),
            role: 'user',
            content: t('chatSeedLayoutUser'),
            createdAt: now,
          },
          {
            id: createId('msg'),
            role: 'assistant',
            content: t('chatSeedLayoutAssistant'),
            createdAt: now + 1,
          },
        ],
      },
    ],
    activeId: shellId,
  };
}
