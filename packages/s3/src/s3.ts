import { Storage as StorageBus } from '@storagebus/storage'
import driver, { StorageOptions } from './driver.js'

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
      ...options
    } = opts
    super(
      driver.driver({ bucket, region, accessKeyId, secretAccessKey, endpoint }),
      options,
    )
  }
}
