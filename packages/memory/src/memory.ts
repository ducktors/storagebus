import { Readable } from 'node:stream'

import {
  AbstractStorageOptions,
  Storage as AbstractStorage,
} from '@ducktors/storagebus-abstract'

export type StorageOptions = AbstractStorageOptions

export class Storage extends AbstractStorage {
  protected bucket: Map<string, Buffer>

  constructor(opts: StorageOptions) {
    super({ debug: opts?.debug, logger: opts?.logger })
    this.bucket = new Map()
  }

  async write(key: string, fileReadable: Readable): Promise<string> {
    const _key = this.sanitize(key)

    this.bucket.set(_key, await this.toBuffer(fileReadable))
    return _key
  }

  async exists(key: string): Promise<boolean> {
    const _key = this.sanitize(key)
    return this.bucket.has(_key)
  }

  async read(key: string): Promise<Readable> {
    const _key = this.sanitize(key)
    if (!(await this.exists(_key))) {
      throw new Error(`Missing ${_key} from Storagebus Memory`)
    }

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    return Readable.from(this.bucket.get(_key)!)
  }

  async remove(key: string): Promise<void> {
    const _key = this.sanitize(key)
    this.bucket.delete(_key)
  }

  async copy(key: string, destKey: string): Promise<string> {
    const _key = this.sanitize(key)
    const file = this.bucket.has(_key)
    if (!file) {
      throw new Error(`Missing ${_key} from Storagebus Memory`)
    }
    const _destKey = this.sanitize(destKey)
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    this.bucket.set(_destKey, this.bucket.get(_key)!)
    return _destKey
  }

  async move(key: string, destKey: string): Promise<string> {
    const _destKey = await this.copy(key, destKey)
    await this.remove(key)

    return _destKey
  }
}
