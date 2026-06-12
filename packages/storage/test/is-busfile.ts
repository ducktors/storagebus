import assert from 'node:assert/strict'
import { test } from 'node:test'

import { BusFile, isBusFile } from '@storagebus/storage/file'

test('@storagebus/file isBusFile', async () => {
  await test('isBusFile returns true for BusFile', () => {
    const file = new BusFile('hello', 'hello.txt')
    assert.equal(isBusFile(file), true, 'isBusFile returns true for BusFile')
  })

  await test('isBusFile returns false for non-BusFile', () => {
    assert.equal(isBusFile(''), false, 'isBusFile returns false for string')
    assert.equal(isBusFile(false), false, 'isBusFile returns false for string')
    assert.equal(isBusFile({}), false, 'isBusFile returns false for string')
    assert.equal(isBusFile(null), false, 'isBusFile returns false for string')
    assert.equal(
      isBusFile(undefined),
      false,
      'isBusFile returns false for string',
    )
    assert.equal(isBusFile(1), false, 'isBusFile returns false for string')
    assert.equal(isBusFile([]), false, 'isBusFile returns false for string')
    assert.equal(
      isBusFile(Buffer.from('')),
      false,
      'isBusFile returns false for string',
    )
  })
})
