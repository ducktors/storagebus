# @storagebus/local

[![npm version](https://img.shields.io/npm/v/@storagebus/local)](https://www.npmjs.com/package/@storagebus/local)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Local filesystem adapter for [Storagebus](https://github.com/ducktors/storagebus).

## Installation

```bash
npm install @storagebus/local
pnpm add @storagebus/local
yarn add @storagebus/local
```

## Usage

```typescript
import { createStorage } from '@storagebus/local'

const storage = createStorage({
  root: '/path/to/storage',
})

const path = await storage.write('notes/hello.txt', 'Hello, world!')
const file = await storage.file(path)

console.log(await file.text())
console.log(file.size)
console.log(file.lastModified)

await storage.write(path, null)
```

## API

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `root` | `string` | Yes | Root directory for file storage. |
| `debug` | `boolean` | No | Enable debug logging. |
| `logger` | `Logger` | No | Custom logger instance. |
| `sanitizeKey` | `boolean \| (key: string) => string` | No | Sanitize storage keys before use. |

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `write` | `(destination, data, contentType?) => Promise<string>` | Write content, replace content, or delete when `data` is `null`. |
| `file` | `(path: string) => Promise<BusFile>` | Return a `BusFile` for metadata and content access. |

## License

MIT
