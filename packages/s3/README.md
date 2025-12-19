# @ducktors/storagebus-s3

[![npm version](https://img.shields.io/npm/v/@ducktors/storagebus-s3)](https://www.npmjs.com/package/@ducktors/storagebus-s3)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AWS S3 storage adapter for [Storagebus](https://github.com/ducktors/storagebus).

## Installation

```bash
npm install @ducktors/storagebus-s3
# or
pnpm add @ducktors/storagebus-s3
# or
yarn add @ducktors/storagebus-s3
```

## Usage

```typescript
import { Storage } from '@ducktors/storagebus-s3'
import { Readable } from 'node:stream'

// Using explicit credentials
const storage = new Storage({
  bucket: 'your-s3-bucket',
  region: 'us-east-1',
  accessKeyId: 'your-access-key-id',
  secretAccessKey: 'your-secret-access-key',
})

// Or using default credentials (IAM role, environment variables, etc.)
const storageWithDefaultCreds = new Storage({
  bucket: 'your-s3-bucket',
  region: 'us-east-1',
})

async function main() {
  const readable = Readable.from('Hello, world!')

  // Write a file
  const writtenFile = await storage.write('path/to/file.txt', readable)

  // Write with progress tracking
  await storage.write('path/to/large-file.txt', readable, {
    progress: (p) => console.log(`Uploaded: ${p.loaded} bytes`),
  })

  // Write with server-side encryption
  await storage.write('path/to/encrypted.txt', readable, {
    entryption: {
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: 'your-kms-key-id',
    },
  })

  // Check if file exists
  const exists = await storage.exists('path/to/file.txt')

  // Read a file
  const fileStream = await storage.read('path/to/file.txt')

  // Copy a file
  const copiedFile = await storage.copy('path/to/file.txt', 'path/to/copy.txt')

  // Copy to a different bucket
  await storage.copy('path/to/file.txt', 'path/to/copy.txt', {
    destBucket: 'another-bucket',
  })

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
| `bucket` | `string` | Yes | S3 bucket name |
| `region` | `string` | No | AWS region (e.g., `us-east-1`) |
| `accessKeyId` | `string` | No | AWS access key ID (optional if using IAM roles or environment variables) |
| `secretAccessKey` | `string` | No | AWS secret access key (optional if using IAM roles or environment variables) |
| `debug` | `boolean` | No | Enable debug logging |
| `logger` | `Logger` | No | Custom logger instance |
| `sanitizeKey` | `boolean \| (key: string) => string` | No | Sanitize file keys |

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `write` | `(key: string, fileReadable: Readable, opts?: WriteOpts) => Promise<string>` | Write a file to storage. Automatically sets Content-Type based on file extension |
| `exists` | `(key: string) => Promise<boolean>` | Check if a file exists |
| `read` | `(key: string) => Promise<Readable>` | Read a file from storage |
| `remove` | `(key: string) => Promise<void>` | Delete a file from storage |
| `copy` | `(key: string, destKey: string, opts?: CopyOpts) => Promise<string>` | Copy a file within or between buckets |
| `move` | `(key: string, destKey: string, opts?: MoveOpts) => Promise<string>` | Move a file within the bucket |

### WriteOpts

| Option | Type | Description |
|--------|------|-------------|
| `progress` | `(p: Progress) => void` | Callback function for upload progress |
| `entryption.ServerSideEncryption` | `string` | Server-side encryption algorithm (`AES256`, `aws:kms`, `aws:kms:dsse`) |
| `entryption.SSEKMSKeyId` | `string` | KMS key ID for encryption |

### CopyOpts

| Option | Type | Description |
|--------|------|-------------|
| `destBucket` | `string` | Destination bucket (defaults to source bucket) |
| `entryption.ServerSideEncryption` | `string` | Server-side encryption algorithm |
| `entryption.SSEKMSKeyId` | `string` | KMS key ID for encryption |

### MoveOpts

| Option | Type | Description |
|--------|------|-------------|
| `entryption.ServerSideEncryption` | `string` | Server-side encryption algorithm |
| `entryption.SSEKMSKeyId` | `string` | KMS key ID for encryption |

## Authentication

This adapter supports multiple authentication methods:

1. **Explicit Credentials**: Pass `accessKeyId` and `secretAccessKey` to the constructor
2. **Environment Variables**: Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
3. **IAM Roles**: When running on AWS infrastructure (EC2, Lambda, ECS, etc.)
4. **AWS Credentials File**: `~/.aws/credentials`

See [AWS SDK credentials documentation](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html) for more details.

## License

MIT
