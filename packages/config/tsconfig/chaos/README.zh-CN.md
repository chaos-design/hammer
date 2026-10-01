# @chaos-design/tsconfig

[English](./README.md)

共享的 TypeScript 基础配置。

## 安装

```bash
pnpm add -D @chaos-design/tsconfig
# 或
npm install -D @chaos-design/tsconfig
```

## 使用

### 基础配置

```jsonc
// tsconfig.json
{
  "extends": "@chaos-design/tsconfig"
}
```

### React 预设

```jsonc
// tsconfig.json
{
  "extends": "@chaos-design/tsconfig/react.json"
}
```

## 基础配置包含的选项

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],

    // Bundler 模式
    "module": "ESNext",
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,

    // 正确性
    "skipLibCheck": true,
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "preserveWatchOutput": true
  }
}
```

React 预设在此基础上追加：

```jsonc
{
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx"
  }
}
```

## 设计说明

基础配置刻意不设置 `noEmit`、`declaration` 与 `allowImportingTsExtensions`，
也不开启 `noUnusedLocals` / `noUnusedParameters`。

- **不设置 `noEmit`**：共享基础配置若强制 `noEmit`，会破坏所有需要产出编译结果的包。
  只做类型检查时请在自己的配置中开启。
- **不设置 `allowImportingTsExtensions`**：该选项要求同时设置 `noEmit` 或 `emitDeclarationOnly`，
  会反过来限制基础配置。需要 `.ts` 后缀导入语法时按项目开启。
- **关闭未使用代码检查**：这属于 lint 范畴而非编译范畴，且会误伤
  「故意保留未使用参数」这类合法写法。本仓库由 Biome 负责这类检查。

类库包通常需要额外追加：

```jsonc
{
  "extends": "@chaos-design/tsconfig",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist/types",
    "declaration": true,
    "emitDeclarationOnly": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

## License

[MIT](../../../LICENSE)