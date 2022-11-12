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

import { Storage } from '../abstract-storage'
import { S3Storage } from './'

const accessKeyId = 'my-access-key-id'
const secretAccessKey = 'my-secret-access-key'
const bucket = 'test-bucket'
const region = 'us-west-1'

const s3Storage = new S3Storage({
  bucket,
  accessKeyId,
  secretAccessKey,
  region,
})

const s3StorageWithDebug = new S3Storage({
  bucket,
  accessKeyId,
  secretAccessKey,
  region,
  debug: true,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const s3Mock = mockClient((s3Storage as any).client)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const s3MockWithDebug = mockClient((s3StorageWithDebug as any).client)

beforeEach(() => {
  s3Mock.reset()
})

test('create s3Storage instance', () => {
  expect(s3Storage).toBeInstanceOf(S3Storage)
})

test('s3Storage instance extends from Storage', () => {
  expect(s3Storage).toBeInstanceOf(Storage)
})

test('create s3Storage instance with custom sanitizeKey function', () => {
  const s3Storage = new S3Storage({
    bucket,
    accessKeyId,
    secretAccessKey,
    region,
    sanitizeKey: key => key,
  })

  expect(s3Storage).toBeInstanceOf(S3Storage)
})

test('create s3Storage instance with wrong type for sanitizeKey param', () => {
  try {
    new S3Storage({
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

test('create s3Storage instance with default sanitize function', () => {
  const s3Storage = new S3Storage({
    bucket,
    accessKeyId,
    secretAccessKey,
    region,
    sanitizeKey: true,
  })
  expect(s3Storage).toBeInstanceOf(S3Storage)
})

test('s3storage.write a Readable to s3 bucket', async () => {
  s3Mock.on(PutObjectCommand).resolves({})
  s3Mock.on(HeadObjectCommand).resolves({})

  const key = randomUUID()
  await s3Storage.write(key, Readable.from(key))

  expect(await s3Storage.exists(key)).toBe(true)
})

test('s3storage.write rethrows on error', async () => {
  const error = 'generic error'
  s3Mock.on(PutObjectCommand).rejects(error)

  const key = randomUUID()

  await expect(() => s3Storage.write(key, Readable.from(key))).rejects.toThrow(error)
})

test('s3storage.write a multipart Readable to s3 bucket', async () => {
  s3Mock.on(CreateMultipartUploadCommand).resolves({ UploadId: '1' })
  s3Mock.on(UploadPartCommand).resolves({ ETag: '1' })

  const key = randomUUID()
  await s3Storage.write(key, Readable.from(key.repeat(6 * 1024 * 1024)))

  expect(await s3Storage.exists(key)).toBe(true)
})

test('s3storage.write a Readable to s3 bucket and calls the progress function', async () => {
  s3Mock.on(PutObjectCommand).resolves({})

  const progress = vi.fn()
  const key = randomUUID()
  await s3Storage.write(key, Readable.from(key), {
    progress,
  })

  expect(progress).toBeCalled()
})

test('s3storage.write a Readable to s3 bucket with ContentType set', async () => {
  const key = `${randomUUID()}.pdf`
  const returnedKey = await s3Storage.write(key, Readable.from(key))

  expect(await s3Storage.exists(key)).toBe(true)
  expect(returnedKey).toEqual(key)
})

test('s3storage.read reads a file from s3 bucket', async () => {
  s3Mock.on(GetObjectCommand).resolves({ Body: Readable.from('key') })

  const key = randomUUID()
  await s3Storage.write(key, Readable.from(key))
  const file = await s3Storage.read(key)

  expect(file).toBeInstanceOf(Readable)
})

test('s3storage.read throws on missing key', async () => {
  s3Mock.on(GetObjectCommand).resolves({ Body: undefined })

  const key = randomUUID()
  await s3Storage.write(key, Readable.from(key))
  await expect(() => s3Storage.read(key)).rejects.toThrow(`Missing ${key} from ${bucket}`)
})

test('s3storage.remove removes key from s3 bucket', async () => {
  s3Mock.on(HeadObjectCommand).rejects({})

  const key = randomUUID()
  await s3Storage.write(key, Readable.from(key))
  await s3Storage.remove(key)

  expect(await s3Storage.exists(key)).toBe(false)
})

test('s3storage.copy copy a file to new location', async () => {
  const key = randomUUID()
  const objectKey = await s3Storage.write(key, Readable.from(key))
  const newKey = await s3Storage.copy(objectKey, 'new-key')

  expect(await s3Storage.exists(objectKey)).toBe(true)
  expect(await s3Storage.exists(newKey)).toBe(true)
})

test('s3storage.copy copy a file with ContentType set to new location', async () => {
  const key = `${randomUUID()}.jpeg`
  const objectKey = await s3Storage.write(key, Readable.from(key))
  const newKey = await s3Storage.copy(objectKey, 'new-key')

  expect(await s3Storage.exists(objectKey)).toBe(true)
  expect(await s3Storage.exists(newKey)).toBe(true)
})

test('s3storage.move moves a file to a new location', async () => {
  const key = randomUUID()

  const objectKey = await s3Storage.write(key, Readable.from(key))
  const newKey = await s3Storage.move(objectKey, 'new-key')
  s3Mock.on(HeadObjectCommand).rejects({})
  expect(await s3Storage.exists(objectKey)).toBe(false)
  s3Mock.reset()
  expect(await s3Storage.exists(newKey)).toBe(true)
})

test(`Creates S3Storage using env vars`, () => {
  const storage = new S3Storage()
  expect(storage).toBeInstanceOf(S3Storage)
})

test('logs the error when in debug mode', async () => {
  s3MockWithDebug.on(HeadObjectCommand).rejects({})

  try {
    await s3StorageWithDebug.exists('foobar')
  } catch (err) {
    expect(err).toEqual({})
  }
})
