# @chaos-design/hammer

## Packages

[More Information](./packages.md)

## Development

### Publish

```sh
# update scripts/publish-to-npm.sh
# --filter="./packages/utils/classnames" replace the package absolute path which need publish
# pnpm -r --filter="./packages/utils/classnames" exec pnpm publish --access public --no-git-checks

# or

pnpm run bump-version

# check scripts/publish-to-npm.sh to see the packages which need publish

# npm / yarn
pnpm run publish-pkg
```

## License

[MIT](./LICENSE) License &copy; 2023-PRESENT [chaos-design](https://github.com/chaos-design)
