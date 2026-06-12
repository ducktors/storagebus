# @storagebus/storage

[![npm version](https://img.shields.io/npm/v/@storagebus/storage)](https://www.npmjs.com/package/@storagebus/storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Core StorageBus package. It provides `Storage`, `BusFile`, the Adapter contract, shared errors, and compliance tests for Adapter packages.

## Installation

```bash
npm install @storagebus/storage
pnpm add @storagebus/storage
yarn add @storagebus/storage
```

## Usage

```typescript
import { createAdapter } from '@storagebus/memory'
import { Storage } from '@storagebus/storage'

const storage = new Storage(createAdapter())

const objectKey = await storage.write('hello.txt', 'Hello, world!')
const file = await storage.file(objectKey)

console.log(file.name)
console.log(file.type)
console.log(file.size)
console.log(await file.text())

await storage.write(objectKey, null)
```

## BusFile

`BusFile` is the value returned by `storage.file(objectKey)`.

| Property or method | Description |
|--------------------|-------------|
| `name` | Object Key, exposed as `name` to match the File-style shape. |
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
    // Store buffer at file.name, which is the Object Key.
    return file.name
  },
  async get(objectKey) {
    return () => {
      // Return a Readable for objectKey.
    }
  },
  async metadata(objectKey) {
    return { size: 0, lastModified: -1 }
  },
  async delete(objectKey) {
    // Delete objectKey.
  },
}

const storage = new Storage(adapter)
```

## Migration to v1

The in-memory Adapter moved from `@storagebus/storage/memory` to `@storagebus/memory`.

Before v1:

```typescript
import { createStorage } from '@storagebus/storage/memory'

const storage = createStorage()
```

In v1:

```typescript
import { createAdapter } from '@storagebus/memory'
import { Storage } from '@storagebus/storage'

const storage = new Storage(createAdapter())
```

## License

MIT
