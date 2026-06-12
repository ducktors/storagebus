import { Readable } from 'node:stream'
import type { Adapter } from '@storagebus/storage'
import { ENOENT } from '@storagebus/storage/errors'

interface StorageObject {
  lastModified: number
  size: number
  data: Buffer
  type: string
}

export type AdapterOptions = Record<string, never>

export function createAdapter(_options: AdapterOptions = {}): Adapter {
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
    async get(key) {
      return () => {
        const buffer = storage.get(key)?.data
        if (!buffer) {
          throw new ENOENT(key)
        }
        return Readable.from(buffer)
      }
    },
    async metadata(key) {
      const data = storage.get(key)

      if (!data) {
        return {
          size: 0,
          lastModified: -1,
        }
      }
      return {
        size: data.size,
        lastModified: data.lastModified,
        type: data.type,
      }
    },
    async delete(key) {
      storage.delete(key)
    },
  }
}
