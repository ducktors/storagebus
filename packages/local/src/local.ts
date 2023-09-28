import {
  createReadStream,
  createWriteStream,
  mkdirSync,
  existsSync,
  statSync,
} from 'node:fs'
import { mkdir, unlink } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { pipeline } from 'node:stream/promises'

import {
  StorageOptions as AbstractStorageOptions,
  Storage as StorageBus,
  Driver,
} from '@storagebus/storage'

export type StorageOptions = {
  root: string
} & AbstractStorageOptions

function driver(root: string): Driver {
  mkdirSync(root, { recursive: true })

  return {
    async set(destination, data) {
      const path = join(root, destination)

      await mkdir(dirname(path), { recursive: true })
      await pipeline(await data.stream(), createWriteStream(path))
      return destination
    },
    async get(destination) {
      const exists = await this.has(destination)
      const path = join(root, destination)

      if (!exists) {
        return null
      }
      return () => createReadStream(path)
    },
    async has(destination) {
      const path = join(root, destination)
      return existsSync(path)
    },
    async getMetadata(destination) {
      try {
        const stats = statSync(join(root, destination))
        return {
          size: stats.size,
          lastModified: stats.mtime,
        }
      } catch (error) {
        return {}
      }
    },
    async delete(destination) {
      const path = join(root, destination)
      await unlink(path)
    },
  }
}

export function createStorage(opts: StorageOptions) {
  return new Storage(opts)
}

export class Storage extends StorageBus {
  constructor(opts: StorageOptions) {
    super(driver(opts.root), opts)
  }
}
