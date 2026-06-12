# @storagebus/gcs

[![npm version](https://img.shields.io/npm/v/@storagebus/gcs)](https://www.npmjs.com/package/@storagebus/gcs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Google Cloud Storage Adapter for [StorageBus](https://github.com/ducktors/storagebus).

## Installation

```bash
npm install @storagebus/storage @storagebus/gcs @google-cloud/storage
pnpm add @storagebus/storage @storagebus/gcs @google-cloud/storage
yarn add @storagebus/storage @storagebus/gcs @google-cloud/storage
```

`@google-cloud/storage` is a peer dependency so applications own the Google Cloud Storage SDK version used by their Storage Backend integration.

## Usage

```typescript
import { createAdapter } from '@storagebus/gcs'
import { Storage } from '@storagebus/storage'

const storage = new Storage(createAdapter({
  bucket: 'your-gcs-bucket',
  projectId: 'your-gcp-project-id',
  clientEmail: 'your-gcp-client-email',
  privateKey: 'your-gcp-private-key',
}))

const objectKey = await storage.write('docs/readme.txt', 'Hello from GCS')
const file = await storage.file(objectKey)

console.log(file.type)
console.log(await file.text())

await storage.write(objectKey, null)
```

## API

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `bucket` | `string` | Yes | GCS bucket name. |
| `projectId` | `string` | No | GCP project ID. Optional when using Application Default Credentials. |
| `clientEmail` | `string` | No | Service account client email. |
| `privateKey` | `string` | No | Service account private key. |

Storage options such as `debug`, `logger`, and `sanitizeKey` are passed to `new Storage(adapter, options)` from `@storagebus/storage`.

## Migration to v1

Before v1:

```typescript
import { createStorage } from '@storagebus/gcs'

const storage = createStorage({ bucket: 'your-gcs-bucket' })
```

In v1:

```typescript
import { createAdapter } from '@storagebus/gcs'
import { Storage } from '@storagebus/storage'

const storage = new Storage(createAdapter({ bucket: 'your-gcs-bucket' }))
```

## License

MIT
