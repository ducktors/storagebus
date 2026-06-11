# @storagebus/s3

[![npm version](https://img.shields.io/npm/v/@storagebus/s3)](https://www.npmjs.com/package/@storagebus/s3)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AWS S3 adapter for [Storagebus](https://github.com/ducktors/storagebus).

## Installation

```bash
npm install @storagebus/s3
pnpm add @storagebus/s3
yarn add @storagebus/s3
```

## Usage

```typescript
import { createStorage } from '@storagebus/s3'

const storage = createStorage({
  bucket: 'your-s3-bucket',
  region: 'us-east-1',
  accessKeyId: 'your-access-key-id',
  secretAccessKey: 'your-secret-access-key',
})

const path = await storage.write('docs/readme.txt', 'Hello from S3')
const file = await storage.file(path)

console.log(file.type)
console.log(await file.text())

await storage.write(path, null)
```

## API

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `bucket` | `string` | Yes | S3 bucket name. |
| `region` | `string` | No | AWS region. |
| `accessKeyId` | `string` | No | AWS access key ID. Optional when using default AWS credentials. |
| `secretAccessKey` | `string` | No | AWS secret access key. Optional when using default AWS credentials. |
| `endpoint` | `string` | No | Custom S3-compatible endpoint. |
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
