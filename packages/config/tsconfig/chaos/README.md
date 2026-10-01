# @chaos-design/tsconfig

[简体中文](./README.zh-CN.md)

A base TypeScript configuration shared across the
[hammer](https://github.com/chaos-design/hammer) packages.

## Installation

```bash
pnpm add -D @chaos-design/tsconfig
# or
npm install -D @chaos-design/tsconfig
```

## Usage

### Base config

```jsonc
// tsconfig.json
{
  "extends": "@chaos-design/tsconfig"
}
```

### React preset

```jsonc
// tsconfig.json
{
  "extends": "@chaos-design/tsconfig/react.json"
}
```

## What the base config sets

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],

    // Bundler mode
    "module": "ESNext",
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,

    // Correctness
    "skipLibCheck": true,
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "preserveWatchOutput": true
  }
}
```

The React preset extends the base and adds:

```jsonc
{
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx"
  }
}
```

## Design notes

The base config deliberately leaves `noEmit`, `declaration` and `allowImportingTsExtensions`
unset, and does not enable `noUnusedLocals` / `noUnusedParameters`.

- **`noEmit` is not set** because a shared base that forces it breaks any consumer that needs to
  emit. Set it in your own config when you only typecheck.
- **`allowImportingTsExtensions` is not set** because it requires `noEmit` or `emitDeclarationOnly`,
  which would constrain the base. Enable it per project if you want `.ts` import specifiers.
- **Unused-code checks are off** because they belong to the linter, not the compiler, and they
  break legitimate code such as functions with intentionally unused parameters. Biome covers this
  in this repository.

Library packages typically add:

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