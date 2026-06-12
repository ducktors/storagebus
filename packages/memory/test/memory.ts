import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createAdapter } from '@storagebus/memory'
import { Storage } from '@storagebus/storage'
import { complianceTest } from '@storagebus/storage/compliance-test'

test('memory', async (t) => {
  await t.test('creates storage instance', () => {
    const storage = new Storage(createAdapter())

    assert.equal(storage instanceof Storage, true)
  })

  await t.test('Compliance test', async () => {
    const storage = new Storage(createAdapter())

    await complianceTest(storage)
  })
})
