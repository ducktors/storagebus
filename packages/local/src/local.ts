import { once } from 'node:events'
import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir, stat, unlink } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import type { Adapter } from '@storagebus/storage'
import { ENOENT } from '@storagebus/storage/errors'

export type AdapterOptions = {
  root: string
}

export function createAdapter(options: AdapterOptions): Adapter {
  const { root } = options

  return {
    async set(file) {
      const path = join(root, file.name)
      try {
        await pipeline(await file.stream(), createWriteStream(path))
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          throw error
        }

        const folder = dirname(path)
        await mkdir(folder, { recursive: true })
        await pipeline(await file.stream(), createWriteStream(path))
      }

      return path
    },
    async get(destination) {
      const path = join(root, destination)

      return async () => {
        try {
          const fileStream = createReadStream(path)
          await once(fileStream, 'open')
          return fileStream
        } catch (error: any) {
          if (error.code === 'ENOENT') {
            throw new ENOENT(destination)
          }
          /* c8 ignore next 2 */
          throw error
        }
      }
    },
    async metadata(destination) {
      try {
        const path = join(root, destination)
        const stats = await stat(path)

        return {
          size: stats.size,
          lastModified: stats.mtime.getTime(),
        }
      } catch {
        return {
          size: 0,
          lastModified: -1,
        }
      }
    },
    async delete(destination) {
      const path = join(root, destination)
      try {
        await unlink(path)
        /* c8 ignore next 4 */
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          throw error
        }
      }
    },
  }
}
