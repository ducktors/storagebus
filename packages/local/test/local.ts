import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { test } from 'node:test'

import { Storage } from '@storagebus/storage'
import { createStorage, Storage as LocalStorage } from '../src/local.js'

test('local', async () => {
  await test('Storage constructor accepts the root parameter', async () => {
    const storage = createStorage({
      root: await mkdtemp(join(tmpdir(), randomUUID())),
    })
    assert.equal(storage instanceof Storage, true)
    assert.equal(storage instanceof LocalStorage, true)
  })

  await test('storage.write writes a Readable to disk', async () => {
    const tmpFolder = await mkdtemp(join(tmpdir(), randomUUID()))
    const storage = createStorage({ root: tmpFolder })
    const fileName = randomUUID()
    const path = await storage.write(fileName, Readable.from(fileName))
    const stats = await stat(join(tmpFolder, fileName))
    const file = await storage.file(fileName)

    assert.equal(file.size, stats.size)
    assert.equal(file.type, '')
    assert.equal(file.lastModified instanceof Date, true)
    assert.equal(path, fileName)
  })

  await test('storage.write writes a Readable to deep path on disk', async () => {
    const tmpFolder = await mkdtemp(join(tmpdir(), randomUUID()))
    const storage = createStorage({ root: tmpFolder })

    const fileName = `${randomUUID()}/${randomUUID()}`
    const path = await storage.write(fileName, Readable.from(fileName))
    const stats = await stat(join(tmpFolder, fileName))
    const file = await storage.file(fileName)

    assert.equal(file.size, stats.size)
    assert.equal(file.type, '')
    assert.equal(file.lastModified instanceof Date, true)
    assert.equal(path, fileName)
  })

  await test('storage.read reads a file from disk', async () => {
    const storage = createStorage({
      root: await mkdtemp(join(tmpdir(), randomUUID())),
    })
    const fileName = randomUUID()

    await storage.write(fileName, Readable.from(fileName))
    const file = await storage.file(fileName)
    let str = ''

    for await (const chunk of await file.stream()) {
      str = str + Buffer.from(chunk).toString()
    }

    for await (const chunk of await file.stream()) {
      str = str + Buffer.from(chunk).toString()
    }

    assert.equal(str, fileName + fileName)
  })

  await test('storage.read reads a file from deep path on disk', async () => {
    const storage = createStorage({
      root: await mkdtemp(join(tmpdir(), randomUUID())),
    })
    const fileName = `${randomUUID()}/${randomUUID()}`

    await storage.write(fileName, Readable.from(fileName))
    const file = await storage.file(fileName)
    let str = ''

    for await (const chunk of await file.stream()) {
      str = str + Buffer.from(chunk).toString()
    }

    assert.equal(str, fileName)
  })

  await test('storage.exists return true if the file exists', async () => {
    const storage = createStorage({
      root: await mkdtemp(join(tmpdir(), randomUUID())),
    })

    const fileName = randomUUID()
    const path = await storage.write(fileName, Readable.from(fileName))

    assert.equal(await storage.exists(path), true)
  })

  await test('storage.exists return true if the deep path exists', async () => {
    const storage = createStorage({
      root: await mkdtemp(join(tmpdir(), randomUUID())),
    })

    const fileName = `${randomUUID()}/${randomUUID()}`
    const path = await storage.write(fileName, Readable.from(fileName))

    assert.equal(await storage.exists(path), true)
  })

  await test(`storage.exists return false if the file doesn't exists`, async () => {
    const storage = createStorage({
      root: await mkdtemp(join(tmpdir(), randomUUID())),
    })

    const fileName = randomUUID()

    assert.equal(await storage.exists(fileName), false)
  })

  await test(`storage.exists return false if the deep path doesn't exists`, async () => {
    const storage = createStorage({
      root: await mkdtemp(join(tmpdir(), randomUUID())),
    })

    const fileName = `${randomUUID()}/${randomUUID()}`

    assert.equal(await storage.exists(fileName), false)
  })

  await test('storage.remove unlinks a path on the disk', async () => {
    const storage = createStorage({
      root: await mkdtemp(join(tmpdir(), randomUUID())),
    })

    const fileName = randomUUID()

    await storage.write(fileName, Readable.from(fileName))
    await storage.write(fileName, null)

    assert.equal(await storage.exists(fileName), false)
  })

  await test('storage.remove unlinks a deep path on the disk', async () => {
    const storage = createStorage({
      root: await mkdtemp(join(tmpdir(), randomUUID())),
    })

    const fileName = `${randomUUID()}/${randomUUID()}`

    await storage.write(fileName, Readable.from(fileName))
    await storage.write(fileName, null)

    assert.equal(await storage.exists(fileName), false)
  })

  await test('storage.copy copies a file to the new destination', async () => {
    const storage = createStorage({
      root: await mkdtemp(join(tmpdir(), randomUUID())),
    })

    const sourceFileName = randomUUID()
    const destFileName = randomUUID()

    await storage.write(sourceFileName, Readable.from(sourceFileName))
    const file1 = await storage.file(sourceFileName)
    await storage.write(
      await storage.file(destFileName),
      await storage.file(sourceFileName),
    )

    assert.equal(await storage.exists(file1), true, 'source exists')
    assert.equal(await storage.exists(destFileName), true, 'destination exists')
  })

  await test('storage.copy copies a deep path to a new deep path destination', async () => {
    const storage = createStorage({
      root: await mkdtemp(join(tmpdir(), randomUUID())),
    })

    const sourceFileName = `${randomUUID()}/${randomUUID()}`
    const destFileName = `${randomUUID()}/${randomUUID()}`

    await storage.write(sourceFileName, Readable.from(sourceFileName))
    await storage.write(
      await storage.file(destFileName),
      await storage.file(sourceFileName),
    )

    assert.equal(await storage.exists(sourceFileName), true)
    assert.equal(await storage.exists(destFileName), true)
  })

  await test('storage.move moves a file to the new destination', async () => {
    const storage = createStorage({
      root: await mkdtemp(join(tmpdir(), randomUUID())),
    })

    const sourceFileName = randomUUID()
    const destFileName = randomUUID()

    await storage.write(sourceFileName, Readable.from(sourceFileName))
    await storage.write(
      await storage.file(destFileName),
      await storage.file(sourceFileName),
    )
    await storage.write(sourceFileName, null)

    assert.equal(await storage.exists(sourceFileName), false)
    assert.equal(await storage.exists(destFileName), true)
  })

  await test('storage.move moves a deep path to a new deep path destination', async () => {
    const storage = createStorage({
      root: await mkdtemp(join(tmpdir(), randomUUID())),
    })

    const sourceFileName = `${randomUUID()}/${randomUUID()}`
    const destFileName = `${randomUUID()}/${randomUUID()}`

    await storage.write(sourceFileName, Readable.from(sourceFileName))
    await storage.write(
      await storage.file(destFileName),
      await storage.file(sourceFileName),
    )
    await storage.write(sourceFileName, null)

    assert.equal(await storage.exists(sourceFileName), false)
    assert.equal(await storage.exists(destFileName), true)
  })
})
