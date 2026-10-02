import { useId } from 'react';
import { cn } from '../../utils/cn';

/** Label + control + hint/error wrapper. Children receive the generated id. */
function Field({ label, hint, error, className, children }) {
  const id = useId();
  return (
    <div className={cn('field', className)}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      {children(id)}
      {error ? <span className="field__error">{error}</span> : hint && <span className="field__hint">{hint}</span>}
    </div>
  );
}

export function TextField({ label, hint, error, className, ...inputProps }) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {(id) => <input id={id} className="input" aria-invalid={Boolean(error)} {...inputProps} />}
    </Field>
  );
}

export function TextArea({ label, hint, error, className, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {(id) => <textarea id={id} className="textarea" aria-invalid={Boolean(error)} {...props} />}
    </Field>
  );
}

export function SelectField({ label, hint, error, className, options, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {(id) => (
        <select id={id} className="select" {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function Toggle({ label, checked, onChange, ...rest }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} {...rest} />
      <span>{label}</span>
    </label>
  );
}
