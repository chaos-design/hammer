/**
 * A tiny fluent interface for running a task.
 *
 * A task is an object holding state plus a set of named steps. Calling a step
 * applies it to the state and returns the chain, so calls can be strung
 * together. A step returning `undefined` interrupts the chain: that call
 * resolves to `undefined` and every later call becomes a no-op, so `?.` can be
 * used for steps that depend on an earlier one succeeding.
 */

/** A single task step. Return the new state, or `undefined` to interrupt. */
export type TaskMethod<S, A extends unknown[] = []> = (
  state: S,
  ...args: A
) => S | undefined;

/** The set of named steps that make up a task. */
export type TaskMethods<S> = Record<
  string,
  (...args: never[]) => S | undefined
>;

type ArgsOf<M> = M extends (state: never, ...args: infer A) => unknown
  ? A
  : never;

/**
 * The chainable task: state is readable directly, and every step is callable
 * and returns the chain — or `undefined` once the chain is interrupted.
 */
export type Task<S, M extends TaskMethods<S>> = S & {
  /** `true` once a step has interrupted the chain. */
  readonly interrupted: boolean;
} & {
  [K in keyof M & string]: (...args: ArgsOf<M[K]>) => Task<S, M> | undefined;
};

/** Replace `target`'s own keys with those of `next`. */
const syncState = <S>(target: Record<string, unknown>, next: S): void => {
  for (const key of Object.keys(target)) {
    if (!(key in (next as object))) delete target[key];
  }

  Object.assign(target, next);
};

/**
 * Build a chainable task.
 *
 * Step names shadow state keys: if both exist, reading and calling `task.name`
 * invokes the step. Keep state and step names disjoint.
 *
 * ```ts
 * const counter = createTask({ value: 0 }, {
 *   add: (state, n) => ({ value: state.value + n }),
 *   double: (state) => ({ value: state.value * 2 }),
 *   // Interrupt unless the value is above 100.
 *   assertBigEnough: (state) => (state.value > 100 ? undefined : state),
 * });
 *
 * counter.add(10)?.double();
 * counter.value; // 20
 * ```
 */
export function createTask<S extends object, M extends TaskMethods<S>>(
  initialState: S,
  methods: M,
): Task<S, M> {
  let interrupted = false;

  const target = { ...initialState } as Record<string, unknown>;

  const chain = new Proxy(target, {
    get(state, prop, receiver) {
      if (prop === 'interrupted') return interrupted;

      const method = methods[prop as string] as
        | ((...args: unknown[]) => S | undefined)
        | undefined;

      if (!method) return Reflect.get(state, prop, receiver);

      return (...args: unknown[]) => {
        // Once interrupted the chain is dead: stay dead.
        if (interrupted) return undefined;

        const next = method(state as S, ...args);

        if (next === undefined) {
          interrupted = true;

          return undefined;
        }

        syncState(state, next);

        return receiver;
      };
    },
  }) as Task<S, M>;

  return chain;
}

export default createTask;
