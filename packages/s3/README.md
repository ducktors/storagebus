# @storagebus/s3

[![npm version](https://img.shields.io/npm/v/@storagebus/s3)](https://www.npmjs.com/package/@storagebus/s3)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AWS S3 Adapter for [StorageBus](https://github.com/ducktors/storagebus).

## Installation

```bash
npm install @storagebus/storage @storagebus/s3 @aws-sdk/client-s3 @aws-sdk/lib-storage
pnpm add @storagebus/storage @storagebus/s3 @aws-sdk/client-s3 @aws-sdk/lib-storage
yarn add @storagebus/storage @storagebus/s3 @aws-sdk/client-s3 @aws-sdk/lib-storage
```

`@aws-sdk/client-s3` and `@aws-sdk/lib-storage` are peer dependencies so applications own the AWS SDK versions used by their Storage Backend integration.

## Usage

```typescript
import { createAdapter } from '@storagebus/s3'
import { Storage } from '@storagebus/storage'

const storage = new Storage(createAdapter({
  bucket: 'your-s3-bucket',
  region: 'us-east-1',
  accessKeyId: 'your-access-key-id',
  secretAccessKey: 'your-secret-access-key',
}))

const objectKey = await storage.write('docs/readme.txt', 'Hello from S3')
const file = await storage.file(objectKey)

console.log(file.type)
console.log(await file.text())

await storage.write(objectKey, null)
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

Storage options such as `debug`, `logger`, and `sanitizeKey` are passed to `new Storage(adapter, options)` from `@storagebus/storage`.

## Migration to v1

Before v1:

```typescript
import { createStorage } from '@storagebus/s3'

const storage = createStorage({ bucket: 'your-s3-bucket' })
```

In v1:

```typescript
import { createAdapter } from '@storagebus/s3'
import { Storage } from '@storagebus/storage'

const storage = new Storage(createAdapter({ bucket: 'your-s3-bucket' }))
```

## License

MIT
