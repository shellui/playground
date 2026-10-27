/**
 * Prints SDK calls as JavaScript for the code panels. The same options object feeds
 * Run, so the sample is always what the button sends.
 */
const RAW = Symbol('raw');

/** Code printed as is, for callbacks such as `() => log('onOk')`. */
export function raw(code) {
  return { [RAW]: code };
}

const quote = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const key = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : quote(k));

export function jsValue(value, indent = '') {
  if (value && value[RAW]) return value[RAW];
  if (typeof value === 'string') return quote(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const inner = indent + '  ';
    return `[\n${value.map((v) => inner + jsValue(v, inner)).join(',\n')},\n${indent}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return '{}';
    const inline = entries.map(([k, v]) => `${key(k)}: ${jsValue(v, indent)}`).join(', ');
    if (indent && inline.length <= 52 && !inline.includes('\n')) return `{ ${inline} }`;
    const inner = indent + '  ';
    return `{\n${entries.map(([k, v]) => `${inner}${key(k)}: ${jsValue(v, inner)}`).join(',\n')},\n${indent}}`;
  }
  return String(value);
}

/** `import shellui from '@shellui/sdk';` then `shellui.fn({...});`. */
export function sdkCall(fn, options, { before = '', after = '' } = {}) {
  const arg = options === undefined ? '' : jsValue(options, '');
  return `import shellui from '@shellui/sdk';\n\n${before}shellui.${fn}(${arg});${after}`;
}

/** Drops keys whose value equals the SDK default, so samples stay short. */
export function withoutDefaults(options, defaults) {
  return Object.fromEntries(
    Object.entries(options).filter(
      ([k, v]) => v !== undefined && v !== '' && !(k in defaults && defaults[k] === v),
    ),
  );
}
