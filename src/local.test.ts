import { randomUUID } from 'node:crypto'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'
import { Readable } from 'node:stream'

import { expect, test } from 'vitest'

import { Storage } from './abstract-storage'
import { LocalStorage } from './local'

const localStorage = new LocalStorage()

test('create LocalStorage instance', () => {
  expect(localStorage).toBeInstanceOf(LocalStorage)
})

test('localStorage instance extends from Storage', () => {
  expect(localStorage).toBeInstanceOf(Storage)
})

test('localStorage.write writes a Readable to disk', async () => {
  const tmp = await localStorage.getTmpFolder(randomUUID())
  const fileName = randomUUID()
  const filePath = join(tmp, fileName)

  await localStorage.write(filePath, Readable.from(fileName))
  const stats = await stat(filePath)

  expect(stats.size).toBe(36)
})

test('localStorage.read reads a file from disk', async () => {
  const fileName = randomUUID()
  const path = await localStorage.saveToTmpFolder(fileName, Readable.from(fileName))
  const file = await localStorage.read(path)

  let str = ''

  for await (const chunk of file) {
    str = str + Buffer.from(chunk).toString()
  }

  expect(str).toBe(fileName)
})

test('localStorage.exists return true if the file exists', async () => {
  const fileName = randomUUID()
  const path = await localStorage.saveToTmpFolder(fileName, Readable.from(fileName))
  expect(await localStorage.exists(path)).toBe(true)
})

test(`localStorage.exists return false if the file doesn't exists`, async () => {
  const tmp = await localStorage.getTmpFolder(randomUUID())
  const fileName = randomUUID()
  const filePath = join(tmp, fileName)

  expect(await localStorage.exists(filePath)).toBe(false)
})

test('localStorage.remove unlinks a path on the disk', async () => {
  const fileName = randomUUID()
  const path = await localStorage.saveToTmpFolder(fileName, Readable.from(fileName))

  await localStorage.remove(path)

  expect(await localStorage.exists(path)).toBe(false)
})

test('localStorage.saveToTmpFolder saves a Readable to the tmp folder', async () => {
  const fileName = randomUUID()
  const path = await localStorage.saveToTmpFolder(fileName, Readable.from(fileName))

  expect(path.includes(fileName)).toBe(true)
})

test('localStorage.saveToTmpFolder saves a Readable to tmp subfolder', async () => {
  const fileName = randomUUID()
  const subFolder = randomUUID()
  const path = await localStorage.saveToTmpFolder(fileName, Readable.from(fileName), subFolder)

  expect(path.includes(subFolder)).toBe(true)
  expect(path.includes(fileName)).toBe(true)
})

test('localStorage.getTmpFolder returns a path to system tmp subfolder', async () => {
  const subFolder = randomUUID()
  const tmp = await localStorage.getTmpFolder(subFolder)

  expect(tmp.includes(subFolder)).toBe(true)
})
