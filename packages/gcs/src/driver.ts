import { pipeline } from 'node:stream/promises'

import * as GCS from '@google-cloud/storage'
import type {
  Driver,
  StorageOptions as StorageBusOptions,
} from '@storagebus/storage'
import { ENOENT } from '@storagebus/storage/errors'

type StorageFile = Pick<
  GCS.File,
  'createWriteStream' | 'createReadStream' | 'exists'
> & {
  getMetadata(): Promise<[GCS.GetFileMetadataResponse[0], ...unknown[]]>
  delete(options?: GCS.DeleteFileOptions): Promise<unknown>
}

type StorageBucket = {
  file(path: string): StorageFile
}

type StorageClient = {
  bucket(name: string): StorageBucket
}

export type StorageOptions = {
  bucket: string
  projectId?: string
  clientEmail?: string
  privateKey?: string
  client?: StorageClient
} & StorageBusOptions

export function driver(options: StorageOptions): Driver {
  const { bucket, client, clientEmail, privateKey, projectId } = options

  let storageClient: StorageClient
  if (client) {
    storageClient = client
  } else if (!(clientEmail && privateKey && projectId)) {
    storageClient = new GCS.Storage()
  } else {
    storageClient = new GCS.Storage({
      projectId,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    })
  }

  const b = storageClient.bucket(bucket)

  return {
    async set(data) {
      const file = b.file(data.name)
      await pipeline(
        await data.stream(),
        file.createWriteStream({
          contentType: data.type,
        }),
      )
      return data.name
    },
    async get(path) {
      return async () => {
        const file = b.file(path)
        const [exists] = await file.exists()

        if (!exists) throw new ENOENT(path)
        return file.createReadStream()
      }
    },
    async metadata(path) {
      try {
        const file = b.file(path)
        const [metadata] = await file.getMetadata()

        return {
          type: metadata.contentType,
          size: metadata.size ? +metadata.size : 0,
          lastModified: metadata.updated
            ? /* c8 ignore next 9 */
              new Date(metadata.updated).getTime()
            : -1,
        }
      } catch {
        return {
          size: 0,
          lastModified: -1,
        }
      }
    },
    async delete(path) {
      const file = b.file(path)
      await file.delete({ ignoreNotFound: true })
    },
  }
}

export default { driver }
