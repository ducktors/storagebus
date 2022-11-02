import { randomUUID } from 'node:crypto'
import { constants, createReadStream, createWriteStream } from 'node:fs'
import { access, mkdir, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable, pipeline as _pipeline } from 'node:stream'
import { promisify } from 'node:util'

import { Storage } from './abstract-storage'

const pipeline = promisify(_pipeline)

export class LocalStorage extends Storage {
  async write(filePath: string, fileReadable: Readable): Promise<string> {
    await pipeline(fileReadable, createWriteStream(filePath))
    return filePath
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await access(filePath, constants.F_OK)
      return true
    } catch (err) {
      return false
    }
  }

  async read(filePath: string): Promise<Readable> {
    return createReadStream(filePath)
  }

  async remove(filePath: string): Promise<void> {
    return unlink(filePath)
  }

  async saveToTmpFolder(
    filePath: string,
    fileReadable: Readable,
    subFolder?: string,
  ): Promise<string> {
    const outDir = await this.getTmpFolder(subFolder)
    const tmpFilePath = join(outDir, filePath)

    await this.write(tmpFilePath, fileReadable)

    return tmpFilePath
  }

  async getTmpFolder(subFolder?: string) {
    if (!subFolder) {
      subFolder = randomUUID()
    }
    const path = join(tmpdir(), subFolder)
    await mkdir(path, {
      recursive: true,
    })
    return path
  }
}
