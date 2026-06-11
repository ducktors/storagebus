import { Storage as StorageBus } from '@storagebus/storage'
import driver, { type StorageOptions } from './driver.ts'

export function createStorage(options: StorageOptions) {
  return new Storage(options)
}

export class Storage extends StorageBus {
  constructor(opts: StorageOptions) {
    const { bucket, client, clientEmail, privateKey, projectId, ...options } =
      opts
    super(
      driver.driver({ bucket, client, clientEmail, privateKey, projectId }),
      options,
    )
  }
}
