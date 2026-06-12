# @storagebus/memory

[![npm version](https://img.shields.io/npm/v/@storagebus/memory)](https://www.npmjs.com/package/@storagebus/memory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

In-memory Adapter for [StorageBus](https://github.com/ducktors/storagebus).

## Installation

```bash
npm install @storagebus/storage @storagebus/memory
pnpm add @storagebus/storage @storagebus/memory
yarn add @storagebus/storage @storagebus/memory
```

## Usage

```typescript
import { createAdapter } from '@storagebus/memory'
import { Storage } from '@storagebus/storage'

const storage = new Storage(createAdapter())

const objectKey = await storage.write('notes/hello.txt', 'Hello, world!')
const file = await storage.file(objectKey)

console.log(await file.text())
console.log(file.size)
console.log(file.lastModified)

await storage.write(objectKey, null)
```

## API

`createAdapter()` creates an isolated in-memory Adapter. Each Adapter instance has its own in-memory Storage Backend.

Storage options such as `debug`, `logger`, and `sanitizeKey` are passed to `new Storage(adapter, options)` from `@storagebus/storage`.

## Migration to v1

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
