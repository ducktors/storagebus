# @storagebus/s3

## 1.0.0

### Major Changes

- 3ae7f3a: Reboot Storagebus around the new File-oriented API.

  The public storage surface now has two methods: `write()` and `file()`. The `file()` method returns a `BusFile`, which exposes content as a stream, buffer, array buffer, or text, plus storage metadata. The memory Adapter now lives in `@storagebus/memory`, and local, S3, and GCS packages are rebuilt as adapters for the shared core.

### Patch Changes

- Updated dependencies [3ae7f3a]
  - @storagebus/storage@1.0.0

## 0.12.1

### Patch Changes

- 4ae248d: Update readme and test changeset release
- Updated dependencies [4ae248d]
  - @storagebus/storage@0.10.4

## 0.12.0

### Minor Changes

- f3ced7f: Added destBucket option to copy API for S3

## 0.11.4

### Patch Changes

- 41ed13e: chore: update tslib and cloud providers sdks
- Updated dependencies [41ed13e]
  - @storagebus/storage@0.10.3

## 0.11.3

### Patch Changes

- 9b26cac: Update SDK

## 0.11.2

### Patch Changes

- Updated dependencies [[`e36e9d7`](https://github.com/ducktors/storagebus/commit/e36e9d74183b5a1c3fc9920236854abfc6006c45)]:
  - @storagebus/storage@0.10.2

## 0.11.1

### Patch Changes

- Updates deps

- Updated dependencies []:
  - @storagebus/storage@0.10.1

## 0.11.0

### Minor Changes

- standardize exported classes

## 0.10.1

### Patch Changes

- add barrel file to @storagebus/s3

## 0.10.0

### Minor Changes

- move to monorepo and multipackage

### Patch Changes

- Updated dependencies
  - @storagebus/storage@0.10.0
