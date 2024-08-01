import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, stat } from 'node:fs/promises'
import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { test } from 'node:test'

import { Storage as AbstractStorage } from '@ducktors/storagebus-abstract'
import { Storage } from '../src/local.js'

test('local', async () => {
  await test('Storage constructor accepts rootFolder parameter', async () => {
    const storage = new Storage({ rootFolder: randomUUID() })
    assert.equal(storage instanceof Storage, true)
    assert.equal(storage instanceof AbstractStorage, true)
  })

  await test('Storage constructor accepts bucket parameter', async () => {
    const storage = new Storage({ bucket: randomUUID() })
    assert.equal(storage instanceof Storage, true)
    assert.equal(storage instanceof AbstractStorage, true)
  })

  await test('storage.write writes a Readable to disk', async () => {
    const tmpFolder = await mkdtemp(join(tmpdir(), randomUUID()))
    const storage = new Storage({ bucket: tmpFolder })
    const fileName = randomUUID()
    const path = await storage.write(fileName, Readable.from(fileName))
    const stats = await stat(join(tmpFolder, fileName))

    assert.equal(stats.size, 36)
    assert.equal(path, fileName)
  })

  await test('storage.write writes a Readable to deep path on disk', async () => {
    const tmpFolder = await mkdtemp(join(tmpdir(), randomUUID()))
    const storage = new Storage({ bucket: tmpFolder })

    const fileName = `${randomUUID()}/${randomUUID()}`
    const path = await storage.write(fileName, Readable.from(fileName))
    const stats = await stat(join(tmpFolder, fileName))

    assert.equal(stats.size, 73)
    assert.equal(path, fileName)
  })

  await test('storage.read reads a file from disk', async () => {
    const storage = new Storage({ bucket: randomUUID() })
    const fileName = randomUUID()

    await storage.write(fileName, Readable.from(fileName))
    const file = await storage.read(fileName)
    let str = ''

    for await (const chunk of file) {
      str = str + Buffer.from(chunk).toString()
    }

    assert.equal(str, fileName)
  })

  await test('storage.read reads a file from deep path on disk', async () => {
    const storage = new Storage({ bucket: randomUUID() })
    const fileName = `${randomUUID()}/${randomUUID()}`

    await storage.write(fileName, Readable.from(fileName))
    const file = await storage.read(fileName)
    let str = ''

    for await (const chunk of file) {
      str = str + Buffer.from(chunk).toString()
    }

    assert.equal(str, fileName)
  })

  await test('storage.exists return true if the file exists', async () => {
    const storage = new Storage({ bucket: randomUUID() })

    const fileName = randomUUID()
    const path = await storage.write(fileName, Readable.from(fileName))

    assert.equal(await storage.exists(path), true)
  })

  await test('storage.exists return true if the deep path exists', async () => {
    const storage = new Storage({ bucket: randomUUID() })

    const fileName = `${randomUUID()}/${randomUUID()}`
    const path = await storage.write(fileName, Readable.from(fileName))

    assert.equal(await storage.exists(path), true)
  })

  await test(`storage.exists return false if the file doesn't exists`, async () => {
    const storage = new Storage({ bucket: randomUUID() })

    const fileName = randomUUID()

    assert.equal(await storage.exists(fileName), false)
  })

  await test(`storage.exists return false if the deep path doesn't exists`, async () => {
    const storage = new Storage({ bucket: randomUUID() })

    const fileName = `${randomUUID()}/${randomUUID()}`

    assert.equal(await storage.exists(fileName), false)
  })

  await test('storage.remove unlinks a path on the disk', async () => {
    const storage = new Storage({ bucket: randomUUID() })

    const fileName = randomUUID()

    await storage.write(fileName, Readable.from(fileName))
    await storage.remove(fileName)

    assert.equal(await storage.exists(fileName), false)
  })

  await test('storage.remove unlinks a deep path on the disk', async () => {
    const storage = new Storage({ bucket: randomUUID() })

    const fileName = `${randomUUID()}/${randomUUID()}`

    await storage.write(fileName, Readable.from(fileName))
    await storage.remove(fileName)

    assert.equal(await storage.exists(fileName), false)
  })

  await test('storage.copy copies a file to the new destination', async () => {
    const storage = new Storage({ bucket: randomUUID() })

    const sourceFileName = randomUUID()
    const destFileName = randomUUID()

    await storage.write(sourceFileName, Readable.from(sourceFileName))
    await storage.copy(sourceFileName, destFileName)

    assert.equal(await storage.exists(sourceFileName), true)
    assert.equal(await storage.exists(destFileName), true)
  })

  await test('storage.copy copies a deep path to a new deep path destination', async () => {
    const storage = new Storage({ bucket: randomUUID() })

    const sourceFileName = `${randomUUID()}/${randomUUID()}`
    const destFileName = `${randomUUID()}/${randomUUID()}`

    await storage.write(sourceFileName, Readable.from(sourceFileName))
    await storage.copy(sourceFileName, destFileName)

    assert.equal(await storage.exists(sourceFileName), true)
    assert.equal(await storage.exists(destFileName), true)
  })

  await test('storage.move moves a file to the new destination', async () => {
    const storage = new Storage({ bucket: randomUUID() })

    const sourceFileName = randomUUID()
    const destFileName = randomUUID()

    await storage.write(sourceFileName, Readable.from(sourceFileName))
    await storage.move(sourceFileName, destFileName)

    assert.equal(await storage.exists(sourceFileName), false)
    assert.equal(await storage.exists(destFileName), true)
  })

  await test('storage.move moves a deep path to a new deep path destination', async () => {
    const storage = new Storage({ bucket: randomUUID() })

    const sourceFileName = `${randomUUID()}/${randomUUID()}`
    const destFileName = `${randomUUID()}/${randomUUID()}`

    await storage.write(sourceFileName, Readable.from(sourceFileName))
    await storage.move(sourceFileName, destFileName)

    assert.equal(await storage.exists(sourceFileName), false)
    assert.equal(await storage.exists(destFileName), true)
  })

  await test('storage.move defaults to copy when EXDEV is thrown', async (t) => {
    const storage = new Storage({ bucket: randomUUID() })

    const renameSpy = t.mock.method(fs, 'rename')
    const exDevError: NodeJS.ErrnoException = new Error(
      'EXDEV: cross-device link not permitted',
    )
    exDevError.code = 'EXDEV'
    renameSpy.mock.mockImplementationOnce(() => {
      throw exDevError
    })

    const sourceFileName = randomUUID()
    const destFileName = randomUUID()

    await storage.write(sourceFileName, Readable.from(sourceFileName))
    await storage.move(sourceFileName, destFileName)

    assert.equal(await storage.exists(sourceFileName), false)
    assert.equal(await storage.exists(destFileName), true)
  })

  await test('storage.move defaults to copy when EXDEV is thrown', async (t) => {
    const storage = new Storage({ bucket: randomUUID() })

    const renameSpy = t.mock.method(fs, 'rename')
    const exDevError: NodeJS.ErrnoException = new Error(
      'EXDEV: cross-device link not permitted',
    )
    exDevError.code = 'EXDEV'

    renameSpy.mock.mockImplementationOnce(() => {
      throw exDevError
    })

    const sourceFileName = `${randomUUID()}/${randomUUID()}`
    const destFileName = `${randomUUID()}/${randomUUID()}`

    await storage.write(sourceFileName, Readable.from(sourceFileName))
    await storage.move(sourceFileName, destFileName)

    assert.equal(await storage.exists(sourceFileName), false)
    assert.equal(await storage.exists(destFileName), true)
  })

  await test('storage.move rethrows generic error', async (t) => {
    const storage = new Storage({ bucket: randomUUID() })
    const renameSpy = t.mock.method(fs, 'rename')

    renameSpy.mock.mockImplementationOnce(() => {
      throw new Error('Generic error')
    })

    const sourceFileName = randomUUID()
    const destFileName = randomUUID()

    await storage.write(sourceFileName, Readable.from(sourceFileName))
    await assert.rejects(
      () => storage.move(sourceFileName, destFileName),
      new Error('Generic error'),
    )
  })

  await test('storage.move rethrows generic error on deep path', async (t) => {
    const storage = new Storage({ bucket: randomUUID() })
    const renameSpy = t.mock.method(fs, 'rename')

    renameSpy.mock.mockImplementationOnce(() => {
      throw new Error('Generic error')
    })

    const sourceFileName = `${randomUUID()}/${randomUUID()}`
    const destFileName = `${randomUUID()}/${randomUUID()}`

    await storage.write(sourceFileName, Readable.from(sourceFileName))
    await assert.rejects(
      () => storage.move(sourceFileName, destFileName),
      new Error('Generic error'),
    )
  })

  await test('logs the error when in debug mode', async () => {
    const storage = new Storage({ debug: true, bucket: randomUUID() })

    try {
      await storage.exists('foo')
    } catch (err: any) {
      assert.equal(err.message, 'ENOENT: no such file or directory')
    }
  })

  await test('toBuffer returns a buffer from readable with objectMode true', async () => {
    const storage = new Storage({ bucket: randomUUID() })

    const readable = Readable.from('foo', { objectMode: true })
    readable.readableObjectMode

    const buffer = await storage.toBuffer(readable)
    assert.equal(buffer instanceof Buffer, true)
    assert.equal(buffer.toString(), 'foo')
  })

  await test('toBuffer returns a buffer from readable with objectMode false', async () => {
    const storage = new Storage({ bucket: randomUUID() })

    const readable = Readable.from('foo', { objectMode: false })
    const buffer = await storage.toBuffer(readable)

    assert.equal(buffer instanceof Buffer, true)
    assert.equal(buffer.toString(), 'foo')
  })
})
