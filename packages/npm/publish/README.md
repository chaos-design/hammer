# monorepo 批量发布

## 背景

在 monorepo 项目中，我们通常会有多个包，这些包之间可能会有依赖关系。当我们需要发布这些包时，如果手动发布，那么就需要逐个发布，非常繁琐。因此，我们需要一个工具来帮助我们批量发布这些包。

## 功能

该工具的主要功能是批量发布 monorepo 项目中的多个包。它支持以下功能：

1. 批量发布多个包
2. 支持发布指定的包
3. 支持发布指定的版本
4. 支持发布指定的 tag
5. 支持发布指定的分支

## 使用方法

### 安装依赖

```bash
npm install -g @chaos-design/publish
```

### 发布

```bash
# Full Command
batch-publish --filter="@chaos-design/eslint-config-react"  -- --no-git-check

# Short Command
cbp --filter="@chaos-design/eslint-config-react"  -- --no-git-check
```

#### Command参数

执行命令中的`-- --no-git-check`(即argv._) 的参数详见 [`pnpm publish`](https://pnpm.io/cli/publish)

`onlyDependencies`: 只分析`['dependencies']`，默认分析: `['dependencies', 'peerDependencies']`
