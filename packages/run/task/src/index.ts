type Method<S> = (state: S, n: number, carryFunction?: Function) => S | undefined;

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
            const result = methods[prop as keyof T](target, ...args);
            if (result === undefined) {
              console.warn(
                `Method ${String(prop)} returned undefined, chain interrupted.`,
              );
              return undefined; // 返回 undefined 以中断链式调用
            }
          } catch (error) {
            console.error(`Error occurred in method ${String(prop)}:`, error);
            return undefined; // 发生错误时中断链式调用
          }
          return receiver; // 返回代理对象本身，支持链式调用
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });

  return proxy as Chainable<S, T>;
};

// 示例：状态对象包含一个数值
interface ValueState {
  value: number;
}

// 使用泛型创建链式调用对象实例
const chainable = fi<ValueState, Methods<ValueState>>(
  { value: 0 },
  { add, subtract, multiply, divide, testInterrupt },
);

// 使用链式调用执行一系列计算 (包含错误处理)
const result = chainable
  .add(10)
  .subtract(5)
  .multiply(4)
  .testInterrupt(100) // 这里会触发中断，后续操作不再执行
  ?.add(10);

if (result) {
  console.log(result.value); // 如果链式调用没有被中断，输出最终结果
} else {
  console.log('链式调用被中断');
}
