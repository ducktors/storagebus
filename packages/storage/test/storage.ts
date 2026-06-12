import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { test } from 'node:test'

import { type Adapter, Storage } from '@storagebus/storage'
import { complianceTest } from '@storagebus/storage/compliance-test'
import { ENOENT } from '@storagebus/storage/errors'

interface StorageObject {
  lastModified: number
  size: number
  data: Buffer
  type: string
}

function createTestAdapter(): Adapter {
  const storage = new Map<string, StorageObject>()

  return {
    async set(file) {
      const buffer = await file.buffer()
      storage.set(file.name, {
        lastModified: Date.now(),
        size: buffer.length,
        data: buffer,
        type: file.type,
      })
      return file.name
    },
    async get(key) {
      return () => {
        const buffer = storage.get(key)?.data
        if (!buffer) {
          throw new ENOENT(key)
        }
        return Readable.from(buffer)
      }
    },
    async metadata(key) {
      const data = storage.get(key)

      if (!data) {
        return {
          size: 0,
          lastModified: -1,
        }
      }

      return {
        size: data.size,
        lastModified: data.lastModified,
        type: data.type,
      }
    },
    async delete(key) {
      storage.delete(key)
    },
  }
}

test('@storagebus/storage', async () => {
  await test('Constructor', async () => {
    const storage = new Storage(createTestAdapter())

    await test('creates an instance of Storage', () => {
      assert.equal(storage instanceof Storage, true)
    })

    await test('creates an instance of Storage in debug mode', () => {
      const storage = new Storage(createTestAdapter(), { debug: true })
      // @ts-expect-error: testing wrong type
      assert.equal(storage._debug, true)
    })

    await test('creates an instance of Storage with a custom logger', () => {
      const storage = new Storage(createTestAdapter(), {
        debug: true,
        // @ts-expect-error: testing wrong type
        logger: { info: 'foo' },
      })
      // @ts-expect-error: testing wrong type
      assert.deepEqual(storage._logger, { info: 'foo' })
    })

    await test('creates an instance of Storage with a custom sanitizeKey function', () => {
      const storage = new Storage(createTestAdapter(), {
        sanitizeKey: (key: string) => key,
      })
      assert.equal(storage instanceof Storage, true)
    })

    await test('creates storage instance with wrong type for sanitizeKey param', () => {
      try {
        new Storage(createTestAdapter(), {
          // @ts-expect-error: testing wrong type
          sanitizeKey: '',
        })
      } catch (err) {
        assert.equal(err instanceof TypeError, true)
      }
    })

    await test('creates storage instance with default sanitize function', () => {
      const storage = new Storage(createTestAdapter(), {
        sanitizeKey: true,
      })
      assert.equal(storage instanceof Storage, true)
    })
  })

  await test('Compliance test', async () => {
    const storage = new Storage(createTestAdapter())
    await complianceTest(storage)
  })

  await test('throws when a POJO is passed as data to write method', async () => {
    const storage = new Storage(createTestAdapter())
    await assert.rejects(
      () => storage.write('foo', { foo: 'bar' } as any),
      (err) => {
        if (!(err instanceof TypeError)) return false
        assert.strictEqual(
          err.message,
          'Invalid data: must be a string, Buffer, function returning Readable, BusFile or null.',
        )
        return true
      },
    )
  })

  await test('throws when an invalid Object Key is passed as destination to write method', async () => {
    const storage = new Storage(createTestAdapter())
    await assert.rejects(
      () => storage.write('../bar', 'bar'),
      (err) => {
        if (!(err instanceof TypeError)) return false
        assert.strictEqual(
          err.message,
          'Invalid Object Key: must not contain empty, dot, or dot-dot segments.',
        )
        return true
      },
    )
  })

  await test('validates Object Key syntax after sanitizing', async () => {
    const storage = new Storage(createTestAdapter(), {
      sanitizeKey: (key: string) => key.replaceAll(' ', '-'),
    })

    assert.equal(
      await storage.write('hello world.txt', 'bar'),
      'hello-world.txt',
    )
    await assert.rejects(
      () => storage.write('/hello.txt', 'bar'),
      /Invalid Object Key: must be a POSIX-style relative key\./,
    )
  })
})
