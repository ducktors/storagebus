import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir, stat, unlink } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { once } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import {
  Driver,
  Storage as StorageBus,
  StorageOptions as StorageBusOptions,
} from '@storagebus/storage'
import { ENOENT } from '@storagebus/storage/errors'

export type StorageOptions = {
  root: string
} & StorageBusOptions

function driver(root: string): Driver {
  return {
    async set(file) {
      const path = join(root, file.name)
      try {
        await pipeline(await file.stream(), createWriteStream(path))
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          const folder = dirname(path)
          await mkdir(folder, { recursive: true })
        }
        await pipeline(await file.stream(), createWriteStream(path))
      }

      return path
    },
    async get(destination) {
      const path = join(root, destination)

      return async () => {
        try {
          const fileStream = createReadStream(path)
          await once(fileStream, 'open')
          return fileStream
        } catch (error: any) {
          if (error.code === 'ENOENT') {
            throw new ENOENT(destination)
          }
          /* c8 ignore next 2 */
          throw error
        }
      }
    },
    async metadata(destination) {
      try {
        const path = join(root, destination)
        const stats = await stat(path)

        return {
          size: stats.size,
          lastModified: stats.mtime.getTime(),
        }
      } catch (error) {
        return {
          size: 0,
          lastModified: -1,
        }
      }
    },
    async delete(destination) {
      const path = join(root, destination)
      try {
        await unlink(path)
        /* c8 ignore next 4 */
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          throw error
        }
      }
    },
  }
}

export function createStorage(opts: StorageOptions) {
  return new Storage(opts)
}

export class Storage extends StorageBus {
  constructor(opts: StorageOptions) {
    const { root, ...options } = opts
    super(driver(root), options)
  }
}
