import { createStorage } from '@storagebus/gcs'
import { complianceTest } from '@storagebus/storage/compliance-test'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Readable, Writable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

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

  await t.test('Compliance test', async (t) => {
    const storage = createStorage({ bucket: 'storagebus-test' })
    await complianceTest(storage)
  })

  // const bucket = randomUUID()

  // const { Storage } = await import('../src/gcs.js')
  // // console.log('Storage', Storage)
  // const storage = new Storage({ bucket })

  // await test('storage is instance of Storage', () => {
  //   assert.equal(storage instanceof Storage, true)
  // })

  // await test('storage instance extends from AbstractStorage', () => {
  //   assert.equal(storage instanceof AbstractStorage, true)
  // })

  // await test('storage constructor accepts parameters', () => {
  //   const storage = new Storage({
  //     clientEmail: 'foobar',
  //     privateKey: 'foo',
  //     projectId: 'bar',
  //     bucket,
  //   })
  //   assert.equal(storage instanceof Storage, true)
  //   assert.equal(storage instanceof AbstractStorage, true)
  // })

  // await test('storage.write a Readable to GCS bucket', async () => {
  //   const key = randomUUID()
  //   await storage.write(key, Readable.from(key))

  //   assert.equal(await storage.exists(key), true)
  // })

  // await test('storage.read reads a file from GCS bucket', async () => {
  //   const key = randomUUID()
  //   await storage.write(key, Readable.from(key))
  //   const file = await storage.read(key)

  //   assert.equal(file instanceof Readable, true)
  // })

  // await test('storage.read throws on missing key', async () => {
  //   const key = randomUUID()

  //   await assert.rejects(() => storage.read(key), Error)
  // })

  // await test('storage.remove removes key from gcs bucket', async () => {
  //   const key = randomUUID()
  //   await storage.write(key, Readable.from(key))
  //   await storage.remove(key)

  //   assert.equal(await storage.exists(key), false)
  // })

  // await test('storage.copy copy a file to new location', async () => {
  //   const key = randomUUID()
  //   const objectKey = await storage.write(key, Readable.from(key))
  //   const newKey = await storage.copy(objectKey, 'new-key')

  //   assert.equal(await storage.exists(objectKey), true)
  //   assert.equal(await storage.exists(newKey), true)
  // })

  // await test('storage.copy copy a file with ContentType set to new location', async () => {
  //   const key = `${randomUUID()}.jpeg`
  //   const objectKey = await storage.write(key, Readable.from(key))
  //   const newKey = await storage.copy(objectKey, 'new-key.jpeg')

  //   assert.equal(await storage.exists(objectKey), true)
  //   assert.equal(await storage.exists(newKey), true)
  // })

  // await test('storage.move moves a file to a new location', async () => {
  //   const key = randomUUID()

  //   const objectKey = await storage.write(key, Readable.from(key))
  //   const newKey = await storage.move(objectKey, 'new-key')

  //   assert.equal(await storage.exists(objectKey), false)
  //   assert.equal(await storage.exists(newKey), true)
  // })

  // await test('toBuffer returns a buffer from Readable with objectMode true', async () => {
  //   const storage = new Storage({ bucket })
  //   const buffer = await storage.toBuffer(
  //     Readable.from('foo', { objectMode: true }),
  //   )

  //   assert.equal(buffer instanceof Buffer, true)
  //   assert.equal(buffer.toString(), 'foo')
  // })

  // await test('toBuffer returns a buffer from Readable with objectMode false', async () => {
  //   const storage = new Storage({ bucket })
  //   const buffer = await storage.toBuffer(
  //     Readable.from('foo', { objectMode: false }),
  //   )

  //   assert.equal(buffer instanceof Buffer, true)
  //   assert.equal(buffer.toString(), 'foo')
  // })
})
