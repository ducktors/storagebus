import { StorageOptions, Storage as StorageBus } from '@storagebus/storage'
import { BusFile } from './file.js'
import { Readable } from 'node:stream'
import { Options } from '@storagebus/file'

export type { StorageOptions }

type createStream = () => Readable | Promise<Readable>
interface StorageObject {
  lastModified: number
  size: number
  data: Buffer
  type: string
}

export interface Driver {
  set(destination: string, data: BusFile, contentType?: string): Promise<string>
  get(path: string): Promise<createStream | Buffer | string | null>
  metadata(path: string): Promise<Options>
  delete(path: string): Promise<void>
}

export function driver(): Driver {
  const storage = new Map<string, StorageObject>()
  return {
    async set(destination, data, contentType) {
      const buffer = await data.buffer()
      storage.set(destination, {
        lastModified: Date.now(),
        size: buffer.length,
        data: buffer,
        type: contentType || '',
      })
      return destination
    },
    async get(path) {
      return storage.get(path)?.data ?? null
    },
    async metadata(path) {
      const data = storage.get(path)

      if (!data) {
        return {}
      }
      return {
        size: data.size,
        lastModified: data.lastModified,
        getMetdata: () => data,
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
