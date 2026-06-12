import type { Readable } from 'node:stream'
import type { Adapter } from './adapter.ts'
import { BusFile, isBusFile } from './file.ts'

import { logger as defaultLogger } from './logger.ts'
import { sanitize } from './sanitize-key.ts'

function isFunction(x: unknown): x is (x: string) => string {
  return Object.prototype.toString.call(x) === '[object Function]'
}
export type { Adapter }

type Data = (() => Readable | Promise<Readable>) | Buffer | string | BusFile

export interface StorageOptions {
  debug?: boolean
  logger?: typeof defaultLogger
  sanitizeKey?: ((key: string) => string) | boolean
}

export class Storage {
  #adapter: Adapter
  protected _debug = false
  protected _logger: typeof defaultLogger
  protected sanitize: (key: string) => string

  constructor(
    adapter: Adapter,
    opts: StorageOptions = { logger: defaultLogger },
  ) {
    const { debug, logger = defaultLogger, sanitizeKey = false } = opts
    this.#adapter = adapter
    this._logger = logger

    if (debug) {
      this._debug = debug
    }

    if (isFunction(sanitizeKey)) {
      this.sanitize = sanitizeKey
    } else if (typeof sanitizeKey === 'boolean') {
      this.sanitize = sanitizeKey === true ? sanitize : (value) => value
    } else {
      throw new TypeError(
        'Invalid sanitizeKey option. If provided, should be a function or boolean',
      )
    }
  }

  async write(
    destination: string | BusFile,
    data: Data | null,
    contentType?: string,
  ): Promise<string> {
    const path = isBusFile(destination)
      ? destination.name
      : this.sanitize(destination)

    if (typeof path !== 'string' || path.length === 0) {
      throw new TypeError(
        'Invalid destination: must be a non-empty string or BusFile.',
      )
    }
    if (
      typeof data !== 'string' &&
      !Buffer.isBuffer(data) &&
      !isBusFile(data) &&
      typeof data !== 'function' &&
      data !== null
    ) {
      throw new TypeError(
        'Invalid data: must be a string, Buffer, function returning Readable, BusFile or null.',
      )
    }
    if (data === null) {
      await this.#adapter.delete(path)
    } else {
      const _data = isBusFile(data) ? () => data.stream() : data

      const file = new BusFile(_data, path, {
        type: contentType ?? (isBusFile(data) ? data.type : undefined),
      })
      await this.#adapter.set(file)
    }

    return path
  }

  async file(path: string): Promise<BusFile> {
    const destination = this.sanitize(path)
    const data = await this.#adapter.get(destination)
    const metadata = await this.#adapter.metadata(destination)

    const getMetadata = this.#adapter.metadata.bind(this.#adapter, destination)

    return new BusFile(data, destination, { ...metadata, getMetadata })
  }
}
