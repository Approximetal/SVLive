import cx from '@src/cx.mjs';

export function Textbox({ onChange, className, ...inputProps }) {
  return (
    <input
      className={cx(
        'p-2 bg-background rounded-md border border-foreground/20 text-foreground placeholder-foreground/40',
        className,
      )}
      onChange={(e) => onChange(e.target.value)}
      {...inputProps}
    />
  );
}
