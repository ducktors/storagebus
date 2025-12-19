import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'
import { test } from 'node:test'

import { Storage as AbstractStorage } from '@ducktors/storagebus-abstract'
import streamBuffers from 'stream-buffers'

import { Storage } from '../src/gcs.js'

// Mock classes defined outside test to avoid ESM mocking issues
class MockFile {
  name: string
  contents: Buffer
  metadata: any
  bucket: MockBucket

  constructor(path: string, bucket: MockBucket) {
    this.name = path
    this.contents = Buffer.alloc(0)
    this.metadata = {}
    this.bucket = bucket
  }

  get() {
    return [this, this.metadata]
  }

  exists() {
    return this.bucket.files[this.name] ? [true] : [false]
  }

  createReadStream() {
    const readable = new streamBuffers.ReadableStreamBuffer()
    readable.put(this.contents)
    readable.stop()
    return readable
  }

  createWriteStream(_opts?: { contentType?: string }) {
    const writable = new streamBuffers.WritableStreamBuffer()
    writable.on('finish', () => {
      this.contents = writable.getContents() as Buffer
    })
    this.bucket.files[this.name] = this
    return writable
  }

  async delete({ ignoreNotFound }: { ignoreNotFound: true }) {
    if (!(ignoreNotFound || this.bucket.files[this.name])) {
      throw new Error(`File ${this.name} does not exist`)
    }
    this.bucket.files[this.name] = undefined
  }

  async copy(destFile: MockFile) {
    destFile.contents = this.contents
    destFile.metadata = this.metadata
    this.bucket.files[destFile.name] = destFile
  }

  async move(destFile: MockFile) {
    destFile.contents = this.contents
    destFile.metadata = this.metadata
    this.bucket.files[destFile.name] = destFile
    this.bucket.files[this.name] = undefined
  }
}

class MockBucket {
  name: string
  files: { [path: string]: MockFile | undefined }

  constructor(name: string) {
    this.name = name
    this.files = {}
  }

  file(path: string) {
    return new MockFile(path, this)
  }
}

test('GCS', async () => {
  const bucketName = randomUUID()

  // Create storage instance with dummy credentials to avoid ADC lookup
  const storage = new Storage({
    bucket: bucketName,
    clientEmail: 'test@test.iam.gserviceaccount.com',
    privateKey:
      '-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBALRiMLAHudeSA2ai3ebt\n-----END RSA PRIVATE KEY-----',
    projectId: 'test-project',
  })

  // Mock the bucket at instance level (similar to S3 tests)
  const mockBucket = new MockBucket(bucketName)
  ;(storage as any).bucket = mockBucket

  await test('storage is instance of Storage', () => {
    assert.equal(storage instanceof Storage, true)
  })

  await test('storage instance extends from AbstractStorage', () => {
    assert.equal(storage instanceof AbstractStorage, true)
  })

  await test('storage constructor accepts parameters', () => {
    const storage = new Storage({
      clientEmail: 'foobar',
      privateKey: 'foo',
      projectId: 'bar',
      bucket: bucketName,
    })
    assert.equal(storage instanceof Storage, true)
    assert.equal(storage instanceof AbstractStorage, true)
  })

  await test('storage.write a Readable to GCS bucket', async () => {
    const key = randomUUID()
    await storage.write(key, Readable.from(key))

    assert.equal(await storage.exists(key), true)
  })

  await test('storage.read reads a file from GCS bucket', async () => {
    const key = randomUUID()
    await storage.write(key, Readable.from(key))
    const file = await storage.read(key)

    assert.equal(file instanceof Readable, true)
  })

  await test('storage.read throws on missing key', async () => {
    const key = randomUUID()

    await assert.rejects(() => storage.read(key), Error)
  })

  await test('storage.remove removes key from gcs bucket', async () => {
    const key = randomUUID()
    await storage.write(key, Readable.from(key))
    await storage.remove(key)

    assert.equal(await storage.exists(key), false)
  })

  await test('storage.copy copy a file to new location', async () => {
    const key = randomUUID()
    const objectKey = await storage.write(key, Readable.from(key))
    const newKey = await storage.copy(objectKey, 'new-key')

    assert.equal(await storage.exists(objectKey), true)
    assert.equal(await storage.exists(newKey), true)
  })

  await test('storage.copy copy a file with ContentType set to new location', async () => {
    const key = `${randomUUID()}.jpeg`
    const objectKey = await storage.write(key, Readable.from(key))
    const newKey = await storage.copy(objectKey, 'new-key.jpeg')

    assert.equal(await storage.exists(objectKey), true)
    assert.equal(await storage.exists(newKey), true)
  })

  await test('storage.move moves a file to a new location', async () => {
    const key = randomUUID()

    const objectKey = await storage.write(key, Readable.from(key))
    const newKey = await storage.move(objectKey, 'new-key')

    assert.equal(await storage.exists(objectKey), false)
    assert.equal(await storage.exists(newKey), true)
  })

  await test('toBuffer returns a buffer from Readable with objectMode true', async () => {
    const buffer = await storage.toBuffer(
      Readable.from('foo', { objectMode: true }),
    )

    assert.equal(buffer instanceof Buffer, true)
    assert.equal(buffer.toString(), 'foo')
  })

  await test('toBuffer returns a buffer from Readable with objectMode false', async () => {
    const buffer = await storage.toBuffer(
      Readable.from('foo', { objectMode: false }),
    )

    assert.equal(buffer instanceof Buffer, true)
    assert.equal(buffer.toString(), 'foo')
  })
})
