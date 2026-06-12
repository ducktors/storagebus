import { Readable } from 'node:stream'
import type { Adapter } from './adapter.ts'
import { ENOENT } from './errors.ts'
import { Storage as StorageBus, type StorageOptions } from './storage.ts'

export type { StorageOptions }

interface StorageObject {
  lastModified: number
  size: number
  data: Buffer
  type: string
}

export function adapter(): Adapter {
  const storage = new Map<string, StorageObject>()
  return {
    async set(file) {
      const buffer = await file.buffer()
      storage.set(file.name, {
        lastModified: Date.now(),
        size: buffer.length,
        data: buffer,
        type: file.type,
      })
      return file.name
    },
    async get(path) {
      return () => {
        const buffer = storage.get(path)?.data
        if (!buffer) {
          throw new ENOENT(path)
        }
        return Readable.from(buffer)
      }
    },
    async metadata(path) {
      const data = storage.get(path)

      if (!data) {
        return {}
      }
      return {
        size: data.size,
        lastModified: data.lastModified,
        type: data.type,
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
    super(adapter(), opts)
  }
}
