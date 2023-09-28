import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'
import { test } from 'node:test'

import { Storage } from '@storagebus/storage'
import { BusFile } from '@storagebus/storage/file'
import { createStorage, Storage as MemoryStorage } from '../src/memory.js'

test('memory', async () => {
  const storage = createStorage({})

  const storageWithDebug = createStorage({
    debug: true,
  })

  await test('create storage instance from the factory function', () => {
    assert.equal(storage instanceof Storage, true)
    assert.equal(storage instanceof MemoryStorage, true)
  })

  await test('create storage instance from the Storage class', () => {
    const storage = new MemoryStorage()
    assert.equal(storage instanceof Storage, true)
    assert.equal(storage instanceof MemoryStorage, true)
  })

  await test('create storage instance with custom sanitizeKey function', () => {
    const storage = createStorage({
      sanitizeKey: (key) => key,
    })

    assert.equal(storage instanceof Storage, true)
  })

  await test('create storage instance with wrong type for sanitizeKey param', () => {
    try {
      createStorage({
        // @ts-expect-error: testing wrong type
        sanitizeKey: '',
      })
    } catch (err) {
      assert.equal(err instanceof TypeError, true)
    }
  })

  await test('create storage instance with default sanitize function', () => {
    const storage = createStorage({
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

  await test('storage.file gets a File from Storagebus Memory', async () => {
    const key = randomUUID()
    await storage.write(key, Readable.from(key))
    const file = await storage.file(key)

    assert.equal(file instanceof BusFile, true)
  })

  await test('storage.file retruns an empty File on missing destination', async () => {
    const key = randomUUID()
    const file = await storage.file(key)

    assert.equal(file.size, 0)
  })

  await test('storage.write(key, null) removes a File from Storage', async () => {
    const key = randomUUID()
    await storage.write(key, Readable.from(key))
    await storage.write(key, null)

    assert.equal(await storage.exists(key), false)
  })

  await test('storage.write(File, File) copies a file to new destination', async () => {
    const key = randomUUID()
    await storage.write(key, Readable.from(key))
    const file1 = await storage.file(key)
    const file2 = await storage.write(await storage.file('new-key'), file1)

    assert.equal(await storage.exists(file1), true, 'file1 exists')
    assert.equal(await storage.exists(file2), true, 'file2 exists')
  })

  await test('consumes multiple times a stream', async () => {
    const key = randomUUID()
    await storage.write(key, Readable.from(key))
    const file1 = await storage.file(key)

    let count = 0
    for await (const chunk of await file1.stream()) {
      count++
      assert.equal(chunk.toString(), key)
    }
    for await (const chunk of await file1.stream()) {
      count++
      assert.equal(chunk.toString(), key)
    }
    assert.equal(count, 2)
  })

  await test('logs the error when in debug mode', async () => {
    try {
      await storageWithDebug.exists('foobar')
    } catch (err) {
      assert.deepEqual(err, {})
    }
  })
})
