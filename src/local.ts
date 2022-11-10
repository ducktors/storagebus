import { randomUUID } from 'node:crypto'
import { constants, createReadStream, createWriteStream } from 'node:fs'
import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable, pipeline as _pipeline } from 'node:stream'
import { promisify } from 'node:util'

import { AbstractStorageOptions, Storage } from './abstract-storage'

const pipeline = promisify(_pipeline)

export class LocalStorage extends Storage {
  constructor(opts: AbstractStorageOptions) {
    super(opts)
  }
  async write(filePath: string, fileReadable: Readable): Promise<string> {
    await pipeline(fileReadable, createWriteStream(filePath))
    return filePath
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath, constants.F_OK)
      return true
    } catch (err) {
      if (this._debug) {
        this._logger.info({ err })
      }
      return false
    }
  }

  async read(filePath: string): Promise<Readable> {
    return createReadStream(filePath)
  }

  async remove(filePath: string): Promise<void> {
    return fs.unlink(filePath)
  }

  async copy(filePath: string, destFilePath: string): Promise<string> {
    await fs.copyFile(filePath, destFilePath)
    return destFilePath
  }

  async move(filePath: string, destFilePath: string): Promise<string> {
    try {
      await fs.rename(filePath, destFilePath)
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'EXDEV') {
        await this.copy(filePath, destFilePath)
        await this.remove(filePath)
      } else {
        throw err
      }
    }
    return destFilePath
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
    await fs.mkdir(path, {
      recursive: true,
    })
    return path
  }
}
