import { Readable } from 'node:stream'
import { ENOENT } from './errors.js'
import { BusFile, BusFileMetadata } from './file.js'
import { Storage as StorageBus, StorageOptions } from './storage.js'

export type { StorageOptions }

type createStream = () => Readable | Promise<Readable>
interface StorageObject {
  lastModified: number
  size: number
  data: Buffer
  type: string
}

export interface Driver {
  set(data: BusFile): Promise<string>
  get(path: string): Promise<createStream | Buffer | string>
  metadata(path: string): Promise<BusFileMetadata>
  delete(path: string): Promise<void>
}

export function driver(): Driver {
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
