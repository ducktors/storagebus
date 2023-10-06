import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ENOENT } from '@storagebus/file/errors'

test('@storagebus/file errors', async () => {
  await test('ENOENT has the correct code and message', () => {
    const error = new ENOENT('/path/to/file')
    assert.equal(error.code, 'ENOENT')
    assert.equal(error.message, "ENOENT: no such file, open '/path/to/file'")
  })

  await test('ENOENT has the correct errno and path properties', () => {
    const error = new ENOENT('/path/to/file')
    assert.equal(error.errno, -2)
    assert.equal(error.path, '/path/to/file')
  })
})
