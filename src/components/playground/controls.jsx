import { useId, useRef } from 'react';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

export const inputClass =
  'w-full rounded-md border border-input bg-background px-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed';

/** Titled block in the options column, separated by a hairline. */
export function OptionGroup({ title, children }) {
  return (
    <div className="mb-3.5 border-b border-border pb-3.5 last:mb-0 last:border-b-0">
      <p className="mb-2.5 text-[12.5px] font-semibold text-muted-foreground">{title}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

/** Label with the SDK property in mono on the right, then the control and a help line. */
export function Field({ label, prop, help, helpTone, disabled, htmlFor, children, as = 'div' }) {
  const Tag = as;
  const helpId = useId();
  return (
    <Tag
      className={`m-0 min-w-0 border-0 p-0 ${disabled ? 'opacity-55' : ''}`}
      aria-describedby={help ? helpId : undefined}
    >
      {as === 'fieldset' ? (
        <legend className="mb-1.5 flex w-full items-center justify-between gap-2 p-0 text-[13px]">
          <span>{label}</span>
          {prop && <code className="font-mono text-[11.5px] text-muted-foreground">{prop}</code>}
        </legend>
      ) : (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 flex items-center justify-between gap-2 text-[13px]"
        >
          <span>{label}</span>
          {prop && <code className="font-mono text-[11.5px] text-muted-foreground">{prop}</code>}
        </label>
      )}
      {children}
      {help && (
        <p
          id={helpId}
          className={`mt-1.5 text-xs ${helpTone === 'warning' ? 'text-warning dark:text-amber-400' : 'text-muted-foreground'}`}
        >
          {help}
        </p>
      )}
    </Tag>
  );
}

/** Text input or textarea bound to one option. */
export function TextField({
  label,
  prop,
  value,
  onChange,
  placeholder,
  multiline,
  help,
  disabled,
}) {
  const id = useId();
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <Field
      label={label}
      prop={prop}
      help={help}
      htmlFor={id}
      disabled={disabled}
    >
      <Tag
        id={id}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={multiline ? 2 : undefined}
        className={`${inputClass} ${multiline ? 'min-h-[58px] resize-y py-1.5 leading-snug' : 'h-[34px]'}`}
      />
    </Field>
  );
}

/** Native select, styled like the inputs. */
export function SelectField({ label, prop, value, onChange, options, help }) {
  const id = useId();
  return (
    <Field
      label={label}
      prop={prop}
      help={help}
      htmlFor={id}
    >
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} h-[34px] cursor-pointer`}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/**
 * Two or three values. A radiogroup: arrow keys move the selection.
 *
 * @param {{ label: string; value: string; onChange: (v: string) => void; disabled?: boolean;
 *   options: { value: string; label: string; icon?: import('react').ComponentType<any> }[] }} props
 */
export function Segmented({ label, value, onChange, options, disabled }) {
  const refs = useRef([]);
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className="flex w-full rounded-lg border border-border bg-muted p-0.5"
      onKeyDown={onKeyDown}
    >
      {options.map((option, i) => {
        const on = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            ref={(node) => (refs.current[i] = node)}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-1.5 py-1 text-[12.5px] transition-colors disabled:cursor-not-allowed ${focusRing} ${
              on
                ? 'bg-card font-semibold text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {Icon && (
              <Icon
                className="size-[13px]"
                aria-hidden
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Toggle buttons for longer lists. Single choice by default; `multiple` keeps the
 * order of pressing, which some APIs use (action buttons).
 */
export function ChipSet({ label, value, onChange, options, multiple = false, mono = false }) {
  const isOn = (v) => (multiple ? value.includes(v) : value === v);
  const toggle = (v) => {
    if (!multiple) return onChange(v);
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };
  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap gap-1.5"
    >
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isOn(option.value)}
            onClick={() => toggle(option.value)}
            className={`inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-[7px] border border-border bg-card px-2.5 text-[12.5px] font-medium text-foreground ${mono ? 'font-mono' : ''} ${focusRing} aria-pressed:border-primary aria-pressed:bg-primary/5 aria-pressed:ring-1 aria-pressed:ring-primary`}
          >
            {Icon && (
              <Icon
                className="size-[13px]"
                aria-hidden
              />
            )}
            {option.label}
            {option.hint && (
              <small className="font-mono text-[11px] font-normal text-muted-foreground">
                {option.hint}
              </small>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Boolean option: label, SDK property in mono, a switch on the right. */
export function Switch({ label, prop, checked, onChange, disabled, help, helpTone }) {
  const id = useId();
  const helpId = useId();
  return (
    <div className={disabled ? 'opacity-55' : undefined}>
      <div className="flex items-center justify-between gap-2.5 py-0.5 text-[13.5px]">
        <label
          htmlFor={id}
          className="flex min-w-0 cursor-pointer flex-col"
        >
          <span>{label}</span>
          {prop && <small className="font-mono text-[11.5px] text-muted-foreground">{prop}</small>}
        </label>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-describedby={help ? helpId : undefined}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors disabled:cursor-not-allowed ${focusRing} ${
            checked ? 'bg-primary' : 'bg-input dark:bg-muted-foreground/40'
          }`}
        >
          <span
            className={`pointer-events-none block size-4 rounded-full bg-background shadow transition-transform ${
              checked ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
      {help && (
        <p
          id={helpId}
          className={`mt-1 text-xs ${helpTone === 'warning' ? 'text-warning dark:text-amber-400' : 'text-muted-foreground'}`}
        >
          {help}
        </p>
      )}
    </div>
  );
}
