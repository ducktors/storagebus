import { Storage as StorageBus } from '@storagebus/storage'
import { adapter, type StorageOptions } from './adapter.ts'

export function createStorage(options: StorageOptions) {
  return new Storage(options)
}

export class Storage extends StorageBus {
  constructor(opts: StorageOptions) {
    const { bucket, client, clientEmail, privateKey, projectId, ...options } =
      opts
    super(
      adapter({ bucket, client, clientEmail, privateKey, projectId }),
      options,
    )
  }
}
