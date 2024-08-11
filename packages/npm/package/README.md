# @chaos-design/package

Find the tor packages config from the cwd path of package.

## 使用

### 安装

```sh
pnpm install --save-dev @chaos-design/package

# or
npm install --save-dev @chaos-design/package

# or
yarn add --dev @chaos-design/package
```

### 用法

```ts
import {
  findLernaConfig,
  findPackageRootConfig,
  findPnpmConfig,
} from '@chaos-design/package';

// {
//     fileName: 'xxxx',
//     root: 'xxxx',
//     baseName: 'pnpm-workspace.yaml',
//     packages: [
//         'packages/*',
//         'packages/config/*',
//     ],
// }
const { fileName, root, baseName, packages } = await findPackageRootConfig(process.cwd(), {
  name: 'pnpm-workspace.yaml',
  handlePackagesInfo: async (data) => {
    const { fileName, baseName, root } = data || {};

    return {
      packages: ((await readYamlFile(fileName)) as any).packages,
      fileName,
      baseName,
      root,
    };
  },
});

// {
//     fileName: 'xxxx',
//     root: 'xxxx',
//     baseName: 'pnpm-workspace.yaml',
//     packages: [
//         'packages/*',
//         'packages/config/*',
//     ],
// }
const { fileName, root, baseName, packages } = await findPnpmConfig(
  process.cwd(),
  {
    name: 'pnpm-workspace.yaml',
    handlePackagesInfo: async (data) => {
      const { fileName, baseName, root } = data || {};

      return {
        packages: ((await readYamlFile(fileName)) as any).packages,
        fileName,
        baseName,
        root,
      };
    },
  },
);
// {
//     fileName: 'xxxx',
//     root: 'xxxx',
//     baseName: 'lerna.json',
//     packages: [
//         'packages/*',
//         'packages/config/*',
//     ],
// }
const { fileName, root, baseName, packages } = await findLernaConfig(process.cwd(), {
  name: 'pnpm-workspace.yaml',
  handlePackagesInfo: async (data) => {
    const { fileName, baseName, root } = data || {};

    return {
      packages: ((await readYamlFile(fileName)) as any).packages,
      fileName,
      baseName,
      root,
    };
  },
});
```
