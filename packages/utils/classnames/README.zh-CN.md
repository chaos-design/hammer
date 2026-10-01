# @chaos-design/classnames

用于条件拼接 `className` 的小型工具，支持可选前缀。

[English](./README.md)

## 安装

```bash
npm install @chaos-design/classnames
```

## 用法

```ts
import classnames from '@chaos-design/classnames';

classnames('btn', isPrimary && 'btn-primary', { 'btn-lg': isLarge });
// -> 'btn btn-primary btn-lg'
```

`false`、`null`、`undefined` 和 `''` 会被跳过。`0` **会**被保留，因为它是合法的
类名；`NaN` 会被丢弃。

支持的参数形态：

| 形态                        | 处理方式                             |
| --------------------------- | ------------------------------------ |
| `string` / `number`         | 直接作为类名                         |
| `Array`                     | 递归展开                             |
| `Object`                    | 取值为真的键作为类名                 |
| 自定义 `toString` 的对象    | 使用 `toString()` 的结果             |

### 前缀

`prefix(name)` 返回一个会给每个类名加上 `name` 前缀的拼接函数。已经以该前缀开头的
类名会保持不变，因此这个函数是幂等的。

```ts
import { prefix } from '@chaos-design/classnames';

const tw = prefix('tw-');

tw('flex', 'gap-2', ['items-center']);   // -> 'tw-flex tw-gap-2 tw-items-center'
tw('tw-flex', 'gap-2');                  // -> 'tw-flex tw-gap-2'
```

判断使用的是 `startsWith` 而非 `includes`：`prefix('p-')('px-2')` 的结果是
`p-px-2`，因为 `px-2` 并不以 `p-` 开头。

## API

| 导出                  | 说明                                     |
| --------------------- | ---------------------------------------- |
| `classnames(...args)` | 默认导出，条件拼接类名。                 |
| `prefix(name)`        | 返回一个会给每个类名加前缀的拼接函数。   |

## License

[MIT](../../LICENSE)