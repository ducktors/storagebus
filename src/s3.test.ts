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

import { Storage } from './abstract-storage'
import { S3Storage } from './s3'

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const s3Mock = mockClient((s3Storage as any).client)

beforeEach(() => {
  s3Mock.reset()
})

test('create LocalStorage instance', () => {
  expect(s3Storage).toBeInstanceOf(S3Storage)
})

test('LocalStorage instance extends from Storage', () => {
  expect(s3Storage).toBeInstanceOf(Storage)
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

test(`Creates S3Storage using env vars`, () => {
  const storage = new S3Storage()
  expect(storage).toBeInstanceOf(S3Storage)
})
