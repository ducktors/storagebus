# @storagebus/gcs

[![npm version](https://img.shields.io/npm/v/@storagebus/gcs)](https://www.npmjs.com/package/@storagebus/gcs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Google Cloud Storage adapter for [Storagebus](https://github.com/ducktors/storagebus).

## Installation

```bash
npm install @storagebus/gcs
pnpm add @storagebus/gcs
yarn add @storagebus/gcs
```

## Usage

```typescript
import { createStorage } from '@storagebus/gcs'

const storage = createStorage({
  bucket: 'your-gcs-bucket',
  projectId: 'your-gcp-project-id',
  clientEmail: 'your-gcp-client-email',
  privateKey: 'your-gcp-private-key',
})

const path = await storage.write('docs/readme.txt', 'Hello from GCS')
const file = await storage.file(path)

console.log(file.type)
console.log(await file.text())

await storage.write(path, null)
```

## API

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `bucket` | `string` | Yes | GCS bucket name. |
| `projectId` | `string` | No | GCP project ID. Optional when using Application Default Credentials. |
| `clientEmail` | `string` | No | Service account client email. |
| `privateKey` | `string` | No | Service account private key. |
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
