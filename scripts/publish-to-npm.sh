#!/bin/bash

pnpm -r --filter="packages/utils/pkg"  exec npm publish --access public --no-git-checks
