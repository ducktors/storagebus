import { Storage as StorageBus } from '@storagebus/storage'
import { adapter, type StorageOptions } from './adapter.ts'

export function createStorage(options: StorageOptions) {
  return new Storage(options)
}

export class Storage extends StorageBus {
  constructor(opts: StorageOptions) {
    const {
      bucket,
      region,
      accessKeyId,
      secretAccessKey,
      endpoint,
      client,
      upload,
      ...options
    } = opts
    super(
      adapter({
        bucket,
        region,
        accessKeyId,
        secretAccessKey,
        endpoint,
        client,
        upload,
      }),
      options,
    )
  }
}
