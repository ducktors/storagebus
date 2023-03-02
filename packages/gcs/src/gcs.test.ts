import { Readable } from 'node:stream'
import { randomUUID } from 'node:crypto'

import streamBuffers from 'stream-buffers'
import { test, expect, vi } from 'vitest'
import { Storage as AbstractStorage } from '@ducktors/storagebus-abstract'

import { Storage } from './gcs'

vi.mock('@google-cloud/storage', () => {
  class MockStorage {
    buckets: { [name: string]: MockBucket }

    constructor() {
      this.buckets = {}
    }

    bucket(name: string) {
      return this.buckets[name] || (this.buckets[name] = new MockBucket(name))
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

    createWriteStream({ contentType }: { contentType: string }) {
      // if (!this.bucket.files[this.path]) {
      //   throw new Error(`File ${this.path} does not exist`);
      // }
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

  return {
    Storage: MockStorage,
  }
})

const bucket = 'trustlayer-maksim'
const storage = new Storage({ bucket })

test('storage is instance of Storage', () => {
  expect(storage).toBeInstanceOf(Storage)
})

test('storage instance extends from AbstractStorage', () => {
  expect(storage).toBeInstanceOf(AbstractStorage)
})

test('storage constructor accepts parameters', () => {
  const storage = new Storage({
    clientEmail: 'foobar',
    privateKey: 'foo',
    projectId: 'bar',
    bucket,
  })
  expect(storage).toBeInstanceOf(Storage)
  expect(storage).toBeInstanceOf(AbstractStorage)
})

test('storage.write a Readable to GCS bucket', async () => {
  const key = randomUUID()
  await storage.write(key, Readable.from(key))

  expect(await storage.exists(key)).toBe(true)
})

test('storage.read reads a file from GCS bucket', async () => {
  const key = randomUUID()
  await storage.write(key, Readable.from(key))
  const file = await storage.read(key)

  expect(file).toBeInstanceOf(Readable)
})

test('storage.read throws on missing key', async () => {
  const key = randomUUID()

  await expect(() => storage.read(key)).rejects.toThrow()
})

test('storage.remove removes key from gcs bucket', async () => {
  const key = randomUUID()
  await storage.write(key, Readable.from(key))
  await storage.remove(key)

  expect(await storage.exists(key)).toBe(false)
})

test('storage.copy copy a file to new location', async () => {
  const key = randomUUID()
  const objectKey = await storage.write(key, Readable.from(key))
  const newKey = await storage.copy(objectKey, 'new-key')

  expect(await storage.exists(objectKey)).toBe(true)
  expect(await storage.exists(newKey)).toBe(true)
})

test('storage.copy copy a file with ContentType set to new location', async () => {
  const key = `${randomUUID()}.jpeg`
  const objectKey = await storage.write(key, Readable.from(key))
  const newKey = await storage.copy(objectKey, 'new-key.jpeg')

  expect(await storage.exists(objectKey)).toBe(true)
  expect(await storage.exists(newKey)).toBe(true)
})

test('storage.move moves a file to a new location', async () => {
  const key = randomUUID()

  const objectKey = await storage.write(key, Readable.from(key))
  const newKey = await storage.move(objectKey, 'new-key')

  expect(await storage.exists(objectKey)).toBe(false)
  expect(await storage.exists(newKey)).toBe(true)
})

test('toBuffer returns a buffer from Readable with objectMode true', async () => {
  const storage = new Storage({ bucket })
  const buffer = await storage.toBuffer(
    Readable.from('foo', { objectMode: true }),
  )

  expect(buffer).toBeInstanceOf(Buffer)
  expect(buffer.toString()).toBe('foo')
})

test('toBuffer returns a buffer from Readable with objectMode false', async () => {
  const storage = new Storage({ bucket })
  const buffer = await storage.toBuffer(
    Readable.from('foo', { objectMode: false }),
  )

  expect(buffer).toBeInstanceOf(Buffer)
  expect(buffer.toString()).toBe('foo')
})
