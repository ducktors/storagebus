import { pipeline } from 'node:stream/promises'

import {
  StorageOptions as StorageBusOptions,
  Driver,
} from '@storagebus/storage'
import * as GCS from '@google-cloud/storage'
import { ENOENT } from '@storagebus/storage/errors'

export type StorageOptions = {
  bucket: string
  projectId?: string
  clientEmail?: string
  privateKey?: string
} & StorageBusOptions

export function driver(options: StorageOptions): Driver {
  const { bucket, clientEmail, privateKey, projectId } = options

  let client: GCS.Storage
  if (!(clientEmail && privateKey && projectId)) {
    client = new GCS.Storage()
  } else {
    client = new GCS.Storage({
      projectId,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    })
  }

  const b = client.bucket(bucket)

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
            ? new Date(metadata.updated).getTime()
            : -1,
        }
      } catch (err) {
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
