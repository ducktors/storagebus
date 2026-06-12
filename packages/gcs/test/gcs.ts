import assert from 'node:assert/strict'
import { Readable, Writable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { test } from 'node:test'
import { createStorage, Storage } from '@storagebus/gcs'
import { complianceTest } from '@storagebus/storage/compliance-test'

class MockedFile {
  name: string
  #content = Buffer.from('')
  #type = 'application/octet-stream'
  #files: Map<string, MockedFile>
  #deleted: Set<string>

  constructor(
    path: string,
    files: Map<string, MockedFile>,
    deleted: Set<string>,
  ) {
    this.name = path
    this.#files = files
    this.#deleted = deleted
  }

  createWriteStream({ contentType }: { contentType?: string } = {}) {
    this.#type = contentType ?? this.#type
    const chunks: Buffer[] = []

    return new Writable({
      write: (chunk, _encoding, next) => {
        chunks.push(Buffer.from(chunk))
        next()
      },
      final: (next) => {
        this.#content = Buffer.concat(chunks)
        this.#deleted.delete(this.name)
        this.#files.set(this.name, this)
        next()
      },
    })
  }

  createReadStream() {
    return Readable.from(this.#content)
  }

  async delete() {
    this.#deleted.add(this.name)
    this.#files.delete(this.name)
  }

  async exists(): Promise<[boolean]> {
    return [this.#files.has(this.name)]
  }

  async getMetadata(): Promise<
    [
      {
        name: string
        contentType: string
        size: number
      },
      {
        name: string
        contentType: string
        size: number
      },
    ]
  > {
    const metadata = {
      name: this.name,
      contentType: this.#type,
      size: this.#content.length,
    }
    return [metadata, metadata]
  }
}

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

    const existing = this.#files.get(path)
    if (existing) {
      return existing
    }

    const file = new MockedFile(path, this.#files, this.#deleted)
    this.#files.set(path, file)
    return file
  }
}

class MockedStorage {
  bucket(name?: string) {
    return new MockedBucket(name)
  }
}

test('GCS', async (t) => {
  await t.test('GCS mock test', async () => {
    const storage = new MockedStorage()
    const bucket = storage.bucket('foo')
    const file = bucket.file('foo.txt')

    assert.equal(file.name, 'foo.txt')

    await pipeline(Readable.from('foo'), file.createWriteStream())
    assert.equal(
      Buffer.concat(await file.createReadStream().toArray()).toString(),
      'foo',
    )

    assert.deepEqual(await file.exists(), [true])
    await file.delete()
    assert.deepEqual(await file.exists(), [false])
    assert.deepEqual(await file.getMetadata(), [
      {
        name: 'foo.txt',
        contentType: 'application/octet-stream',
        size: 3,
      },
      {
        name: 'foo.txt',
        contentType: 'application/octet-stream',
        size: 3,
      },
    ])
  })

  await t.test('storage constructor accepts parameters', () => {
    const storage = createStorage({
      clientEmail: 'foobar',
      privateKey: 'foo',
      projectId: 'bar',
      bucket: 'test',
      client: new MockedStorage(),
    })
    assert.equal(storage instanceof Storage, true)
  })

  await t.test('Compliance test', async () => {
    const storage = createStorage({
      bucket: 'storagebus-test',
      client: new MockedStorage(),
    })
    await complianceTest(storage)
  })
})
