import assert from 'node:assert/strict'
import { test } from 'node:test'
import { sanitize } from '../src/sanitize-key.js'

test('abstract sanitize key', async () => {
  await test('trying to sanitize values that are not strings, not numbers or empty strings results in an error', () => {
    // @ts-expect-error: testing wrong type
    assert.throws(() => sanitize(null), Error)
    // @ts-expect-error: testing wrong type
    assert.throws(() => sanitize(undefined), Error)
    assert.throws(() => sanitize(NaN), Error)
    assert.throws(() => sanitize(''), Error)
    // @ts-expect-error: testing wrong type
    assert.throws(() => sanitize({}), Error)
    // @ts-expect-error: testing wrong type
    assert.throws(() => sanitize([]), Error)
    // @ts-expect-error: testing wrong type
    assert.throws(() => sanitize([2]), Error)
  })

  await test('valid object keys should remain the same', () => {
    const objectKey = 'my.great_photos-2014/jan/myvacation.jpg'
    assert.equal(sanitize(objectKey), objectKey)
  })

  await test('spaces are removed', () => {
    const objectKey = '   my.great_photos 2014/jan/myvacation.jpg    '
    assert.equal(sanitize(objectKey), 'my.great_photos-2014/jan/myvacation.jpg')
  })

  await test('numbers should be converted to strings', () => {
    assert.equal(sanitize(123), '123')
    assert.equal(sanitize(Number(123)), '123')
  })

  await test('"123#@%$^&@456!-)+=*_" should be sanitized to "123456!-)*_"', () =>
    assert.equal(sanitize('123#@%$^&@456!-)+=*_'), '123456!-)*_'))

  await test('"áêīòü" should be sanitized to "aeiou"', () =>
    assert.equal(sanitize('áêīòü'), 'aeiou'))

  await test('spaces are replaced with the provided separator or the default', () => {
    assert.equal(sanitize('test test test'), 'test-test-test')
    assert.equal(sanitize('test test test', '/'), 'test/test/test')
  })

  await test('an error is thrown if the requested separator is not valid', () => {
    assert.throws(() => sanitize('test test test', '|'), Error)
    // @ts-expect-error: testing wrong type
    assert.throws(() => sanitize('test test test', null), Error)
    assert.throws(() => sanitize('test test test', '~'), Error)
  })
})
