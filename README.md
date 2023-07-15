# @chaos-design/hammer

## eslint-config

### Usage

#### Install

```bash
pnpm add -D eslint @chaos-design/eslint-config-chaos
```

#### Config `.eslintrc`

```json
{
  "extends": "@chaos-design/eslint-config-chaos"
}
```

> You don't need `.eslintignore` normally as it has been provided by the preset.

#### Add script for package.json

For example:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

## tsconfig

### Usage

#### Install

```bash
pnpm add -D typescript @chaos-design/chaos-tsconfig
```

#### Config `.tsconfig`

```json
{
  "extends": "@chaos-design/chaos-tsconfig"
}
```

## License

[MIT](./LICENSE) License &copy; 2023-PRESENT [chaos-design](https://github.com/chaos-design)
