import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'

import {
  CreateMultipartUploadCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  UploadPartCommand,
} from '@aws-sdk/client-s3'
import { mockClient } from 'aws-sdk-client-mock'
import { beforeEach, expect, test, vi } from 'vitest'
import { Storage as AbstractStorage } from '@ducktors/storagebus-abstract'

import { Storage } from './s3'

const accessKeyId = 'my-access-key-id'
const secretAccessKey = 'my-secret-access-key'
const bucket = 'test-bucket'
const region = 'us-west-1'

const storage = new Storage({
  bucket,
  accessKeyId,
  secretAccessKey,
  region,
})

const storageWithDebug = new Storage({
  bucket,
  accessKeyId,
  secretAccessKey,
  region,
  debug: true,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const s3Mock = mockClient((storage as any).client)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const s3MockWithDebug = mockClient((storageWithDebug as any).client)

beforeEach(() => {
  s3Mock.reset()
})

test('create storage instance', () => {
  expect(storage).toBeInstanceOf(Storage)
})

test('storage instance extends from AbstractStorage', () => {
  expect(storage).toBeInstanceOf(AbstractStorage)
})

test('create storage instance with custom sanitizeKey function', () => {
  const storage = new Storage({
    bucket,
    accessKeyId,
    secretAccessKey,
    region,
    sanitizeKey: key => key,
  })

  expect(storage).toBeInstanceOf(Storage)
})

test('create storage instance with wrong type for sanitizeKey param', () => {
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
    expect(err).toBeInstanceOf(TypeError)
  }
})

test('create storage instance with default sanitize function', () => {
  const storage = new Storage({
    bucket,
    accessKeyId,
    secretAccessKey,
    region,
    sanitizeKey: true,
  })
  expect(storage).toBeInstanceOf(Storage)
})

test('storage.write a Readable to s3 bucket', async () => {
  s3Mock.on(PutObjectCommand).resolves({})
  s3Mock.on(HeadObjectCommand).resolves({})

  const key = randomUUID()
  await storage.write(key, Readable.from(key))

  expect(await storage.exists(key)).toBe(true)
})

test('storage.write rethrows on error', async () => {
  const error = 'generic error'
  s3Mock.on(PutObjectCommand).rejects(error)

  const key = randomUUID()

  await expect(() => storage.write(key, Readable.from(key))).rejects.toThrow(error)
})

test('storage.write a multipart Readable to s3 bucket', async () => {
  s3Mock.on(CreateMultipartUploadCommand).resolves({ UploadId: '1' })
  s3Mock.on(UploadPartCommand).resolves({ ETag: '1' })

  const key = randomUUID()
  await storage.write(key, Readable.from(key.repeat(6 * 1024 * 1024)))

  expect(await storage.exists(key)).toBe(true)
})

test('storage.write a Readable to s3 bucket and calls the progress function', async () => {
  s3Mock.on(PutObjectCommand).resolves({})

  const progress = vi.fn()
  const key = randomUUID()
  await storage.write(key, Readable.from(key), {
    progress,
  })

  expect(progress).toBeCalled()
})

test('storage.write a Readable to s3 bucket with ContentType set', async () => {
  const key = `${randomUUID()}.pdf`
  const returnedKey = await storage.write(key, Readable.from(key))

  expect(await storage.exists(key)).toBe(true)
  expect(returnedKey).toEqual(key)
})

test('storage.read reads a file from s3 bucket', async () => {
  s3Mock.on(GetObjectCommand).resolves({ Body: Readable.from('key') })

  const key = randomUUID()
  await storage.write(key, Readable.from(key))
  const file = await storage.read(key)

  expect(file).toBeInstanceOf(Readable)
})

test('storage.read throws on missing key', async () => {
  s3Mock.on(GetObjectCommand).resolves({ Body: undefined })

  const key = randomUUID()
  await storage.write(key, Readable.from(key))
  await expect(() => storage.read(key)).rejects.toThrow(`Missing ${key} from ${bucket}`)
})

test('storage.remove removes key from s3 bucket', async () => {
  s3Mock.on(HeadObjectCommand).rejects({})

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
  const newKey = await storage.copy(objectKey, 'new-key')

  expect(await storage.exists(objectKey)).toBe(true)
  expect(await storage.exists(newKey)).toBe(true)
})

test('storage.move moves a file to a new location', async () => {
  const key = randomUUID()

  const objectKey = await storage.write(key, Readable.from(key))
  const newKey = await storage.move(objectKey, 'new-key')
  s3Mock.on(HeadObjectCommand).rejects({})
  expect(await storage.exists(objectKey)).toBe(false)
  s3Mock.reset()
  expect(await storage.exists(newKey)).toBe(true)
})

test(`Creates storage using env vars`, () => {
  const storage = new Storage()
  expect(storage).toBeInstanceOf(Storage)
})

test('logs the error when in debug mode', async () => {
  s3MockWithDebug.on(HeadObjectCommand).rejects({})

  try {
    await storageWithDebug.exists('foobar')
  } catch (err) {
    expect(err).toEqual({})
  }
})

test('toBuffer returns a buffer from Readable with objectMode true', async () => {
  const storage = new Storage({ bucket })
  const buffer = await storage.toBuffer(Readable.from('foo', { objectMode: true }))

  expect(buffer).toBeInstanceOf(Buffer)
  expect(buffer.toString()).toBe('foo')
})

test('toBuffer returns a buffer from Readable with objectMode false', async () => {
  const storage = new Storage({ bucket })
  const buffer = await storage.toBuffer(Readable.from('foo', { objectMode: false }))

  expect(buffer).toBeInstanceOf(Buffer)
  expect(buffer.toString()).toBe('foo')
})
