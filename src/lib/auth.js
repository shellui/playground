/**
 * The playground does not read the shell config at runtime, so the providers are listed
 * here. Keep them in the order of `backend.login.oauthProviders` in shellui.config.json.
 */
export const OAUTH_PROVIDERS = ['github', 'google', 'microsoft'];

const PROVIDER_NAMES = { github: 'GitHub', google: 'Google', microsoft: 'Microsoft' };

/** Display name for a provider id; unknown ids are shown as they are. */
export function providerName(id) {
  return PROVIDER_NAMES[id] ?? id;
}

export function initials(name) {
  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
