import {
  StorageOptions,
  Driver,
  Storage as StorageBus,
} from '@storagebus/storage'
import { BusFile } from './file.js'

export type { StorageOptions }

function driver(): Driver {
  const storage = new Map<string, BusFile>()
  return {
    async set(destination, data) {
      storage.set(destination, data)
      return destination
    },
    async get(path) {
      return storage.get(path)?.buffer() ?? null
    },
    async has(path) {
      return storage.has(path)
    },
    async getMetadata(path) {
      const data = storage.get(path)

      if (!data) {
        return {}
      }
      return {
        size: (await data.buffer()).length,
      }
    },
    async delete(path) {
      storage.delete(path)
    },
  }
}

export function createStorage(opts?: StorageOptions) {
  return new Storage(opts)
}

export class Storage extends StorageBus {
  constructor(opts?: StorageOptions) {
    super(driver(), opts)
  }
}
