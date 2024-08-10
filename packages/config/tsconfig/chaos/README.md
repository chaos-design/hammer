# @chaos-design/tsconfig

A base TSConfig for working.

## 使用

### 安装

```sh
pnpm install --save-dev @chaos-design/tsconfig

# or
npm install --save-dev @chaos-design/tsconfig

# or
yarn add --dev @chaos-design/tsconfig
```

### tsconfig.json 配置

```json
{
  "extends": "@chaos-design/tsconfig"
}
```

---

`tsconfig.json`:

```jsonc
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "chaos",
  "_version": "0.0.20",

  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

You can find the [code here](https://github.com/chaos-design/hammer/blob/main/packages/config/tsconfig/chaos/tsconfig.json).
