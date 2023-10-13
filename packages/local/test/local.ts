import { Storage } from '@storagebus/storage'
import { complianceTest } from '@storagebus/storage/compliance-test'
import { createStorage, Storage as LocalStorage } from '@storagebus/local'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { Readable } from 'node:stream'

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
    const path = await storage.write(fileName, () => Readable.from(fileName))
    const stats = await stat(join(tmpFolder, fileName))
    const file = await storage.file(fileName)

    assert.equal(file.size, stats.size)
    assert.equal(file.type, 'application/octet-stream')
    assert.equal(file.lastModified > 0, true)
    assert.equal(await file.text(), fileName)
    assert.equal(path, fileName)
  })

  await test('storage.write writes a Readable to deep path on disk', async () => {
    const root = await mkdtemp(join(tmpdir(), randomUUID()))
    const storage = createStorage({ root })

    const fileName = `${randomUUID()}/${randomUUID()}`
    const path = await storage.write(fileName, () => Readable.from(fileName))
    const stats = await stat(join(root, fileName))
    const file = await storage.file(fileName)

    assert.equal(file.size, stats.size)
    assert.equal(file.type, 'application/octet-stream')
    assert.equal(file.lastModified > 0, true)
    assert.equal(await file.text(), fileName)
    assert.equal(path, fileName)
  })

  await test('storage.read reads a file from disk', async () => {
    const storage = createStorage({
      root: await mkdtemp(join(tmpdir(), randomUUID())),
    })
    const fileName = randomUUID()

    await storage.write(fileName, () => Readable.from(fileName))
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
    const root = await mkdtemp(join(tmpdir(), randomUUID()))
    const storage = createStorage({
      root,
    })
    const fileName = `${randomUUID()}/${randomUUID()}`

    await storage.write(fileName, fileName)
    const file = await storage.file(fileName)

    let str = ''

    for await (const chunk of await file.stream()) {
      str = str + Buffer.from(chunk).toString()
    }

    assert.equal(str, fileName)
  })

  await test('Compliance test', async () => {
    const storage = createStorage({
      root: await mkdtemp(join(tmpdir(), randomUUID())),
    })
    await complianceTest(storage)
  })
})
