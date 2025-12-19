# @ducktors/storagebus-abstract

[![npm version](https://img.shields.io/npm/v/@ducktors/storagebus-abstract)](https://www.npmjs.com/package/@ducktors/storagebus-abstract)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Abstract base class for Storagebus storage adapters. This package provides the foundation for creating storage adapters that work with the Storagebus ecosystem.

## Installation

```bash
npm install @ducktors/storagebus-abstract
# or
pnpm add @ducktors/storagebus-abstract
# or
yarn add @ducktors/storagebus-abstract
```

## Usage

This package is intended to be used as a base class for implementing custom storage adapters. If you're looking to use a storage solution directly, check out the available adapters:

- [@ducktors/storagebus-local](https://www.npmjs.com/package/@ducktors/storagebus-local) - Local filesystem storage
- [@ducktors/storagebus-s3](https://www.npmjs.com/package/@ducktors/storagebus-s3) - AWS S3 storage
- [@ducktors/storagebus-gcs](https://www.npmjs.com/package/@ducktors/storagebus-gcs) - Google Cloud Storage
- [@ducktors/storagebus-memory](https://www.npmjs.com/package/@ducktors/storagebus-memory) - In-memory storage

### Creating a Custom Adapter

```typescript
import { Readable } from 'node:stream'
import { Storage, AbstractStorageOptions } from '@ducktors/storagebus-abstract'

interface MyStorageOptions extends AbstractStorageOptions {
  // Add your custom options here
}

class MyStorage extends Storage {
  constructor(opts: MyStorageOptions) {
    super(opts)
  }

  async write(fileName: string, fileReadable: Readable): Promise<string> {
    // Implement write logic
  }

  async exists(fileName: string): Promise<boolean> {
    // Implement exists logic
  }

  async read(fileName: string): Promise<Readable> {
    // Implement read logic
  }

  async remove(fileName: string): Promise<void> {
    // Implement remove logic
  }

  async copy(key: string, destKey: string): Promise<string> {
    // Implement copy logic
  }

  async move(key: string, destKey: string): Promise<string> {
    // Implement move logic
  }
}
```

## API

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debug` | `boolean` | `false` | Enable debug logging |
| `logger` | `Logger` | `defaultLogger` | Custom logger instance |
| `sanitizeKey` | `boolean \| (key: string) => string` | `false` | Sanitize file keys. When `true`, uses built-in sanitizer. Can also be a custom function |

### Abstract Methods

All storage adapters must implement these methods:

| Method | Signature | Description |
|--------|-----------|-------------|
| `write` | `(fileName: string, fileReadable: Readable) => Promise<string>` | Write a file to storage |
| `exists` | `(fileName: string) => Promise<boolean>` | Check if a file exists |
| `read` | `(fileName: string) => Promise<Readable>` | Read a file from storage |
| `remove` | `(fileName: string) => Promise<void>` | Delete a file from storage |
| `copy` | `(key: string, destKey: string) => Promise<string>` | Copy a file within storage |
| `move` | `(key: string, destKey: string) => Promise<string>` | Move a file within storage |

### Helper Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `toBuffer` | `(readableStream: Readable) => Promise<Buffer>` | Convert a readable stream to a Buffer |

## License

MIT
