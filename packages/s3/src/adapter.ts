import type { Readable } from 'node:stream'

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import type {
  Adapter,
  StorageOptions as StorageBusOptions,
} from '@storagebus/storage'
import { ENOENT } from '@storagebus/storage/errors'

type S3ClientLike = {
  send(command: GetObjectCommand): Promise<{ Body?: unknown }>
  send(command: HeadObjectCommand): Promise<{
    ContentType?: string
    LastModified?: Date
    ContentLength?: number
  }>
  send(command: DeleteObjectCommand): Promise<unknown>
}

type UploadObject = (params: PutObjectCommandInput) => Promise<void>

export type StorageOptions = {
  bucket: string
  region?: string
  accessKeyId?: string
  secretAccessKey?: string
  endpoint?: string
  client?: S3ClientLike
  upload?: UploadObject
} & StorageBusOptions

export function adapter(options: StorageOptions): Adapter {
  const {
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    endpoint,
    client: providedClient,
    upload: providedUpload,
  } = options

  const client: S3ClientLike =
    providedClient ??
    (new S3Client({
      forcePathStyle: true,
      /* c8 ignore next 5 */
      ...(region ? { region } : {}),
      ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
      ...(endpoint ? { endpoint } : {}),
    }) as unknown as S3ClientLike)

  const uploadObject: UploadObject =
    providedUpload ??
    (async (params) => {
      const upload = new Upload({
        client: client as S3Client,
        params,
      })
      await upload.done()
    })

  return {
    async set(data) {
      await uploadObject({
        Key: data.name,
        Bucket: bucket,
        Body: await data.stream(),
        ContentType: data.type,
      })
      return data.name
    },
    async get(path) {
      return async () => {
        try {
          const { Body } = await client.send(
            new GetObjectCommand({
              Bucket: bucket,
              Key: path,
            }),
          )
          return Body as Readable
        } catch (err) {
          if ((err as Error).name === 'NoSuchKey') {
            throw new ENOENT(path)
          }
          /* c8 ignore next 2 */
          throw err
        }
      }
    },
    async metadata(path) {
      try {
        const { ContentType, LastModified, ContentLength } = await client.send(
          new HeadObjectCommand({
            Bucket: bucket,
            Key: path,
          }),
        )

        return {
          type: ContentType,
          lastModified: LastModified?.getTime(),
          size: ContentLength,
        }
      } catch {
        return {
          size: 0,
          lastModified: -1,
        }
      }
    },
    async delete(path) {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: path,
        }),
      )
    },
  }
}

export default { adapter }
