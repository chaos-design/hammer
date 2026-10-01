# @chaos-design/utils-pkg

把变更文件映射到拥有它们的 workspace 包。用于判断一次提交影响了哪些包，
从而只构建、发版或发布这些包。

[English](./README.md)

## 安装

```bash
npm install @chaos-design/utils-pkg
```

## 用法

```ts
import { getChangedPackages } from '@chaos-design/utils-pkg';

// 上一个提交中变更到的包。
const packages = getChangedPackages();
// -> [{ name: '@chaos-design/calendar', version: '0.0.3', path: 'packages/…/package.json' }]
```

每个包只出现一次，顺序为其首次被遇到的顺序。

### 按路径过滤

`getChangedPackages` 与 `checkFiles` 都接受一组用于跳过的匹配模式。

```ts
getChangedPackages('HEAD^1', ['**/*.md', 'docs/.*']);
```

### 不依赖 git 使用

`checkFiles` 对给定的文件列表做映射，因此在任何地方都能工作——不需要仓库环境。

```ts
import { checkFiles, getPackageInfo } from '@chaos-design/utils-pkg';

checkFiles(['packages/utils/pkg/src/index.ts']);
// -> [{ name: '@chaos-design/utils-pkg', … }]

getPackageInfo('packages/utils/pkg/src/index.ts');
// -> { name: '@chaos-design/utils-pkg', version: '0.1.0', path: '…/package.json' }
```

`getPackageInfo` 会从文件所在目录逐级向上查找最近的 `package.json`，因此
`packages/a/src/x.ts` 能正确解析到 `packages/a/package.json`。

当文件不存在、找不到归属的 `package.json`、或 manifest 缺少 `name` / `version` 时，
它返回 `null`。

`getChangedFiles` 读取 `git diff <commitId> --name-only`，在仓库之外或 commit
不存在时解析为 `[]`。

### 去重

```ts
import { uniqueChangedPackages } from '@chaos-design/utils-pkg';

uniqueChangedPackages([
  { name: 'a', version: '1.0.0', path: '/a/package.json' },
  { name: 'a', version: '2.0.0', path: '/a/package.json' },
]);
// -> [{ name: 'a', version: '1.0.0', … }]
```

## API

| 导出                                    | 说明                                     |
| --------------------------------------- | ---------------------------------------- |
| `getChangedPackages(commitId?, ignorePath?)` | 某个提交涉及的包，已去重。             |
| `getChangedFiles(commitId?, cwd?)`      | 某个提交变更的文件。                     |
| `checkFiles(files, ignorePath?)`        | 把给定的文件列表映射到包。               |
| `getPackageInfo(file)`                  | 拥有该文件的包。                         |
| `uniqueChangedPackages(packages)`       | 按包名保留首次出现的项。                 |
| `PackageInfo`                           | `{ name, version, path }`                |

## License

[MIT](../../../LICENSE)