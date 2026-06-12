# @storagebus/local

[![npm version](https://img.shields.io/npm/v/@storagebus/local)](https://www.npmjs.com/package/@storagebus/local)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Local filesystem Adapter for [StorageBus](https://github.com/ducktors/storagebus).

## Installation

```bash
npm install @storagebus/storage @storagebus/local
pnpm add @storagebus/storage @storagebus/local
yarn add @storagebus/storage @storagebus/local
```

## Usage

```typescript
import { createAdapter } from '@storagebus/local'
import { Storage } from '@storagebus/storage'

const storage = new Storage(createAdapter({ root: '/path/to/storage' }))

const objectKey = await storage.write('notes/hello.txt', 'Hello, world!')
const file = await storage.file(objectKey)

console.log(await file.text())
console.log(file.size)
console.log(file.lastModified)

await storage.write(objectKey, null)
```

## API

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `root` | `string` | Yes | Root directory for the local Storage Backend. |

Storage options such as `debug`, `logger`, and `sanitizeKey` are passed to `new Storage(adapter, options)` from `@storagebus/storage`.

## Migration to v1

Before v1:

```typescript
import { createStorage } from '@storagebus/local'

const storage = createStorage({ root: '/path/to/storage' })
```

In v1:

```typescript
import { createAdapter } from '@storagebus/local'
import { Storage } from '@storagebus/storage'

const storage = new Storage(createAdapter({ root: '/path/to/storage' }))
```

## License

MIT
