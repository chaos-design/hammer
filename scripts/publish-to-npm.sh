#!/bin/bash

pnpm -r --filter="./packages/utils/pkg"  exec pnpm publish --access public --no-git-checks
