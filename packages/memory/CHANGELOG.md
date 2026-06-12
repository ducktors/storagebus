# @storagebus/memory

## 1.0.0

### Major Changes

- 3ae7f3a: Reboot Storagebus around the new File-oriented API.

  The public storage surface now has two methods: `write()` and `file()`. The `file()` method returns a `BusFile`, which exposes content as a stream, buffer, array buffer, or text, plus storage metadata. The memory Adapter now lives in `@storagebus/memory`, and local, S3, and GCS packages are rebuilt as adapters for the shared core.

### Patch Changes

- Updated dependencies [3ae7f3a]
  - @storagebus/storage@1.0.0
