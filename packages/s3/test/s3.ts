import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'
import { test } from 'node:test'
import type {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { createStorage } from '@storagebus/s3'
import { complianceTest } from '@storagebus/storage/compliance-test'

const accessKeyId = 'S3RVER'
const secretAccessKey = 'S3RVER'
const bucket = 'test-bucket'
const region = 'us-west-1'

type StorageObject = {
  body: Buffer
  contentType?: string
  lastModified: Date
}

class MockS3Client {
  objects = new Map<string, StorageObject>()

  async send(
    command: GetObjectCommand | HeadObjectCommand | DeleteObjectCommand,
  ) {
    const key = command.input.Key as string
    const commandName = command.constructor.name

    if (commandName === 'GetObjectCommand') {
      const object = this.objects.get(key)
      if (!object) {
        const error = new Error('NoSuchKey')
        error.name = 'NoSuchKey'
        throw error
      }

      return { Body: Readable.from(object.body) }
    }

    if (commandName === 'HeadObjectCommand') {
      const object = this.objects.get(key)
      if (!object) {
        throw new Error('NotFound')
      }

      return {
        ContentLength: object.body.length,
        ContentType: object.contentType,
        LastModified: object.lastModified,
      }
    }

    this.objects.delete(key)
    return {}
  }
}

async function toBuffer(body: unknown): Promise<Buffer> {
  if (Buffer.isBuffer(body)) {
    return body
  }

  if (typeof body === 'string') {
    return Buffer.from(body)
  }

  if (body instanceof Readable) {
    const chunks = await body.toArray()
    return Buffer.concat(
      chunks.map((chunk) => {
        if (Buffer.isBuffer(chunk)) {
          return chunk
        }

        if (typeof chunk === 'number') {
          return Buffer.from([chunk])
        }

        return Buffer.from(chunk)
      }),
    )
  }

  throw new TypeError('Unsupported S3 body type')
}

test('s3', async (t) => {
  await t.test('creates storage instance', () => {
    const storage = createStorage({
      region,
      bucket,
      accessKeyId,
      secretAccessKey,
    })

    assert.equal(storage.constructor.name, 'Storage')
  })

  await t.test('Compliance test', async () => {
    const client = new MockS3Client()
    const storage = createStorage({
      region,
      bucket,
      accessKeyId,
      secretAccessKey,
      endpoint: `http://${randomUUID()}.example.test`,
      client,
      upload: async (input) => {
        client.objects.set(input.Key as string, {
          body: await toBuffer(input.Body),
          contentType: input.ContentType,
          lastModified: new Date(),
        })
      },
    })
    await complianceTest(storage)
  })
})
