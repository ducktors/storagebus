import { Readable } from 'node:stream'

import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  HeadObjectCommand,
  HeadObjectCommandInput,
  CopyObjectCommand,
  CopyObjectCommandInput,
  S3Client,
  ServerSideEncryption,
} from '@aws-sdk/client-s3'
import { Progress, Upload } from '@aws-sdk/lib-storage'
import { lookup } from 'mime-types'
import {
  AbstractStorageOptions,
  Storage as AbstractStorage,
} from '@ducktors/storagebus-abstract'

export type StorageOptions = {
  bucket: string
  region?: string
  accessKeyId?: string
  secretAccessKey?: string
} & AbstractStorageOptions

type EntryptionOptions = {
  entryption?: {
    ServerSideEncryption: `${ServerSideEncryption}`
    SSEKMSKeyId?: string
  }
}

export type WriteOpts = {
  progress?: (p: Progress) => void
} & EntryptionOptions

export class Storage extends AbstractStorage {
  protected client: S3Client
  protected bucket: string

  constructor(opts: StorageOptions) {
    super({ debug: opts?.debug, logger: opts?.logger })

    const { bucket, region, accessKeyId, secretAccessKey } = opts

    this.client = new S3Client({
      ...(region ? { region } : {}),
      ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
    })

    this.bucket = bucket
  }

  async write(
    key: string,
    fileReadable: Readable,
    opts?: WriteOpts,
  ): Promise<string> {
    key = this.sanitize(key)
    const mimeType = lookup(key)

    const upload = new Upload({
      client: this.client,
      params: {
        Key: key,
        Bucket: this.bucket,
        Body: fileReadable,
        ...(mimeType ? { ContentType: mimeType } : {}),
        ...(opts?.entryption ?? {}),
      },
    })

    if (opts?.progress) {
      upload.on('httpUploadProgress', opts.progress)
    }

    await upload.done()
    return key
  }

  async exists(key: string): Promise<boolean> {
    const headParams: HeadObjectCommandInput = {
      Bucket: this.bucket,
      Key: this.sanitize(key),
    }
    try {
      await this.client.send(new HeadObjectCommand(headParams))
      return true
    } catch (err) {
      if (this._debug) {
        this._logger.info({ err })
      }
      return false
    }
  }

  async read(key: string): Promise<Readable> {
    const getParams: GetObjectCommandInput = {
      Bucket: this.bucket,
      Key: this.sanitize(key),
    }

    const { Body } = await this.client.send(new GetObjectCommand(getParams))
    if (!Body) {
      throw new Error(`Missing ${key} from ${this.bucket}`)
    }

    // in Node.js Body is a Readable
    return Body as Readable
  }

  async remove(key: string): Promise<void> {
    const deleteParams: DeleteObjectCommandInput = {
      Bucket: this.bucket,
      Key: this.sanitize(key),
    }

    await this.client.send(new DeleteObjectCommand(deleteParams))
  }

  async copy(
    key: string,
    destKey: string,
    opts?: EntryptionOptions,
  ): Promise<string> {
    const mimeType = lookup(key)
    const copyParams: CopyObjectCommandInput = {
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${this.sanitize(key)}`,
      Key: this.sanitize(destKey),
      ...(mimeType ? { ContentType: mimeType } : {}),
      ...(opts?.entryption ?? {}),
    }

    await this.client.send(new CopyObjectCommand(copyParams))
    return destKey
  }

  async move(
    key: string,
    destKey: string,
    opts?: EntryptionOptions,
  ): Promise<string> {
    await this.copy(key, destKey, opts)
    await this.remove(key)
    return destKey
  }
}
