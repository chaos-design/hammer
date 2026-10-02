## 0.1.0 2026-10-02

### Bug Fixes

* **publish:** `exports` pointed at a non-existent `dist/index.js`, so `require()` threw `MODULE_NOT_FOUND`; `bin.js` used `require()` inside a `"type": "module"` package, so `cbp` and `batch-publish` crashed on every run.
* **utils-pkg:** `exports` was inverted, mapping `require` to the ESM build and `import` to the CJS build.
* **package:** `readJsonFile` double-encoded its input, so `findLernaConfig` always resolved `packages` to `undefined`.
* **package:** glob filtering matched against absolute paths, making the `./dir` syntax dead; it now matches workspace-relative paths.
* **classnames:** `prefix()` used `includes` instead of `startsWith`, so `prefix('p-')('px-2')` dropped the prefix.
* **color-picker:** `hexToHsb` returned `NaN` for unparseable input, rendering `hsl(NaN, 100%, 50%)`.
* **babel-plugin-jsx-source-location:** `filename.replace(cwd, '')` was a substring operation that truncated any path containing `cwd` mid-string.
* **calendar:** the Chinese month header rendered a full date instead of year + month.
* **publish:** the workflow ran on every push to `main`, attempting a publish per commit. It is now gated on a `v*` tag or a manual dispatch.
* **docs:** GitHub Pages export set no `basePath`, so every asset and route was written to the site root and 404'd.
* **docs:** `installation.mdx` referenced undefined `FeatureCard` / `BodyText` components and shipped `pnpm add xxx` placeholders.
* **docs:** `preview` frontmatter was commented out for two components, so their cards fell back to the site logo.
* **docs:** the favicon, component screenshots and preview iframes were root-absolute paths, which `basePath` does not rewrite — all 404'd on GitHub Pages.
* **docs:** `--lines-page` referenced `lines-b.png` / `lines-w.png`, which were never committed, so the landing hero had no background.
* **docs:** `metadataBase` was hard-coded to `localhost`, so every `og:image` and share link pointed at `http://localhost:3460`.

### Features

* **task:** reimplemented as a documented fluent task runner; the previous source was a demo script referencing undefined identifiers.
* **verify-peers:** new check that fails on phantom dependencies and on React declared as a dependency instead of a peer.
* **verify-publishable:** new check for duplicate package names, `files` gaps and unversioned workspace dependencies.
* **publish-ci:** publishes in topological order, verifies entry points exist and skips versions already on the registry.
* **ci:** added a workflow that runs on pull requests.
* **docs:** serves from the custom domain `hammer.chaosmic.cn`, set through `SITE_URL`.
* Fixed three workflows whose `github.repository == '@chaos-design/hammer'` guard could never match.

### Performance

* Externalised `dependencies` / `peerDependencies` from the Vite library builds. Bundling React shipped a second copy to every consumer: calendar 383 KB → 120 KB, color-picker 209 KB → 25 KB, month-datepicker 118 KB → 8 KB.

### Breaking Changes

* **tsconfig:** the base config no longer sets `noEmit`, `allowImportingTsExtensions`, `noUnusedLocals` or `noUnusedParameters`. A shared base must not force `noEmit` on consumers, and unused-code checks belong to the linter.
* **toolchain:** pinned to `pnpm@10.28.1`. pnpm 12 cannot be installed on Vercel — its engine self-install fails with `the installed pnpm wrapper is missing` — and pnpm 12 renamed `onlyBuiltDependencies` to `allowBuilds`, which pnpm 10 ignores. pnpm 10 matches the `lockfileVersion: 9` already in the repository.
* **calendar, color-picker, month-datepicker:** dropped `node-linker=hoisted`, which had been masking phantom dependencies. Aligned four copies of `lucide-react` and two of `date-fns` to one each.

## 0.0.22 2026-05-30


### Bug Fixes

* deploy docs build ([cfd2a2a](https://github.com/chaos-design/hammer/commit/cfd2a2aab79d96e8045a73a06ea60d2b0a1a2afd))
* deploy docs build ([be6b6e2](https://github.com/chaos-design/hammer/commit/be6b6e252d71e562a80120f9f3742c6a57cd454d))
* deploy docs build ([30477a2](https://github.com/chaos-design/hammer/commit/30477a22ec83f33adff10381dfb7f989ade7951a))
* deploy docs build ([e83559a](https://github.com/chaos-design/hammer/commit/e83559a1890de3c2de331e8e3064fcfccefccec6))


### Features

* add app/docs; ([b93c7d3](https://github.com/chaos-design/hammer/commit/b93c7d392b3e721a12858606e772055847cea030))
* add shadcn-ui(calendar, month-detepicker, color-picker, kits); add app/docs; refactor build output; update actions config; build changelog ([9b6a6bd](https://github.com/chaos-design/hammer/commit/9b6a6bda1f0046b0376820104c232bf5ec418ad9))
* babel plugin, refactor ([b3f4109](https://github.com/chaos-design/hammer/commit/b3f41094d8a70240c707362442faf17d5fa6390f))
* classnames ([4ca5828](https://github.com/chaos-design/hammer/commit/4ca5828087b51e3310f2a17efb2ae6c91dfc837c))
* classnames ([4ecdb7c](https://github.com/chaos-design/hammer/commit/4ecdb7c5a75ad1ce24ebf5c760abf230a32a79ae))
* classnames ([0f6ccbb](https://github.com/chaos-design/hammer/commit/0f6ccbb0200a346935c9fbbba372d3a752ca1db1))
* classnames readme ([bb7ef3a](https://github.com/chaos-design/hammer/commit/bb7ef3a3d5cbd3a96b4ef569ade2eb9d873d8f1a))
* doc ([ea7fb25](https://github.com/chaos-design/hammer/commit/ea7fb259637b58b7e2754aa7c31fae0b9c01781c))
* doc ([2c6de4b](https://github.com/chaos-design/hammer/commit/2c6de4b2ed050a606aed07e4a1109443e29c2774))
* doc ([9ec881d](https://github.com/chaos-design/hammer/commit/9ec881d412df82bc2b3b9ee9317e622c3c69cb39))
* lastModified ([651fd67](https://github.com/chaos-design/hammer/commit/651fd67a215ce6aab9c2972fb1ad2a3ba4fed34f))
* lastModified utc-8 ([2000ef8](https://github.com/chaos-design/hammer/commit/2000ef89cd6bc5f41b98ee73315c27b37edd1de4))
* **publish:** babel-plugin ([fc7846d](https://github.com/chaos-design/hammer/commit/fc7846d52be7a8e934c7936d4b41839585fc6aca))
* **publish:** babel-plugin ([093feed](https://github.com/chaos-design/hammer/commit/093feeda6911fdc25637fccbcef8739d4809d936))
* **publish:** shadcn-ui ([b9465af](https://github.com/chaos-design/hammer/commit/b9465af48e1bd50b407057f53c14e8d43c837018))
* **publish:** shadcn-ui ([680a69a](https://github.com/chaos-design/hammer/commit/680a69a4cedf35aaa3bc8920720324805ae3e44c))
* **publish:** shadcn-ui ([6119eed](https://github.com/chaos-design/hammer/commit/6119eedf7d416cda93c79ee866a4bcc6241b32c5))
* **publish:** shadcn-ui; ([7096b99](https://github.com/chaos-design/hammer/commit/7096b9988e009d2c716186d8da418be94821ddc4))



## 0.0.24 2026-09-23


### Features

* classnames ([29725f6](https://github.com/chaos-design/hammer/commit/29725f6075b77eb9c9dfdb4e9b17e9fbe4e3618b))
* 去除包的private ([ee555ce](https://github.com/chaos-design/hammer/commit/ee555ce419f81e1e0af9e57ec793e6b9fdb81ba4))



## 0.0.23 2026-08-13


### Bug Fixes

* 发包问题 ([e9ebbc5](https://github.com/chaos-design/hammer/commit/e9ebbc53736ec46f914b40837a65df6d6bf9748f))
* 发包问题 ([b3734c9](https://github.com/chaos-design/hammer/commit/b3734c9380d4ef428f1bd6220fe2fa1a40130856))
* 发包问题 ([b65e685](https://github.com/chaos-design/hammer/commit/b65e6856a2201c04fc5218b76a898d9992774b89))


### Features

* tsconfig ([36318b0](https://github.com/chaos-design/hammer/commit/36318b0c56bcce263c06c919767bca08c6e3bda7))



## 0.0.22 2026-08-11


### Features

* 修复发包问题 ([7875a15](https://github.com/chaos-design/hammer/commit/7875a15f67c604f7368c590304b6da9cf13cd3e9))
* 修复发包问题 ([ef7a3fe](https://github.com/chaos-design/hammer/commit/ef7a3fee30f71e7a1ccf904e2fe13ee33ec8dc0a))
* 修复发包问题 ([3fa7bb1](https://github.com/chaos-design/hammer/commit/3fa7bb1b711f111d7b04a51bc83996ad0570e300))
* 修复发包问题 ([5cd2c36](https://github.com/chaos-design/hammer/commit/5cd2c3698911a2931be1906b537b1bc4d080bb47))
* 修复发包问题 config ([a0be5a7](https://github.com/chaos-design/hammer/commit/a0be5a7042a036c7da1e2f0024eb680b73ef75fe))
* 增加发布包能力; eslint, tsconfig配置优化; 删除changelog; 增加生成包列表的能力; 文档更新; ([70efb52](https://github.com/chaos-design/hammer/commit/70efb526cc3a292addb582779fb9a71d81a1b768))
* 更新tsconfig配置 ([3280b85](https://github.com/chaos-design/hammer/commit/3280b852156edd1cab6817c1b5abbe6298d2bddd))
* 更新包的内容 ([fcef143](https://github.com/chaos-design/hammer/commit/fcef1431bfd9a2e0382b1d1eee1206a009c183f1))
* 更新包的内容 ([2ebbac2](https://github.com/chaos-design/hammer/commit/2ebbac273aa30da49e11f5735f1750bc1e026bac))



## 0.0.19-beta.11 2026-01-19


### Features

* utils-pkg tsconfig error; ([a0b67f3](https://github.com/chaos-design/hammer/commit/a0b67f3890e617180830cb004f4e167ff033b5c7))



## 0.0.16 2026-01-18


### Features

* update tsconfig ([ac05942](https://github.com/chaos-design/hammer/commit/ac05942332942c3dc7a083e9f424053e0611f129))
* utils-pkg; folder rebuild; ([44dfdd5](https://github.com/chaos-design/hammer/commit/44dfdd56ae924520e6bb9fe4f618110748e8af0a))



## 0.0.15 2026-08-03


### Bug Fixes

* prepublishOnly ([2b1e1f2](https://github.com/chaos-design/hammer/commit/2b1e1f21d8707df7c76f0dc77058867940f98c80))



## 0.0.14 2026-08-03


### Bug Fixes

* lock error ([a4c4ea6](https://github.com/chaos-design/hammer/commit/a4c4ea6e8d0eb7b06b46abda72a7d676cc4aa62d))



## 0.0.13 2026-08-03


### Features

* eslint config; eslint plugin ([8eff847](https://github.com/chaos-design/hammer/commit/8eff847f65a295116d37237236571e539fe4b490))
* update bumpp changed tag name ([c1c5418](https://github.com/chaos-design/hammer/commit/c1c54186f2a2163a23343056c312dbb6da64192c))
* upgrade basic eslint config ([2504a43](https://github.com/chaos-design/hammer/commit/2504a43b6d78a2baec632a54b624cb0bebd3a38d))



## 0.0.10 2026-07-18


### Features

* upgrade eslint-config ([3187b84](https://github.com/chaos-design/hammer/commit/3187b847b0564b2e3d7df9b1b92919ec6116bcff))



## 0.0.9 2026-07-18


### Features

* optimize tsconfig, eslint basic ([13a9d3c](https://github.com/chaos-design/hammer/commit/13a9d3c564c832304592b225d429a24ca1f5755d))



## 0.0.8 2026-07-17


### Features

* eslint config version ([2abe59b](https://github.com/chaos-design/hammer/commit/2abe59b0c78089b86926a71452130025178d3a48))



## 0.0.2 2026-07-17


### Features

* optimize the eslint config ([62ace9c](https://github.com/chaos-design/hammer/commit/62ace9ccdac18909f2823a30909e6fa2e68b17ec))



## 0.0.4 2026-07-16


### Features

* extends eslint config with custom ([7df35bb](https://github.com/chaos-design/hammer/commit/7df35bb025497c2164515a35b85319f4f11e1908))
* github workflows ([7f15dc0](https://github.com/chaos-design/hammer/commit/7f15dc064c9f1006f2cd5bd8eb246a4a191a8228))



## 0.0.3 2026-07-16


### Features

* tsconfig typeRoots ([99127cc](https://github.com/chaos-design/hammer/commit/99127cccb4a0b119ef9306491a554cfe3d2e2d04))
* tsconfig, eslint config ([db2fa2c](https://github.com/chaos-design/hammer/commit/db2fa2cf01a7d3d2d8ee8db828704adf8351374d))
