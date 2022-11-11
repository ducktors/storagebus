import { expect, test } from 'vitest'
import { Storage } from './abstract-storage'

test('constructs abstract storage', () => {
  // @ts-expect-error: testing wrong type
  const storage = new Storage()
  expect(storage).instanceOf(Storage)
})

test('constructs abstract storage in debug mode', () => {
  // @ts-expect-error: testing wrong type
  const storage = new Storage({ debug: true })

  expect(storage._debug).toBe(true)
})

test('abstract storage uses custom logger', () => {
  // @ts-expect-error: testing wrong type
  const storage = new Storage({ debug: true, logger: { info: 'foo' } })

  expect(storage._logger).toEqual({ info: 'foo' })
})
