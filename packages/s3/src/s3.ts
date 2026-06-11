import { Storage as StorageBus } from '@storagebus/storage'
import driver, { type StorageOptions } from './driver.js'

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
      driver.driver({
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
