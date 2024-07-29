---
"@storagebus/storage": major
"@storagebus/local": major
"@storagebus/gcs": major
"@storagebus/s3": major
---

The most significant breaking change is the move to a new API, which now has only two methods: write and file.

The write method is used to write a BusFile instance, a Stream of a buffer to the underlying storage. The file method is used to get a file from storage. The file method returns a `BusFile` instance, which can then be used to retrieve the file's content (as stream, string, or buffer) and get metadata about the file.