# @ducktors/storagebus-gcs

[![npm version](https://img.shields.io/npm/v/@ducktors/storagebus-gcs)](https://www.npmjs.com/package/@ducktors/storagebus-gcs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Google Cloud Storage adapter for [Storagebus](https://github.com/ducktors/storagebus).

## Installation

```bash
npm install @ducktors/storagebus-gcs
# or
pnpm add @ducktors/storagebus-gcs
# or
yarn add @ducktors/storagebus-gcs
```

## Usage

```typescript
import { Storage } from '@ducktors/storagebus-gcs'
import { Readable } from 'node:stream'

// Using explicit credentials
const storage = new Storage({
  bucket: 'your-gcs-bucket',
  projectId: 'your-gcp-project-id',
  clientEmail: 'your-gcp-client-email',
  privateKey: 'your-gcp-private-key',
})

// Or using Application Default Credentials (ADC)
const storageWithADC = new Storage({
  bucket: 'your-gcs-bucket',
})

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
| `bucket` | `string` | Yes | GCS bucket name |
| `projectId` | `string` | No | GCP project ID (optional if using ADC) |
| `clientEmail` | `string` | No | GCP service account client email (optional if using ADC) |
| `privateKey` | `string` | No | GCP service account private key (optional if using ADC) |
| `debug` | `boolean` | No | Enable debug logging |
| `logger` | `Logger` | No | Custom logger instance |
| `sanitizeKey` | `boolean \| (key: string) => string` | No | Sanitize file keys |

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `write` | `(key: string, fileReadable: Readable) => Promise<string>` | Write a file to storage. Automatically sets Content-Type based on file extension |
| `exists` | `(key: string) => Promise<boolean>` | Check if a file exists |
| `read` | `(key: string) => Promise<Readable>` | Read a file from storage |
| `remove` | `(key: string) => Promise<void>` | Delete a file from storage |
| `copy` | `(key: string, destKey: string) => Promise<string>` | Copy a file within the bucket |
| `move` | `(key: string, destKey: string) => Promise<string>` | Move a file within the bucket |

## Authentication

This adapter supports two authentication methods:

1. **Explicit Credentials**: Pass `projectId`, `clientEmail`, and `privateKey` to the constructor
2. **Application Default Credentials (ADC)**: If credentials are not provided, the adapter will use ADC. This is useful when running on Google Cloud infrastructure or when you have configured `GOOGLE_APPLICATION_CREDENTIALS` environment variable

## License

MIT
