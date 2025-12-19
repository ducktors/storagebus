# @ducktors/storagebus-local

[![npm version](https://img.shields.io/npm/v/@ducktors/storagebus-local)](https://www.npmjs.com/package/@ducktors/storagebus-local)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Local filesystem storage adapter for [Storagebus](https://github.com/ducktors/storagebus).

## Installation

```bash
npm install @ducktors/storagebus-local
# or
pnpm add @ducktors/storagebus-local
# or
yarn add @ducktors/storagebus-local
```

## Usage

```typescript
import { Storage } from '@ducktors/storagebus-local'
import { Readable } from 'node:stream'

// Using an absolute path
const storage = new Storage({
  rootFolder: '/path/to/storage',
})

// Using a relative path (will be placed in system temp directory)
const storageTmp = new Storage({
  rootFolder: 'my-storage',
})

// Alternative: use 'bucket' instead of 'rootFolder'
const storageAlt = new Storage({
  bucket: '/path/to/storage',
})

async function main() {
  const readable = Readable.from('Hello, world!')

  // Write a file
  const writtenFile = await storage.write('path/to/file.txt', readable)

  // Check if file exists
  const exists = await storage.exists('path/to/file.txt')

  // Read a file
  const fileStream = await storage.read('path/to/file.txt')

  // Copy a file
  const copiedFile = await storage.copy('path/to/file.txt', 'path/to/copy.txt')

  // Move a file
  const movedFile = await storage.move('path/to/copy.txt', 'new/path/file.txt')

  // Delete a file
  await storage.remove('path/to/file.txt')
}
```

## API

### Constructor Options

You must provide exactly one of `rootFolder` or `bucket`:

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `rootFolder` | `string` | Yes* | Root directory for file storage |
| `bucket` | `string` | Yes* | Alias for `rootFolder` |
| `debug` | `boolean` | No | Enable debug logging |
| `logger` | `Logger` | No | Custom logger instance |
| `sanitizeKey` | `boolean \| (key: string) => string` | No | Sanitize file keys |

*Either `rootFolder` or `bucket` must be provided, but not both.

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `write` | `(filePath: string, fileReadable: Readable) => Promise<string>` | Write a file to storage. Creates subdirectories automatically |
| `exists` | `(filePath: string) => Promise<boolean>` | Check if a file exists |
| `read` | `(filePath: string) => Promise<Readable>` | Read a file from storage |
| `remove` | `(filePath: string) => Promise<void>` | Delete a file from storage |
| `copy` | `(filePath: string, destFilePath: string) => Promise<string>` | Copy a file. Creates destination subdirectories automatically |
| `move` | `(filePath: string, destFilePath: string) => Promise<string>` | Move a file. Handles cross-device moves automatically |

## Path Resolution

- **Absolute paths**: Used as-is
- **Relative paths**: Placed inside the system's temp directory (`os.tmpdir()`)

The root directory is created automatically if it doesn't exist.

## License

MIT
