<div align="center">

![@chaos-design/hammer](./assets/banner.png)

# @chaos-design/hammer

**[English](./README.md)**

</div>

一个 pnpm monorepo，承载 [chaos-design](https://github.com/chaos-design) 使用的工具链与 UI 组件包 —— 铁锤锻造，专为 monorepo 而生。

## 文档

**<https://hammer.chaosmic.cn>**

## 包列表

完整列表（含版本号）见 [packages.md](./packages.md)。

| 包                                                                                | 说明                                     |
| --------------------------------------------------------------------------------- | ---------------------------------------- |
| [`@chaos-design/babel-plugin-jsx-source-location`](./packages/babel-plugin/jsx-source-location) | 为 JSX 元素添加源码位置信息的 Babel 插件 |
| [`@chaos-design/tsconfig`](./packages/config/tsconfig/chaos)                        | 共享的 TypeScript 基础配置              |
| [`@chaos-design/package`](./packages/npm/package)                                   | 工作区发现与依赖图                      |
| [`@chaos-design/publish`](./packages/npm/publish)                                   | 批量发布工作区包                        |
| [`@chaos-design/task`](./packages/run/task)                                         | 链式执行任务的流式接口                  |
| [`@chaos-design/classnames`](./packages/utils/classnames)                           | 条件拼接 classNames，支持前缀           |
| [`@chaos-design/utils-pkg`](./packages/utils/pkg)                                   | 把变更文件映射到其所属的包              |
| [`@chaos-design/calendar`](./packages/shadcn-ui/calendar)                           | 日程组件                                |
| [`@chaos-design/color-picker`](./packages/shadcn-ui/color-picker)                   | 支持 HEX / RGB / HSB 的颜色选择器       |
| [`@chaos-design/month-datepicker`](./packages/shadcn-ui/month-datepicker)           | 月份与年份选择器                        |
| [`@chaos-design/shadcn-kits`](./packages/shadcn-ui/shadcn-kits)                    | shadcn/ui 公共工具                      |

## 目录结构

```text
apps/docs/            # Next.js 文档站（私有）
packages/
  babel-plugin/       # Babel 插件
  config/tsconfig/    # 共享 tsconfig 预设
  npm/                # @chaos-design/package、@chaos-design/publish
  run/                # @chaos-design/task
  shadcn-ui/          # React 组件库
  utils/              # @chaos-design/classnames、@chaos-design/utils-pkg
scripts/              # 发布、代码规范与校验脚本
assets/               # 项目主图与 Logo
```

## 环境要求

- Node.js 20 及以上
- pnpm 9.15.9（通过 `packageManager` 字段锁定；仓库只安装 pnpm）

## 开发

```sh
pnpm install
pnpm dev            # 监听所有包
pnpm build          # 构建所有包
```

### 质量校验

| 命令                       | 作用                             |
| -------------------------- | -------------------------------- |
| `pnpm lint`                | 用 Biome 做 lint                 |
| `pnpm format`              | 用 Biome 格式化                  |
| `pnpm check`               | lint 并应用安全修复              |
| `pnpm typecheck`           | 对每个包执行 `tsc`               |
| `pnpm test`                | 对每个包执行 Vitest              |
| `pnpm verify-publishable`  | 校验每个包是否真的能被发布       |
| `pnpm verify-peers`        | 校验 peer 依赖契约               |
| `pnpm verify`              | 以上全部，按顺序执行             |

`pnpm verify-publishable` 会在以下情况失败：包名重复、`files` 漏掉入口文件、
`workspace:` 依赖没有可发布的版本号。

`pnpm verify-peers` 会拦截**幽灵依赖**——即那些仅因为 `node_modules` 被扁平化
（hoist）才碰巧能解析、但从未在 `package.json` 中声明的导入——以及把 `react`
错误声明为 dependency 而非 peerDependency 的情况。

### 代码规范

代码规范与格式化使用 [Biome](https://biomejs.dev/)。内置的 shadcn/ui 源码与
Tailwind at-rule 通过 `biome.json` 的 `overrides` 豁免，而不是去改动第三方代码。

## 发布

版本号来自 [changesets](https://changesets.dev)：`.changeset/` 下一个记录「哪些包
变了、变了多少」的 markdown 文件。每个包依据自己的 changeset 独立提升版本，因此
一次无关的改动不会把整个工作区一起顶上去。

```sh
pnpm changeset
```

把这个文件和代码改动一起提交，编写环节就结束了。此后发布自行运转：

1. 推送到 `main` 会打开（或更新）一个 **Version Packages** PR，其中包含版本提升
   以及每个包的 `CHANGELOG.md` 条目。
2. 合并该 PR 是整个发布流程中唯一的人工步骤。合并产生的推送会把新版本发布到 npm。

全程不依赖 tag；构建不绿也不可能发布：release 任务以 `verify` 成功为前提，且只在
`main` 上运行。

> **首次发布：** 在发布 `@chaos-design` 下的任何包之前，该 scope 必须先在 npm 上
> 存在，否则 registry 会以 `404` 拒绝上传。请先创建该 scope（或认领对应的组织）。

发布流程从仓库 secret 读取 `NPM_TOKEN`，且必须是 npm 的 **automation token**——只有
这类 token 会绕过双因素认证。其它任何 token 都会以
`EOTP: This operation requires a one-time password` 被拒绝，而 CI 无法应答一次性密码。
若 token 完全没配置，则会更早在「Check registry credentials」这一步被拦下。也可以
改用 npm 的 [trusted publishing] 完全去掉 token：在 npmjs.com 上为各包配置 trusted
publisher 即可，任务本身已经持有所需的 `id-token` 权限。

[trusted publishing]: https://docs.npmjs.com/trusted-publishers

若需在不提升版本号的情况下重新发布（例如某个包的 `prepublishOnly` 需要重跑）：

```sh
# 发布全部，跳过 registry 上已存在的版本
pnpm run publish-pkg

# 只发布某个包（会按依赖顺序自动带上其工作区依赖）
pnpm run publish-pkg @chaos-design/calendar

# 只演示会发生什么，不实际发布
node scripts/publish-ci.mjs --dry-run
```

`scripts/publish-ci.mjs` 会做拓扑排序，保证依赖先于被依赖者发布；校验每个入口
文件确实存在；并跳过 registry 上已存在的版本——因此重跑一次是空操作，中断的发布
也可以直接重试。它还会把发布结果写入 `$CHANGESETS_OUTPUT`，`changesets/action` 正是
靠这个文件为每个包打上 `<pkg>@<version>` 形式的 tag 并创建对应的 GitHub Release；
缺少它，发布会成功却悄悄地产不出 tag 和 Release。

### 为什么发布顺序很重要

`workspace:*` 依赖会在发布时被改写为具体版本号。如果被依赖者的新版本尚未进入
registry，先发布它就会失败。这正是发布脚本采用拓扑排序、而非目录顺序的原因。

## 依赖解析

本工作区使用 pnpm 默认的**隔离** `node_modules`。此前配置的是
`node-linker=hoisted`（npm 式的扁平化），它会掩盖两类缺陷：

- **幽灵依赖**：未声明的导入依然能解析，导致包在发布后才崩溃。
- **未声明的类型引用**：`.d.ts` 可能引用并非直接依赖的包，给使用方带来
  `TS2742 … cannot be named without a reference to …` 错误。

这两类问题在本仓库中都真实存在过。`pnpm verify-peers` 现在会让 CI 在出现
任何一种时失败，因此该问题不会再次回归。

代价是：缺失的依赖现在会在安装阶段就硬报错，而不是等到运行时才暴露。
对于一个产物要发布到 npm 的 monorepo 来说，这正是期望的行为。

## CI

| Workflow                | 触发条件                          | 作用                                                |
| ----------------------- | --------------------------------- | --------------------------------------------------- |
| `ci.yml` → `verify`     | 推送到 `main`、任意 PR、手动      | lint、typecheck、test、build、各项校验               |
| `ci.yml` → `release`    | 推送到 `main` 且 `verify` 通过     | 打开版本 PR，或在其合并后执行发布                   |
| `deploy-docs.yml`       | 文档或 shadcn 包发生变化          | 构建并部署文档站到 GitHub Pages                     |

## License

[MIT](./LICENSE) © 2026-PRESENT [chaos-design](https://github.com/chaos-design)