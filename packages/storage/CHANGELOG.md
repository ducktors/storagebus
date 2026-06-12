# @storagebus/storage

## 1.0.0

### Major Changes

- 3ae7f3a: Reboot Storagebus around the new File-oriented API.

  The public storage surface now has two methods: `write()` and `file()`. The `file()` method returns a `BusFile`, which exposes content as a stream, buffer, array buffer, or text, plus storage metadata. The memory Adapter now lives in `@storagebus/memory`, and local, S3, and GCS packages are rebuilt as adapters for the shared core.

## 0.10.3

### Patch Changes

- 41ed13e: chore: update tslib and cloud providers sdks

## 0.10.2

### Patch Changes

- [#8](https://github.com/ducktors/storagebus/pull/8) [`e36e9d7`](https://github.com/ducktors/storagebus/commit/e36e9d74183b5a1c3fc9920236854abfc6006c45) Thanks [@matteovivona](https://github.com/matteovivona)! - Update vitest/coverage-istanbul on local and abstract package

## 0.10.1

### Patch Changes

- Updates deps

## 0.10.0

### Minor Changes

- move to monorepo and multipackage
