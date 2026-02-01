"use strict";

// src/index.ts
var fi = (initialState, methods) => {
  const proxy = new Proxy(initialState, {
    get(target, prop, receiver) {
      if (prop in methods) {
        return (...args) => {
          try {
            const result2 = methods[prop](target, ...args);
            if (result2 === void 0) {
              console.warn(
                `Method ${String(prop)} returned undefined, chain interrupted.`
              );
              return void 0;
            }
          } catch (error) {
            console.error(`Error occurred in method ${String(prop)}:`, error);
            return void 0;
          }
          return receiver;
        };
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  return proxy;
};
var chainable = fi(
  { value: 0 },
  // @ts-expect-error
  { add, subtract, multiply, divide, testInterrupt }
);
var result = chainable.add(10).subtract(5).multiply(4).testInterrupt(100)?.add(10);
if (result) {
  console.log(result.value);
} else {
  console.log("\u94FE\u5F0F\u8C03\u7528\u88AB\u4E2D\u65AD");
}
