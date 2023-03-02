import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import { type Bucket, Storage as GCS } from '@google-cloud/storage'
import {
  AbstractStorageOptions,
  Storage as AbstractStorage,
} from '@ducktors/storagebus-abstract'
import { lookup } from 'mime-types'

export type StorageOptions = {
  bucket: string
  projectId?: string
  clientEmail?: string
  privateKey?: string
} & AbstractStorageOptions

export class Storage extends AbstractStorage {
  protected client: GCS
  protected bucket: Bucket

  constructor(opts: StorageOptions) {
    super({ debug: opts?.debug, logger: opts?.logger })

    const { bucket, clientEmail, privateKey, projectId } = opts
    if (!(clientEmail && privateKey && projectId)) {
      this.client = new GCS()
    } else {
      this.client = new GCS({
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
    key = this.sanitize(key)
    const file = this.bucket.file(key)
    const mimeType = lookup(key)

    await pipeline(
      fileReadable,
      file.createWriteStream({
        ...(mimeType ? { contentType: mimeType } : {}),
      }),
    )

    return file.name
  }

  async exists(key: string): Promise<boolean> {
    key = this.sanitize(key)
    const file = this.bucket.file(key)
    const [exists] = await file.exists()

    return exists
  }

  async read(key: string): Promise<Readable> {
    key = this.sanitize(key)
    if (!(await this.exists(key))) {
      throw new Error(`Missing ${key} from ${this.bucket.name}`)
    }
    const file = this.bucket.file(key)
    return file.createReadStream()
  }

  async remove(key: string): Promise<void> {
    key = this.sanitize(key)
    const file = this.bucket.file(key)
    await file.delete({ ignoreNotFound: true })
  }

  async copy(key: string, destKey: string): Promise<string> {
    key = this.sanitize(key)
    const file = this.bucket.file(key)
    destKey = this.sanitize(destKey)
    const destFile = this.bucket.file(destKey)
    await file.copy(destFile)

    return destFile.name
  }

  async move(key: string, destKey: string): Promise<string> {
    key = this.sanitize(key)
    destKey = this.sanitize(destKey)
    const file = this.bucket.file(key)
    const destFile = this.bucket.file(destKey)
    await file.move(destFile)

    return destFile.name
  }
}
