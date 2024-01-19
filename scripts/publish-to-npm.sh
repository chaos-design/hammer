#!/bin/bash

pnpm -r --filter="./packages/config/tsconfig/chaos"  exec npm publish --access public --no-git-checks
