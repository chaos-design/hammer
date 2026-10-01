# @chaos-design/package

从任意路径定位 monorepo 的 workspace 包、读取其根配置，并在包之间遍历
`workspace:` 依赖图。

由于项目通过
[`@pnpm/fs.find-packages`](https://www.npmjs.com/package/@pnpm/fs.find-packages)
发现、且根配置通过向上查找定位，因此它适用于任何目录结构。

[English](./README.md)

## 安装

```bash
npm install @chaos-design/package
```

## 用法

### 读取根配置

```ts
import { findPnpmConfig, findLernaConfig } from '@chaos-design/package';

const { packages, root, fileName, baseName } = await findPnpmConfig(process.cwd());
```

两个函数都解析出 `{ packages, fileName, baseName, root }`，其中 `packages` 是
workspace 的 glob 列表。

传入 `{ silent: true }` 可在找不到配置时得到 `undefined` 而不是抛出异常：

```ts
const config = await findPnpmConfig(cwd, { silent: true });
if (!config) return;
```

### 筛选项目

`getProjectDependencies` 解析出 `rootPath` 下的所有项目并加以筛选。每条规则按其
形态被解释：

| 规则形态 | 含义                             | 示例                  |
| -------- | -------------------------------- | --------------------- |
| `./x`    | 与项目目录做 glob 匹配            | `./publish`           |
| `{x}`    | 同 `./x`，为简写形式             | `{publish}`           |
| 其他     | 与 `package.json#name` 做 glob 匹配 | `@chaos-design/task` |

```ts
import { findPnpmConfig, getProjectDependencies } from '@chaos-design/package';

const { packages, root } = await findPnpmConfig(cwd);

const { selectedProjects, allProjects } = await getProjectDependencies(
  ['./publish'],
  { rootPath: root, patterns: packages },
);
```

glob 规则会作用于**相对 workspace 根目录**的路径，因此 `./publish` 能匹配到
`packages/npm/publish`，而不需要写出绝对路径。

当两种规则同时存在时，目录 glob 优先。不传任何规则时返回全部项目。

### 遍历依赖图

`ProjectsGraph` 会传递性地解析 `workspace:*` 依赖，并带环路保护。只有你列出的
依赖字段会被考虑，默认是 `dependencies`、`devDependencies` 和 `peerDependencies`。

```ts
import { ProjectsGraph } from '@chaos-design/package';

const graph = new ProjectsGraph({
  projects: allProjects,
  depFields: ['dependencies'],
});

graph.getWorkspaceDependencies('@chaos-design/calendar');
// -> ['@chaos-design/shadcn-kits', '@chaos-design/color-picker', …]

graph.getDependencies('@chaos-design/calendar');
// -> 同上，但已传递性展开
```

结果会被缓存，因此重复调用开销很低。传入未知的项目名会抛出
`<name> project is not found.`。

### 向上查找任意文件

`findPackageRoot` / `findPackageRootConfig` 是 `findPnpmConfig` 与
`findLernaConfig` 背后的通用构件。用它们从嵌套目录定位任意文件：

```ts
import { findPackageRoot } from '@chaos-design/package';

const found = await findPackageRoot(cwd, {
  name: ['pnpm-workspace.yaml', 'lerna.json'],
  silent: true,
});
// -> { fileName, baseName, root } | undefined
```

## API

| 导出                                    | 说明                                     |
| --------------------------------------- | ---------------------------------------- |
| `findPackages(dir, opts?)`             | 列出 `dir` 下的项目。                    |
| `getProjectDependencies(rules, opts)`  | 列出项目及筛选后的 `selectedProjects`。  |
| `ProjectsGraph`                        | 传递性解析 workspace 依赖。              |
| `isWorkspacePackageSpec(spec)`         | 判断是否为 `workspace:` 协议。           |
| `findPackageRoot(dir, opts)`           | 向上查找文件。                           |
| `findPackageRootConfig(dir, opts)`     | 向上查找，再由结果派生出额外数据。       |
| `findPnpmConfig(dir, opts?)`           | 读取 `pnpm-workspace.yaml`。             |
| `findLernaConfig(dir, opts?)`          | 读取 `lerna.json`。                      |
| `readJsonFile(path)`                   | 读取并解析 JSON 文件。                   |

## License

[MIT](../../../LICENSE)