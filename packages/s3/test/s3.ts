import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'
import { test } from 'node:test'

import {
  CreateMultipartUploadCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  UploadPartCommand,
} from '@aws-sdk/client-s3'
import { Storage as AbstractStorage } from '@ducktors/storagebus-abstract'
import { mockClient } from 'aws-sdk-client-mock'

import { Storage } from '../src/s3.js'

const accessKeyId = 'my-access-key-id'
const secretAccessKey = 'my-secret-access-key'
const bucket = 'test-bucket'
const region = 'us-west-1'

test('s3', async (t) => {
  const storage = new Storage({
    bucket,
    accessKeyId,
    secretAccessKey,
    region,
  })

  const s3Mock = mockClient((storage as any).client)

  t.beforeEach(() => {
    s3Mock.reset()
  })
  await test('create storage instance', () => {
    assert.equal(storage instanceof Storage, true)
  })

  await test('storage instance extends from AbstractStorage', () => {
    assert.equal(storage instanceof AbstractStorage, true)
  })

  await test('create storage instance with custom sanitizeKey function', () => {
    const storage = new Storage({
      bucket,
      accessKeyId,
      secretAccessKey,
      region,
      sanitizeKey: (key) => key,
    })

    assert.equal(storage instanceof Storage, true)
  })

  await test('create storage instance with wrong type for sanitizeKey param', () => {
    try {
      new Storage({
        bucket,
        accessKeyId,
        secretAccessKey,
        region,
        // @ts-expect-error: testing wrong type
        sanitizeKey: '',
      })
    } catch (err) {
      assert.equal(err instanceof TypeError, true)
    }
  })

  await test('create storage instance with default sanitize function', () => {
    const storage = new Storage({
      bucket,
      accessKeyId,
      secretAccessKey,
      region,
      sanitizeKey: true,
    })
    assert.equal(storage instanceof Storage, true)
  })

  await test('storage.write a Readable to s3 bucket', async () => {
    s3Mock.on(PutObjectCommand).resolves({})
    s3Mock.on(HeadObjectCommand).resolves({})

    const key = randomUUID()
    await storage.write(key, Readable.from(key))

    assert.equal(await storage.exists(key), true)
  })

  await test('storage.write rethrows on error', async () => {
    const error = 'generic error'
    s3Mock.on(PutObjectCommand).rejects(error)

    const key = randomUUID()

    await assert.rejects(
      () => storage.write(key, Readable.from(key)),
      Error(error),
    )
  })

  await test('storage.write a multipart Readable to s3 bucket', async () => {
    s3Mock.on(CreateMultipartUploadCommand).resolves({ UploadId: '1' })
    s3Mock.on(UploadPartCommand).resolves({ ETag: '1' })

    const key = randomUUID()
    await storage.write(key, Readable.from(key.repeat(6 * 1024 * 1024)))

    assert.equal(await storage.exists(key), true)
  })

  await test('storage.write a Readable to s3 bucket and calls the progress function', async (t) => {
    s3Mock.on(PutObjectCommand).resolves({})

    const progress = t.mock.fn()
    const key = randomUUID()
    await storage.write(key, Readable.from(key), {
      progress,
    })

    assert.equal(progress.mock.calls.length > 0, true)
  })

  await test('storage.write a Readable to s3 bucket with ContentType set', async () => {
    const key = `${randomUUID()}.pdf`
    const returnedKey = await storage.write(key, Readable.from(key))

    assert.equal(await storage.exists(key), true)
    assert.equal(returnedKey, key)
  })

  await test('storage.read reads a file from s3 bucket', async () => {
    s3Mock.on(GetObjectCommand).resolves({ Body: Readable.from('key') as any })

    const key = randomUUID()
    await storage.write(key, Readable.from(key))
    const file = await storage.read(key)

    assert.equal(file instanceof Readable, true)
  })

  await test('storage.read throws on missing key', async () => {
    s3Mock.on(GetObjectCommand).resolves({ Body: undefined })

    const key = randomUUID()
    await storage.write(key, Readable.from(key))
    await assert.rejects(
      () => storage.read(key),
      Error(`Missing ${key} from ${bucket}`),
    )
  })

  await test('storage.remove removes key from s3 bucket', async () => {
    s3Mock.on(HeadObjectCommand).rejects({})

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
    const newKey = await storage.copy(objectKey, 'new-key')

    assert.equal(await storage.exists(objectKey), true)
    assert.equal(await storage.exists(newKey), true)
  })

  await test('storage.copy copy a file to new location in another bucket', async () => {
    const key = randomUUID()
    const destBucket = 'test-dest-bucket'
    const objectKey = await storage.write(key, Readable.from(key))
    const newKey = await storage.copy(objectKey, 'new-key', { destBucket })

    const destStorage = new Storage({
      bucket: destBucket,
      accessKeyId,
      secretAccessKey,
      region,
    })

    mockClient((destStorage as any).client)

    assert.equal(await storage.exists(objectKey), true)
    assert.equal(await destStorage.exists(newKey), true)
  })

  await test('storage.move moves a file to a new location', async () => {
    const key = randomUUID()

    const objectKey = await storage.write(key, Readable.from(key))
    const newKey = await storage.move(objectKey, 'new-key')
    s3Mock.on(HeadObjectCommand).rejects({})
    assert.equal(await storage.exists(objectKey), false)
    s3Mock.reset()
    assert.equal(await storage.exists(newKey), true)
  })

  await test('Creates storage using env vars', () => {
    const storage = new Storage({ bucket: 'test-bucket' })
    assert.equal(storage instanceof Storage, true)
  })

  await test('toBuffer returns a buffer from Readable with objectMode true', async () => {
    const storage = new Storage({ bucket })
    const buffer = await storage.toBuffer(
      Readable.from('foo', { objectMode: true }),
    )

    assert.equal(buffer instanceof Buffer, true)
    assert.equal(buffer.toString(), 'foo')
  })

  await test('toBuffer returns a buffer from Readable with objectMode false', async () => {
    const storage = new Storage({ bucket })
    const buffer = await storage.toBuffer(
      Readable.from('foo', { objectMode: false }),
    )

    assert.equal(buffer instanceof Buffer, true)
    assert.equal(buffer.toString(), 'foo')
  })
})

test('s3 with debug mode', async () => {
  const storageWithDebug = new Storage({
    bucket,
    accessKeyId,
    secretAccessKey,
    region,
    debug: true,
  })

  const s3MockWithDebug = mockClient((storageWithDebug as any).client)
  await test('logs the error when in debug mode', async () => {
    s3MockWithDebug.on(HeadObjectCommand).rejects({})

    try {
      await storageWithDebug.exists('foobar')
    } catch (err) {
      assert.deepEqual(err, {})
    }
  })
})
