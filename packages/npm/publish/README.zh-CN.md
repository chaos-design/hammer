# @chaos-design/publish

用一次 `pnpm publish` 调用发布多个 workspace 包，并按依赖顺序排列，确保被依赖者
先进入 registry。

[English](./README.md)

## 安装

```bash
npm install -g @chaos-design/publish
```

## CLI

会安装两个可执行文件：`batch-publish` 及其短别名 `cbp`。

```bash
# 发布当前目录的包及其 workspace 依赖
cbp

# 发布指定包（可重复）
cbp --filter @chaos-design/calendar --filter @chaos-design/color-picker

# 只打印将要执行的命令，不实际发布
cbp --dry-run

# `--` 之后的内容原样透传给 pnpm publish
cbp --filter @chaos-design/task -- --access public
```

| 选项                    | 说明                                             |
| ----------------------- | ------------------------------------------------ |
| `-f, --filter <pkg>`    | 要发布的包，可重复。默认为当前包。               |
| `--cwd <dir>`           | 从 `dir` 解析工作区。默认为当前目录。            |
| `--dry-run`             | 打印解析出的命令但不发布。                       |
| `--force`               | 即使没有包匹配过滤条件也继续发布。               |
| `--all-deps`            | 同时把 `devDependencies` 视为发布阻塞项。        |
| `--quiet`               | 不打印解析出的包与命令。                         |
| `--tail-command <s>`    | 向 `pnpm publish` 追加参数，可重复。             |

### 退出码

成功为 `0`；当过滤条件没有匹配到任何包（除非指定 `--force`），或找不到工作区配置时为 `1`。

## API

```ts
import { pnpmPublish, resolvePublishPackages } from '@chaos-design/publish';

// 打印将要执行的命令，但不实际发布。
await pnpmPublish({ filter: ['@chaos-design/calendar'], dryRun: true });

// 只解析发布顺序。
const order = await resolvePublishPackages(['@chaos-design/calendar'], {
  cwd: process.cwd(),
  ignore: ['**/node_modules/**'],
  onlyDependencies: true,
});
// -> ['@chaos-design/shadcn-kits', '@chaos-design/color-picker', …]
```

两个函数都通过从 `cwd` 向上查找来定位工作区根目录，因此可在任意子目录中调用。

参数以数组形式通过 `execFileSync` 传给 `pnpm`，**不会**被拼接进 shell 命令字符串。

## 排序规则

`resolvePublishPackages` 读取 `pnpm-workspace.yaml`、发现各项目，然后从每个被选中
的包出发遍历 `ProjectsGraph`。依赖会排在依赖它的包之前加入结果，且每个包只出现一次。
存在环路时是安全的：已经在当前遍历路径上的包会被跳过。

默认情况下只有 `dependencies` 和 `peerDependencies` 视为阻塞项。传入
`--all-deps`（`onlyDependencies: false`）可把 `devDependencies` 也纳入考虑。

## License

[MIT](../../../LICENSE)