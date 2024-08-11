type Method<S> = (
  state: S,
  n: number,
  carryFunction?: Function,
) => S | undefined;

type Methods<S> = Record<string, Method<S>>;

type Chainable<S, T extends Methods<S>> = S & {
  [K in keyof T]: (n: number) => Chainable<S, T> | undefined;
};

const fi = <S, T extends Methods<S>>(
  initialState: S,
  methods: T,
): Chainable<S, T> => {
  const proxy: any = new Proxy(initialState as any, {
    get(target, prop, receiver) {
      if (prop in methods) {
        return (...args: any[]) => {
          try {
            // @ts-ignore
            const result = methods[prop as keyof T](target, ...args);

            if (result === undefined) {
              console.warn(
                `Method ${String(prop)} returned undefined, chain interrupted.`,
              );
              return undefined;
            }
          } catch (error) {
            console.error(`Error occurred in method ${String(prop)}:`, error);
            return undefined;
          }
          return receiver;
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });

  return proxy as Chainable<S, T>;
};

interface ValueState {
  value: number;
}

const chainable = fi<ValueState, Methods<ValueState>>(
  { value: 0 },
  // @ts-ignore
  { add, subtract, multiply, divide, testInterrupt },
);

// @ts-ignore
const result = chainable
  .add(10)
  .subtract(5)
  .multiply(4)
  .testInterrupt(100)
  ?.add(10);

if (result) {
  console.log(result.value);
} else {
  console.log('链式调用被中断');
}
