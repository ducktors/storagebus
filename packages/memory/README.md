# @ducktors/storagebus-memory

[![npm version](https://img.shields.io/npm/v/@ducktors/storagebus-memory)](https://www.npmjs.com/package/@ducktors/storagebus-memory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

In-memory storage adapter for [Storagebus](https://github.com/ducktors/storagebus). Useful for testing and development purposes.

## Installation

```bash
npm install @ducktors/storagebus-memory
# or
pnpm add @ducktors/storagebus-memory
# or
yarn add @ducktors/storagebus-memory
```

## Usage

```typescript
import { Storage } from '@ducktors/storagebus-memory'
import { Readable } from 'node:stream'

const storage = new Storage({})

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

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `debug` | `boolean` | No | Enable debug logging |
| `logger` | `Logger` | No | Custom logger instance |
| `sanitizeKey` | `boolean \| (key: string) => string` | No | Sanitize file keys |

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `write` | `(key: string, fileReadable: Readable) => Promise<string>` | Write a file to storage |
| `exists` | `(key: string) => Promise<boolean>` | Check if a file exists |
| `read` | `(key: string) => Promise<Readable>` | Read a file from storage |
| `remove` | `(key: string) => Promise<void>` | Delete a file from storage |
| `copy` | `(key: string, destKey: string) => Promise<string>` | Copy a file |
| `move` | `(key: string, destKey: string) => Promise<string>` | Move a file |

## Use Cases

- **Testing**: Use this adapter in your test suite to avoid hitting real storage services
- **Development**: Quickly prototype storage-dependent features without external dependencies
- **CI/CD**: Run tests in CI environments without needing cloud credentials

## Note

Data stored in memory is not persistent and will be lost when the process exits. This adapter is not suitable for production use cases where data persistence is required.

## License

MIT
