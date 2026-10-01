# @chaos-design/classnames

[简体中文](./README.zh-CN.md)

A simple utility for conditionally joining `className` values, with optional
prefixing.

## Installation

```bash
npm install @chaos-design/classnames
```

## Usage

```ts
import classnames from '@chaos-design/classnames';

classnames('btn', isPrimary && 'btn-primary', { 'btn-lg': isLarge });
// -> 'btn btn-primary btn-lg'
```

`false`, `null`, `undefined` and `''` are skipped. `0` **is** kept, since it is a
valid class name; `NaN` is dropped.

Accepted argument shapes:

| Shape                             | Handling                             |
| --------------------------------- | ------------------------------------ |
| `string` / `number`               | Used as a class name.                |
| `Array`                           | Flattened recursively.               |
| `Object`                          | Truthy keys are used as class names. |
| Object with a custom `toString`   | `toString()` result is used.         |

### Prefix

`prefix(name)` returns a joiner that prepends `name` to every class name. Classes
already starting with the prefix are left as-is, so the helper is idempotent.

```ts
import { prefix } from '@chaos-design/classnames';

const tw = prefix('tw-');

tw('flex', 'gap-2', ['items-center']);   // -> 'tw-flex tw-gap-2 tw-items-center'
tw('tw-flex', 'gap-2');                  // -> 'tw-flex tw-gap-2'
```

The check is a `startsWith` test, not `includes`: `prefix('p-')('px-2')` returns
`p-px-2`, because `px-2` does not start with `p-`.

## API

| Export                 | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `classnames(...args)`  | Default export. Conditionally joins class names.          |
| `prefix(name)`         | Returns a joiner that prefixes every class name.          |

## License

[MIT](../../LICENSE)