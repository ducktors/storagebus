import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Storage, Driver } from '../src/storage.js'
import { BusFile } from '../src/file.js'
import { Readable } from 'node:stream'

function inMemoryDriver(): Driver {
  const storage = new Map<string, BusFile>()
  return {
    async set(destination, data) {
      storage.set(destination, data)
      return destination
    },
    async get(path) {
      return storage.get(path)?.buffer() ?? null
    },
    async has(path) {
      return storage.has(path)
    },
    async getMetadata(path) {
      const data = storage.get(path)

      if (!data) {
        return {}
      }
      return {
        size: (await data.buffer()).length,
      }
    },
    async delete(path) {
      storage.delete(path)
    },
  }
}

test('@storagebus/storage', async () => {
  const storage = new Storage(inMemoryDriver())
  await test('creates an instance of Storage', () => {
    assert.equal(storage instanceof Storage, true)
  })

  await test('creates an instance of Storage in debug mode', () => {
    const storage = new Storage(inMemoryDriver(), { debug: true })
    // @ts-expect-error: testing wrong type
    assert.equal(storage._debug, true)
  })

  await test('creates an instance of Storage with a custom logger', () => {
    const storage = new Storage(inMemoryDriver(), {
      debug: true,
      // @ts-expect-error: testing wrong type
      logger: { info: 'foo' },
    })
    // @ts-expect-error: testing wrong type
    assert.deepEqual(storage._logger, { info: 'foo' })
  })

  await test('creates an instance of Storage with a custom sanitizeKey function', () => {
    const storage = new Storage(inMemoryDriver(), {
      sanitizeKey: (key: string) => key,
    })
    assert.equal(storage instanceof Storage, true)
  })

  await test('creates storage instance with wrong type for sanitizeKey param', () => {
    try {
      new Storage(inMemoryDriver(), {
        // @ts-expect-error: testing wrong type
        sanitizeKey: '',
      })
    } catch (err) {
      assert.equal(err instanceof TypeError, true)
    }
  })

  await test('creates storage instance with default sanitize function', () => {
    const storage = new Storage(inMemoryDriver(), {
      sanitizeKey: true,
    })
    assert.equal(storage instanceof Storage, true)
  })

  await test('re-exports BusFile from @storagebus/file', () => {
    const file = new BusFile('foo', 'bar')
    assert.equal(file instanceof BusFile, true)
  })

  await test('write() returns the destination path', async () => {
    const result = await storage.write('foo', 'bar')
    assert.equal(result, 'foo')
    assert.equal((await storage.file(result)) instanceof BusFile, true)
  })

  await test('write() returns the destination path with a custom sanitize function', async () => {
    const storage = new Storage(inMemoryDriver(), {
      sanitizeKey: (key: string) => 'key',
    })
    const result = await storage.write('foo', 'bar')
    assert.equal(result, 'key')
    assert.equal((await storage.file(result)) instanceof BusFile, true)
  })

  await test('write() writes a BusFile', async () => {
    const file = new BusFile('BusFile', 'BusFile')
    const result = await storage.write(file, file)
    assert.equal(result, 'BusFile')
    assert.equal((await storage.file(result)) instanceof BusFile, true)
  })

  await test('write() writes a Readable', async () => {
    const fileName = 'Readable'

    const result = await storage.write(fileName, Readable.from(fileName))
    assert.equal(result, 'Readable')
    assert.equal((await storage.file(result)) instanceof BusFile, true)
  })

  await test('write() writes a Buffer', async () => {
    const fileName = 'Buffer'

    const result = await storage.write(fileName, Buffer.from(fileName))
    assert.equal(result, 'Buffer')
    assert.equal((await storage.file(result)) instanceof BusFile, true)
  })

  await test('write() writes a string', async () => {
    const fileName = 'string'

    const result = await storage.write(fileName, fileName)
    assert.equal(result, 'string')
    assert.equal((await storage.file(result)) instanceof BusFile, true)
  })

  await test('write() null creates an empty file', async () => {
    const fileName = 'null'

    const result = await storage.write(fileName, null)
    assert.equal(result, 'null')
    const file = await storage.file(result)
    assert.equal(file.size, 0)
  })

  await test('exits() returns true if a file exits at the path', async () => {
    const fileName = 'exists'

    await storage.write(fileName, fileName)
    assert.equal(await storage.exists(fileName), true)
  })

  await test('exits() returns true if a BusFile exits', async () => {
    const file = new BusFile('fileName', 'fileName')

    await storage.write(file.name, file)
    assert.equal(await storage.exists(file), true)
  })

  await test('exits() returns false if a file does not exits at the path', async () => {
    const fileName = 'does-not-exist'

    assert.equal(await storage.exists(fileName), false)
  })
})
