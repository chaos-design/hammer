# @chaos-design/utils-pkg

通过 git 检查变更包.

## 使用

```ts
import { getChangedPackages } from '@chaos-design/utils-pkg';

const changed = getChangedPackages();

console.log(changed);
// result
// [
//   {
//     name: '@chaos-design/hammer',
//     version: '0.0.19-beta.6',
//     path: 'package.json'
//   },
//   {
//     name: '@chaos-design/utils-pkg',
//     version: '0.0.19-beta.6',
//     path: 'packages/utils/pkg/package.json'
//   }
// ]
```
