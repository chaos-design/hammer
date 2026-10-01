// Adapted from https://github.com/JedWatson/classnames (MIT).
const hasOwn = Object.prototype.hasOwnProperty;

/**
 * Build a class names joiner.
 *
 * @param prefix Optional prefix prepended to every collected class name.
 *               Classes already starting with the prefix are left untouched,
 *               so nesting joiners is idempotent.
 */
function withPrefix(name = '') {
  return (...args: unknown[]): string => {
    const classes: string[] = [];

    for (const arg of args) {
      if (typeof arg === 'string' || typeof arg === 'number') {
        // `0` is a valid class name; `NaN` is not.
        if (arg === '' || (typeof arg === 'number' && Number.isNaN(arg))) {
          continue;
        }

        classes.push(String(arg));
        continue;
      }

      if (Array.isArray(arg)) {
        if (arg.length) {
          const inner = withPrefix(name)(...arg);
          if (inner) classes.push(inner);
        }
      } else if (arg !== null && typeof arg === 'object') {
        if (arg.toString !== Object.prototype.toString) {
          // Custom `toString`, e.g. a class instance.
          classes.push(arg.toString());
        } else {
          for (const key in arg) {
            if (
              hasOwn.call(arg, key) &&
              (arg as Record<string, unknown>)[key]
            ) {
              classes.push(key);
            }
          }
        }
      }
    }

    return classes
      .map((c) => (name && !c.startsWith(name) ? `${name}${c}` : c))
      .join(' ');
  };
}

/**
 * Conditionally join class names.
 *
 * Accepts strings, numbers, arrays, and objects whose truthy keys are used as
 * class names. `false`, `null`, `undefined` and `''` are skipped; `0` is kept
 * because it is a valid class name.
 */
export function classnames(...args: unknown[]): string {
  return withPrefix()(...args);
}

export { withPrefix as prefix };

export default classnames;
