import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'

import { Storage as AbstractStorage } from '@ducktors/storagebus-abstract'
import { expect, test } from 'vitest'

import { Storage } from './memory'

const storage = new Storage({})

const storageWithDebug = new Storage({
  debug: true,
})

test('create storage instance', () => {
  expect(storage).toBeInstanceOf(Storage)
})

test('storage instance extends from AbstractStorage', () => {
  expect(storage).toBeInstanceOf(AbstractStorage)
})

test('create storage instance with custom sanitizeKey function', () => {
  const storage = new Storage({
    sanitizeKey: (key) => key,
  })

  expect(storage).toBeInstanceOf(Storage)
})

test('create storage instance with wrong type for sanitizeKey param', () => {
  try {
    new Storage({
      // @ts-expect-error: testing wrong type
      sanitizeKey: '',
    })
  } catch (err) {
    expect(err).toBeInstanceOf(TypeError)
  }
})

test('create storage instance with default sanitize function', () => {
  const storage = new Storage({
    sanitizeKey: true,
  })
  expect(storage).toBeInstanceOf(Storage)
})

test('storage.write a Readable to Storagebus Memory', async () => {
  const key = randomUUID()
  await storage.write(key, Readable.from(key))

  expect(await storage.exists(key)).toBe(true)
})

test('storage.write a multipart Readable to Storagebus Memory', async () => {
  const key = randomUUID()
  await storage.write(key, Readable.from(key.repeat(6 * 1024 * 1024)))

  expect(await storage.exists(key)).toBe(true)
})

test('storage.read reads a file from Storagebus Memory', async () => {
  const key = randomUUID()
  await storage.write(key, Readable.from(key))
  const file = await storage.read(key)

  expect(file).toBeInstanceOf(Readable)
})

test('storage.read throws on missing key', async () => {
  const key = randomUUID()

  await expect(() => storage.read(key)).rejects.toThrow(
    `Missing ${key} from Storagebus Memory`,
  )
})

test('storage.remove removes key from Storagebus Memory', async () => {
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

test('storage.move moves a file to a new location', async () => {
  const key = randomUUID()
  const objectKey = await storage.write(key, Readable.from(key))
  const newKey = await storage.move(objectKey, 'new-key')

  expect(await storage.exists(objectKey)).toBe(false)
  expect(await storage.exists(newKey)).toBe(true)
})

test('logs the error when in debug mode', async () => {
  try {
    await storageWithDebug.exists('foobar')
  } catch (err) {
    expect(err).toEqual({})
  }
})

test('toBuffer returns a buffer from Readable with objectMode true', async () => {
  const storage = new Storage({})
  const buffer = await storage.toBuffer(
    Readable.from('foo', { objectMode: true }),
  )

  expect(buffer).toBeInstanceOf(Buffer)
  expect(buffer.toString()).toBe('foo')
})

test('toBuffer returns a buffer from Readable with objectMode false', async () => {
  const storage = new Storage({})
  const buffer = await storage.toBuffer(
    Readable.from('foo', { objectMode: false }),
  )

  expect(buffer).toBeInstanceOf(Buffer)
  expect(buffer.toString()).toBe('foo')
})
