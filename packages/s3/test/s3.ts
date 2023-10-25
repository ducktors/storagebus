import { complianceTest } from '@storagebus/storage/compliance-test'
import { createStorage } from '@storagebus/s3'
import assert from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { test } from 'node:test'
import S3erver from 's3rver'

const accessKeyId = 'S3RVER'
const secretAccessKey = 'S3RVER'
const bucket = 'test-bucket'
const region = 'us-west-1'

const server = new S3erver({
  directory: tmpdir(),
  silent: true,
  configureBuckets: [
    {
      name: bucket,
    },
  ],
})
server.run((err: Error) => {
  assert.equal(err, null)
  test('s3', async (t) => {
    await t.test('Compliance test', async () => {
      const storage = createStorage({
        region,
        bucket,
        accessKeyId,
        secretAccessKey,
        endpoint: 'http://localhost:4568',
      })
      await complianceTest(storage)
    })
    t.after(() => {
      server.close()
    })
  })
})
