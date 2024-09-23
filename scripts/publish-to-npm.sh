#!/bin/bash

pnpm -r --filter="./packages/utils/classnames" exec pnpm publish --access public --no-git-checks
