import { escape } from 'node:querystring'
import { Readable } from 'node:stream'

import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  HeadObjectCommand,
  HeadObjectCommandInput,
  S3Client,
  ServerSideEncryption,
} from '@aws-sdk/client-s3'
import { Progress, Upload } from '@aws-sdk/lib-storage'

import { Storage } from './abstract-storage'

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

  constructor(opts?: {
    region?: string
    bucket?: string
    accessKeyId?: string
    secretAccessKey?: string
  }) {
    super()
    const { region, bucket, accessKeyId, secretAccessKey } = opts ?? {}

    this.client = new S3Client({
      region,
      ...(accessKeyId && secretAccessKey ? { credentials: { accessKeyId, secretAccessKey } } : {}),
    })

    this.bucket = bucket ?? ''
  }

  async write(key: string, fileReadable: Readable, opts?: WriteOpts): Promise<void> {
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
  }

  async exists(key: string): Promise<boolean> {
    const headParams: HeadObjectCommandInput = {
      Bucket: this.bucket,
      Key: escape(key),
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
      Key: escape(key),
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
      Key: escape(key),
    }

    await this.client.send(new DeleteObjectCommand(deleteParams))
  }
}
