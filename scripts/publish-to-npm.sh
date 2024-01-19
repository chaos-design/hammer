#!/bin/bash

pnpm -r --filter="./packages/config/eslint-config/basic" --filter="./packages/config/eslint-config/chaos" --filter="./packages/config/eslint-config/react" --filter="./packages/config/eslint-config/ts" --filter="./packages/config/eslint-plugin/chaos" --filter="./packages/config/tsconfig/chaos" --filter="./packages/utils/pkg"  exec npm publish --access public --no-git-checks
