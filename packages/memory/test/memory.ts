import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'
import { test } from 'node:test'

import { Storage as AbstractStorage } from '@ducktors/storagebus-abstract'
import { Storage } from '../src/memory.js'

test('memory', async () => {
  const storage = new Storage({})

  const storageWithDebug = new Storage({
    debug: true,
  })

  await test('create storage instance', () => {
    assert.equal(storage instanceof Storage, true)
  })

  await test('storage instance extends from AbstractStorage', () => {
    assert.equal(storage instanceof AbstractStorage, true)
  })

  await test('create storage instance with custom sanitizeKey function', () => {
    const storage = new Storage({
      sanitizeKey: (key) => key,
    })

    assert.equal(storage instanceof Storage, true)
  })

  await test('create storage instance with wrong type for sanitizeKey param', () => {
    try {
      new Storage({
        // @ts-expect-error: testing wrong type
        sanitizeKey: '',
      })
    } catch (err) {
      assert.equal(err instanceof TypeError, true)
    }
  })

  await test('create storage instance with default sanitize function', () => {
    const storage = new Storage({
      sanitizeKey: true,
    })
    assert.equal(storage instanceof Storage, true)
  })

  await test('storage.write a Readable to Storagebus Memory', async () => {
    const key = randomUUID()
    await storage.write(key, Readable.from(key))

    assert.equal(await storage.exists(key), true)
  })

  await test('storage.write a multipart Readable to Storagebus Memory', async () => {
    const key = randomUUID()
    await storage.write(key, Readable.from(key.repeat(6 * 1024 * 1024)))

    assert.equal(await storage.exists(key), true)
  })

  await test('storage.read reads a file from Storagebus Memory', async () => {
    const key = randomUUID()
    await storage.write(key, Readable.from(key))
    const file = await storage.read(key)

    assert.equal(file instanceof Readable, true)
  })

  await test('storage.read throws on missing key', async () => {
    const key = randomUUID()

    await assert.rejects(
      () => storage.read(key),
      Error(`Missing ${key} from Storagebus Memory`),
    )
  })

  await test('storage.remove removes key from Storagebus Memory', async () => {
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

  await test('storage.move moves a file to a new location', async () => {
    const key = randomUUID()
    const objectKey = await storage.write(key, Readable.from(key))
    const newKey = await storage.move(objectKey, 'new-key')

    assert.equal(await storage.exists(objectKey), false)
    assert.equal(await storage.exists(newKey), true)
  })

  await test('logs the error when in debug mode', async () => {
    try {
      await storageWithDebug.exists('foobar')
    } catch (err) {
      assert.deepEqual(err, {})
    }
  })

  await test('toBuffer returns a buffer from Readable with objectMode true', async () => {
    const storage = new Storage({})
    const buffer = await storage.toBuffer(
      Readable.from('foo', { objectMode: true }),
    )

    assert.equal(buffer instanceof Buffer, true)
    assert.equal(buffer.toString(), 'foo')
  })

  await test('toBuffer returns a buffer from Readable with objectMode false', async () => {
    const storage = new Storage({})
    const buffer = await storage.toBuffer(
      Readable.from('foo', { objectMode: false }),
    )

    assert.equal(buffer instanceof Buffer, true)
    assert.equal(buffer.toString(), 'foo')
  })
})
