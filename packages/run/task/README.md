# @chaos-design/task

[简体中文](./README.zh-CN.md)

A tiny fluent interface for running a task: chain named steps together, read and
write the state as you go, and interrupt the chain when a step fails.

## Installation

```bash
npm install @chaos-design/task
```

## Usage

```ts
import { createTask } from '@chaos-design/task';

const counter = createTask({ value: 0 }, {
  add: (state, n: number) => ({ value: state.value + n }),
  double: (state) => ({ value: state.value * 2 }),
  /** Return `undefined` to interrupt the chain. */
  assertPositive: (state) => (state.value > 0 ? undefined : state),
});

counter.add(10)?.double();

counter.value; // 20
```

The task exposes its state directly, and every step returns the chain so calls
can be strung together.

### Interrupting a chain

A step that returns `undefined` interrupts the chain: that call resolves to
`undefined` and every later call becomes a no-op. Use `?.` for the steps that
depend on an earlier one succeeding.

```ts
const chain = counter.assertPositive()?.double();

chain;         // undefined
counter.value; // unchanged
```

`counter.interrupted` reports whether the chain has been interrupted.

```ts
counter.assertPositive()?.double();

counter.interrupted; // true
```

## API

| Export                             | Description                                          |
| ---------------------------------- | ---------------------------------------------------- |
| `createTask(initialState, methods)` | Build a chainable task.                              |
| `task.interrupted`                 | `true` once a step has interrupted the chain.        |
| `TaskMethod`, `TaskMethods`, `Task` | Types used to describe a task.                       |

Step names shadow state keys of the same name: if both exist, reading
`task.name` invokes the step. Keep state and step names disjoint.

## License

[MIT](../../LICENSE)