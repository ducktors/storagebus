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

import { Storage } from '../abstract-storage'
import { sanitize } from './sanitize-key'

function isFunction(x: unknown): x is (x: string) => string {
  return Object.prototype.toString.call(x) == '[object Function]'
}

export type WriteOpts = {
  progress?: (p: Progress) => void
  entryption?: {
    ServerSideEncryption: ServerSideEncryption
    SSEKMSKeyId?: string
  }
}

export class S3Storage extends Storage {
  protected client: S3Client
  protected bucket: string
  protected sanitize: (key: string) => string

  constructor(opts?: {
    region?: string
    bucket?: string
    accessKeyId?: string
    secretAccessKey?: string
    sanitizeKey?: ((key: string) => string) | boolean
  }) {
    super()
    const { region, bucket, accessKeyId, secretAccessKey, sanitizeKey = false } = opts ?? {}

    this.client = new S3Client({
      region,
      ...(accessKeyId && secretAccessKey ? { credentials: { accessKeyId, secretAccessKey } } : {}),
    })

    this.bucket = bucket ?? ''

    if (isFunction(sanitizeKey)) {
      this.sanitize = sanitizeKey
    } else if (typeof sanitizeKey === 'boolean') {
      this.sanitize = sanitizeKey === true ? sanitize : value => value
    } else {
      throw new TypeError(
        'Invalid sanitizeKey option. If provided, should be a function or boolean',
      )
    }
  }

  async write(key: string, fileReadable: Readable, opts?: WriteOpts): Promise<string> {
    key = this.sanitize(key)
    const upload = new Upload({
      client: this.client,
      params: {
        Key: key,
        Bucket: this.bucket,
        Body: fileReadable,
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

  async copy(key: string, destKey: string): Promise<string> {
    const copyParams: CopyObjectCommandInput = {
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${this.sanitize(key)}`,
      Key: this.sanitize(destKey),
    }

    await this.client.send(new CopyObjectCommand(copyParams))
    return destKey
  }

  async move(key: string, destKey: string): Promise<string> {
    await this.copy(key, destKey)
    await this.remove(key)
    return destKey
  }
}
