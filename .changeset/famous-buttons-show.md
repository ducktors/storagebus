---
"@storagebus/storage": major
"@storagebus/memory": major
"@storagebus/local": major
"@storagebus/gcs": major
"@storagebus/s3": major
---

Reboot Storagebus around the new File-oriented API.

The public storage surface now has two methods: `write()` and `file()`. The `file()` method returns a `BusFile`, which exposes content as a stream, buffer, array buffer, or text, plus storage metadata. The memory Adapter now lives in `@storagebus/memory`, and local, S3, and GCS packages are rebuilt as adapters for the shared core.