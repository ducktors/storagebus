# @storagebus/storage

[![npm version](https://img.shields.io/npm/v/@storagebus/storage)](https://www.npmjs.com/package/@storagebus/storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Core Storagebus package. It provides `Storage`, `BusFile`, the adapter interface, an in-memory adapter, and compliance tests for adapter packages.

## Installation

```bash
npm install @storagebus/storage
pnpm add @storagebus/storage
yarn add @storagebus/storage
```

## Usage

```typescript
import { createStorage } from '@storagebus/storage/memory'

const storage = createStorage()

const path = await storage.write('hello.txt', 'Hello, world!')
const file = await storage.file(path)

console.log(file.name)
console.log(file.type)
console.log(file.size)
console.log(await file.text())

await storage.write(path, null)
```

## BusFile

`BusFile` is the value returned by `storage.file(path)`.

| Property or method | Description |
|--------------------|-------------|
| `name` | Storage path. |
| `type` | Content type, inferred from extension when metadata does not provide one. |
| `size` | File size in bytes. |
| `lastModified` | Last modified timestamp in milliseconds, or `-1` when unavailable. |
| `stream()` | Return a Node.js readable stream. |
| `buffer()` | Return a `Buffer`. |
| `arrayBuffer()` | Return an `ArrayBuffer`. |
| `text()` | Return a string. |

## Custom Adapters

```typescript
import { Storage, type Adapter } from '@storagebus/storage'

const adapter: Adapter = {
  async set(file) {
    const buffer = await file.buffer()
    // Store buffer at file.name.
    return file.name
  },
  async get(path) {
    return () => {
      // Return a Readable for path.
    }
  },
  async metadata(path) {
    return {}
  },
  async delete(path) {
    // Delete path.
  },
}

const storage = new Storage(adapter)
```

## License

MIT
