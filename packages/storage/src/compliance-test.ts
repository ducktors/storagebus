import type { Storage } from '@storagebus/storage'
import { BusFile } from '@storagebus/storage/file'
import { randomUUID } from 'node:crypto'
import assert from 'node:assert'
import { Readable } from 'node:stream'
import { test } from 'node:test'

export async function complianceTest(storage: Storage) {
  await test('Readable', async () => {
    const filePath = randomUUID()
    const fileContent = filePath.repeat(6 * 1024)

    await _complianceTest(storage, filePath, fileContent, () =>
      Readable.from(fileContent),
    )
  })
  await test('Buffer', async () => {
    const filePath = randomUUID()
    const fileContent = filePath.repeat(6 * 1024)
    const data = Buffer.from(fileContent)

    await _complianceTest(storage, filePath, fileContent, data)
  })

  await test('string', async () => {
    const filePath = randomUUID()
    const fileContent = filePath.repeat(6 * 1024)
    const data = fileContent

    await _complianceTest(storage, filePath, fileContent, data)
  })

  await test('null', async () => {
    const filePath = randomUUID()
    const fileContent = null
    const data = fileContent

    await _complianceTest(storage, filePath, fileContent, data)
  })

  await test('BusFile', async () => {
    const filePath = randomUUID()
    const fileContent = null
    const data = new BusFile(null, filePath)

    await _complianceTest(storage, filePath, fileContent, data)
  })
}

async function _complianceTest(
  storage: Storage,
  filePath: string,
  fileContent: string | null,
  data: (() => Readable) | BusFile | Buffer | string | null,
) {
  await test('storage.write writes a content', async () => {
    const fileSize = fileContent?.length || 0
    const result = await storage.write(
      filePath,
      data instanceof Function ? data() : data,
    )

    assert.equal(result, filePath, 'returns the path of the file')
    const file = await storage.file(result)
    assert.equal(file instanceof BusFile, true, 'returns a BusFile')
    assert.equal(file.name, result, 'file.name is correct')
    assert.equal(file.size, fileSize, 'file.size is correct')
    assert.equal(file.type, 'application/octet-stream', 'file.type is correct')
    assert.equal(
      typeof file.lastModified === 'number' || file.lastModified === undefined,
      true,
      'file.lastModified is correct',
    )
  })

  await test('storage.write accepts BusFile as destination', async () => {
    const result = await storage.write(
      new BusFile(null, filePath),
      Readable.from('foo'),
    )

    assert.equal(result, filePath, 'returns the path of the file')
    const file = await storage.file(result)
    assert.equal(file instanceof BusFile, true, 'returns a BusFile')
    assert.equal(file.name, result, 'file.name is correct')
    assert.equal(file.size, 3, 'file.size is correct')
    assert.equal(file.type, 'application/octet-stream', 'file.type is correct')
    assert.equal(
      typeof file.lastModified === 'number' || file.lastModified === undefined,
      true,
      'file.lastModified is correct',
    )
  })

  await test('storage.file returns a BusFile with correct content', async () => {
    const result = await storage.write(
      filePath,
      data instanceof Function ? data() : data,
    )
    const file = await storage.file(result)

    const stream = await file.stream()
    assert.equal(
      stream instanceof Readable,
      true,
      'file.stream() returns a Readable',
    )

    const buffer = await file.buffer()
    assert.equal(
      buffer instanceof Buffer,
      true,
      'file.buffer() returns a Buffer',
    )

    const arrayBuffer = await file.arrayBuffer()
    assert.equal(
      arrayBuffer instanceof ArrayBuffer,
      true,
      'file.arrayBuffer() returns an ArrayBuffer',
    )

    const text = await file.text()
    assert.equal(typeof text === 'string', true, 'file.text() returns a string')
    assert.equal(
      text,
      fileContent === null ? '' : fileContent,
      'the content of the file is correct',
    )
  })

  await test('storage.file returns a BusFile that can be consumed multiple times', async () => {
    const result = await storage.write(
      filePath,
      data instanceof Function ? data() : data,
    )
    const file = await storage.file(result)

    let consumedContent = ''

    for await (const chunk of await file.stream()) {
      consumedContent += chunk
    }

    for await (const chunk of await file.stream()) {
      consumedContent += chunk
    }

    assert.equal(
      consumedContent,
      (fileContent || ('' as any)) + (fileContent || ('' as any)),
      'the content of the file is correct',
    )
  })
}
