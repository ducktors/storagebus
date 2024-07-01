import assert from 'node:assert/strict'
import { Readable, Writable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { test } from 'node:test'
import { Storage, createStorage } from '@storagebus/gcs'
import { complianceTest } from '@storagebus/storage/compliance-test'

test('GCS', async (t) => {
  const GCS =
    require('@google-cloud/storage') as typeof import('@google-cloud/storage')

  t.mock.getter(GCS, 'Storage', () => {
    class MockedFile {
      name: string
      #stream: Writable
      #content: Buffer = Buffer.from('')
      #type = 'application/octet-stream'
      #files: Map<string, MockedFile>
      #deleted: Set<string>
      constructor(
        path: string,
        files: Map<string, MockedFile>,
        deleted: Set<string>,
      ) {
        this.name = path
        this.#stream = new Writable({
          write: (chunk, encoding, next) => {
            const data = Buffer.from(chunk)
            const length = data.length + this.#content.length
            this.#content = Buffer.concat([this.#content, data], length)
            next()
          },
          final: (next) => {
            next()
          },
        })
        this.#files = files
        this.#deleted = deleted
      }
      createWriteStream({ contentType }: { contentType?: string } = {}) {
        this.#type = contentType ?? this.#type
        return this.#stream
      }
      createReadStream() {
        return Readable.from(this.#content)
      }
      async delete() {
        this.#deleted.add(this.name)
        this.#files.delete(this.name)
      }
      async exists() {
        return [this.#files.has(this.name)]
      }
      async getMetadata() {
        return [
          {
            name: this.name,
            contentType: this.#type,
            size: this.#content.length,
          },
        ]
      }
    }

    t.mock.method(MockedFile.prototype, 'createWriteStream')
    t.mock.method(MockedFile.prototype, 'createReadStream')
    t.mock.method(MockedFile.prototype, 'delete')
    t.mock.method(MockedFile.prototype, 'exists')
    t.mock.method(MockedFile.prototype, 'getMetadata')

    class MockedBucket {
      name = ''
      #files = new Map<string, MockedFile>()
      #deleted = new Set<string>()
      constructor(name?: string) {
        if (name) {
          this.name = name
        }
      }
      file(path: string) {
        if (this.#deleted.has(path)) {
          return new MockedFile(path, this.#files, this.#deleted)
        }

        return (
          this.#files.get(path) ??
          this.#files
            .set(path, new MockedFile(path, this.#files, this.#deleted))
            .get(path)
        )
      }
    }
    t.mock.method(MockedBucket.prototype, 'file')

    class MockedStorage {
      bucket(name?: string) {
        return new MockedBucket(name)
      }
    }
    t.mock.method(MockedStorage.prototype, 'bucket')

    return MockedStorage
  })

  await t.test('GCS mock test', async () => {
    const bucket = new GCS.Storage()
    const b = bucket.bucket('foo')
    assert.equal((bucket.bucket as any).mock.calls.length, 1)

    const file = b.file('foo.txt')
    assert.equal((b.file as any).mock.calls.length, 1)
    assert.equal(file.name, 'foo.txt')

    await pipeline(Readable.from('foo'), file.createWriteStream())
    assert.equal((file.createWriteStream as any).mock.calls.length, 1)

    assert.equal(
      Buffer.concat(await file.createReadStream().toArray()).toString(),
      'foo',
    )
    assert.equal((file.createReadStream as any).mock.calls.length, 1)

    assert.deepEqual(await file.exists(), [true])
    assert.equal((file.exists as any).mock.calls.length, 1)

    await file.delete()
    assert.equal((file.delete as any).mock.calls.length, 1)

    assert.deepEqual(await file.exists(), [false])
    assert.equal((file.exists as any).mock.calls.length, 2)

    assert.deepEqual(await file.getMetadata(), [
      {
        name: 'foo.txt',
        contentType: 'application/octet-stream',
        size: 3,
      },
    ])
    assert.equal((file.getMetadata as any).mock.calls.length, 1)
  })

  await test('storage constructor accepts parameters', () => {
    const storage = createStorage({
      clientEmail: 'foobar',
      privateKey: 'foo',
      projectId: 'bar',
      bucket: 'test',
    })
    assert.equal(storage instanceof Storage, true)
  })

  await t.test('Compliance test', async (t) => {
    const storage = createStorage({ bucket: 'storagebus-test' })
    await complianceTest(storage)
  })
})
