# eslint-config-chaos

## 使用

### 安装

```sh
pnpm install --save-dev eslint-config-chaos

# or
npm install --save-dev eslint-config-chaos

# or
yarn install --save-dev eslint-config-chaos
```

### 配置

```js
const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
  extends: ['chaos'],
  rules: {},
});
```
