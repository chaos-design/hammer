# @chaos-design/task

链式执行任务的流式接口：把具名的步骤串起来，在过程中读写状态，并在某一步失败时
中断整条链。

[English](./README.md)

## 安装

```bash
npm install @chaos-design/task
```

## 用法

```ts
import { createTask } from '@chaos-design/task';

const counter = createTask({ value: 0 }, {
  add: (state, n: number) => ({ value: state.value + n }),
  double: (state) => ({ value: state.value * 2 }),
  /** 返回 `undefined` 即可中断整条链。 */
  assertPositive: (state) => (state.value > 0 ? undefined : state),
});

counter.add(10)?.double();

counter.value; // 20
```

任务对象直接暴露自身状态，每一步都返回链本身，因此调用可以串联。

### 中断一条链

返回 `undefined` 的步骤会中断整条链：该次调用解析为 `undefined`，之后所有调用
都变成空操作。对于依赖前序步骤成功的后续步骤，请使用 `?.`。

```ts
const chain = counter.assertPositive()?.double();

chain;         // undefined
counter.value; // 保持不变
```

`counter.interrupted` 用于查询链路是否已被中断。

```ts
counter.assertPositive()?.double();

counter.interrupted; // true
```

## API

| 导出                              | 说明                             |
| --------------------------------- | -------------------------------- |
| `createTask(initialState, methods)` | 创建一个可链式调用的任务。       |
| `task.interrupted`                | 一旦有步骤中断即为 `true`。      |
| `TaskMethod`、`TaskMethods`、`Task` | 用于描述任务的类型。             |

**注意**：步骤名会遮蔽同名的状态字段——若两者同名，`task.name` 读到的是步骤。
请避免状态字段与步骤重名。

## License

[MIT](../../LICENSE)