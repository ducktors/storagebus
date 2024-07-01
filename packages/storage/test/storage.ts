import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Storage } from '@storagebus/storage'
import { complianceTest } from '@storagebus/storage/compliance-test'
import { createStorage, driver } from '@storagebus/storage/memory'

test('@storagebus/storage', async () => {
  await test('Constructor', async () => {
    const storage = new Storage(driver())

    await test('creates an instance of Storage', () => {
      assert.equal(storage instanceof Storage, true)
    })

    await test('create storage instance from factory function', () => {
      const storage = createStorage()
      assert.equal(storage instanceof Storage, true)
    })

    await test('creates an instance of Storage in debug mode', () => {
      const storage = new Storage(driver(), { debug: true })
      // @ts-expect-error: testing wrong type
      assert.equal(storage._debug, true)
    })

    await test('creates an instance of Storage with a custom logger', () => {
      const storage = new Storage(driver(), {
        debug: true,
        // @ts-expect-error: testing wrong type
        logger: { info: 'foo' },
      })
      // @ts-expect-error: testing wrong type
      assert.deepEqual(storage._logger, { info: 'foo' })
    })

    await test('creates an instance of Storage with a custom sanitizeKey function', () => {
      const storage = new Storage(driver(), {
        sanitizeKey: (key: string) => key,
      })
      assert.equal(storage instanceof Storage, true)
    })

    await test('creates storage instance with wrong type for sanitizeKey param', () => {
      try {
        new Storage(driver(), {
          // @ts-expect-error: testing wrong type
          sanitizeKey: '',
        })
      } catch (err) {
        assert.equal(err instanceof TypeError, true)
      }
    })

    await test('creates storage instance with default sanitize function', () => {
      const storage = new Storage(driver(), {
        sanitizeKey: true,
      })
      assert.equal(storage instanceof Storage, true)
    })
  })

  await test('Compliance test', async () => {
    const storage = new Storage(driver())
    await complianceTest(storage)
  })

  await test('throws when a POJO is passed as data to write method', async () => {
    const storage = new Storage(driver())
    await assert.rejects(
      () => storage.write('foo', { foo: 'bar' } as any),
      (err) => {
        if (!(err instanceof TypeError)) return false
        assert.strictEqual(
          err.message,
          'Invalid data: must be a string, Buffer, Readable, BusFile or null.',
        )
        return true
      },
    )
  })

  await test('throws when an empty strng is passed as destination to write method', async () => {
    const storage = new Storage(driver())
    await assert.rejects(
      () => storage.write('', 'bar'),
      (err) => {
        if (!(err instanceof TypeError)) return false
        assert.strictEqual(
          err.message,
          'Invalid destination: must be a non-empty string or BusFile.',
        )
        return true
      },
    )
  })
})
