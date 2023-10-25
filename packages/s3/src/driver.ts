import { Readable } from 'node:stream'

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import {
  StorageOptions as StorageBusOptions,
  Driver,
} from '@storagebus/storage'
import { ENOENT } from '@storagebus/storage/errors'

export type StorageOptions = {
  bucket: string
  region?: string
  accessKeyId?: string
  secretAccessKey?: string
  endpoint?: string
} & StorageBusOptions

export function driver(options: StorageOptions): Driver {
  const { bucket, region, accessKeyId, secretAccessKey, endpoint } = options

  const client = new S3Client({
    forcePathStyle: true,
    ...(region ? { region } : {}),
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : /* c8 ignore next */
        {}),
    ...(endpoint ? { endpoint: endpoint } : {}),
  })

  return {
    async set(data) {
      const upload = new Upload({
        client,
        params: {
          Key: data.name,
          Bucket: bucket,
          Body: await data.stream(),
          ContentType: data.type,
        },
      })
      await upload.done()
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
          /* c8 ignore next */
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
      } catch (err) {
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

export default { driver }
