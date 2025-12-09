import type { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import {
  Storage as AbstractStorage,
  type AbstractStorageOptions,
} from '@ducktors/storagebus-abstract'
import type { Bucket } from '@google-cloud/storage'
import * as GCS from '@google-cloud/storage'
import { lookup } from 'mime-types'

export type StorageOptions = {
  bucket: string
  projectId?: string
  clientEmail?: string
  privateKey?: string
} & AbstractStorageOptions

export class Storage extends AbstractStorage {
  protected client: GCS.Storage
  protected bucket: Bucket

  constructor(opts: StorageOptions) {
    super({ debug: opts?.debug, logger: opts?.logger })

    const { bucket, clientEmail, privateKey, projectId } = opts
    if (!(clientEmail && privateKey && projectId)) {
      this.client = new GCS.Storage()
    } else {
      this.client = new GCS.Storage({
        projectId,
        credentials: {
          client_email: clientEmail,
          private_key: privateKey,
        },
      })
    }

    this.bucket = this.client.bucket(bucket)
  }

  async write(key: string, fileReadable: Readable): Promise<string> {
    const _key = this.sanitize(key)
    const file = this.bucket.file(_key)
    const mimeType = lookup(_key)

    await pipeline(
      fileReadable,
      file.createWriteStream({
        ...(mimeType ? { contentType: mimeType } : {}),
      }),
    )

    return file.name
  }

  async exists(key: string): Promise<boolean> {
    const _key = this.sanitize(key)
    const file = this.bucket.file(_key)
    const [exists] = await file.exists()

    return exists
  }

  async read(key: string): Promise<Readable> {
    const _key = this.sanitize(key)
    if (!(await this.exists(_key))) {
      throw new Error(`Missing ${_key} from ${this.bucket.name}`)
    }
    const file = this.bucket.file(_key)
    return file.createReadStream()
  }

  async remove(key: string): Promise<void> {
    const _key = this.sanitize(key)
    const file = this.bucket.file(_key)
    await file.delete({ ignoreNotFound: true })
  }

  async copy(key: string, destKey: string): Promise<string> {
    const _key = this.sanitize(key)
    const file = this.bucket.file(_key)
    const _destKey = this.sanitize(destKey)
    const destFile = this.bucket.file(_destKey)
    await file.copy(destFile)

    return destFile.name
  }

  async move(key: string, destKey: string): Promise<string> {
    const _key = this.sanitize(key)
    const _destKey = this.sanitize(destKey)
    const file = this.bucket.file(_key)
    const destFile = this.bucket.file(_destKey)
    await file.move(destFile)

    return destFile.name
  }
}
