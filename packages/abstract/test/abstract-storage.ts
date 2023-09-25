import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { test } from 'node:test'

import { Storage } from '../src/abstract-storage.js'

test('abstract', async () => {
  await test('constructs abstract storage', () => {
    // @ts-expect-error: testing wrong type
    const storage = new Storage()
    assert.equal(storage instanceof Storage, true)
  })

  await test('constructs abstract storage in debug mode', () => {
    // @ts-expect-error: testing wrong type
    const storage = new Storage({ debug: true })
    assert.equal(storage._debug, true)
  })

  await test('abstract storage uses custom logger', () => {
    // @ts-expect-error: testing wrong type
    const storage = new Storage({ debug: true, logger: { info: 'foo' } })
    assert.deepEqual(storage._logger, { info: 'foo' })
  })

  await test('toBuffer returns a buffer from Readable with objectMode true', async () => {
    // @ts-expect-error: testing wrong type
    const storage = new Storage()
    const buffer = await storage.toBuffer(
      Readable.from('foo', { objectMode: true }),
    )
    assert.equal(buffer instanceof Buffer, true)
    assert.equal(buffer.toString(), 'foo')
  })

  await test('toBuffer returns a buffer from Readable with objectMode false', async () => {
    // @ts-expect-error: testing wrong type
    const storage = new Storage()
    const buffer = await storage.toBuffer(
      Readable.from('foo', { objectMode: false }),
    )
    assert.equal(buffer instanceof Buffer, true)
    assert.equal(buffer.toString(), 'foo')
  })

  await test('create storage instance with custom sanitizeKey function', () => {
    // @ts-expect-error: testing wrong type
    const storage = new Storage({
      sanitizeKey: (key: string) => key,
    })
    assert.equal(storage instanceof Storage, true)
  })

  await test('create storage instance with wrong type for sanitizeKey param', () => {
    try {
      // @ts-expect-error: testing wrong type
      new Storage({
        sanitizeKey: '',
      })
    } catch (err) {
      assert.equal(err instanceof TypeError, true)
    }
  })

  await test('create storage instance with default sanitize function', () => {
    // @ts-expect-error: testing wrong type
    const storage = new Storage({
      sanitizeKey: true,
    })
    assert.equal(storage instanceof Storage, true)
  })
})
