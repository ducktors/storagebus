import { Readable } from 'node:stream'
import { BusFile, isBusFile } from '@storagebus/file'

import { logger as defaultLogger } from './logger.js'
import { sanitize } from './sanitize-key.js'
import { Driver } from './memory.js'

function isFunction(x: unknown): x is (x: string) => string {
  return Object.prototype.toString.call(x) === '[object Function]'
}
export { type Driver }

function isReadable(obj: unknown): obj is Readable {
  return (
    obj instanceof Readable &&
    typeof (obj as any)._read === 'function' &&
    typeof (obj as any)._readableState === 'object'
  )
}

export interface StorageOptions {
  debug?: boolean
  logger?: typeof defaultLogger
  sanitizeKey?: ((key: string) => string) | boolean
}

export class Storage {
  #driver: Driver
  protected _debug = false
  protected _logger: typeof defaultLogger
  protected sanitize: (key: string) => string

  constructor(
    driver: Driver,
    opts: StorageOptions = { logger: defaultLogger },
  ) {
    const { debug, logger = defaultLogger, sanitizeKey = false } = opts
    this.#driver = driver
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
    data: Readable | Buffer | string | null | BusFile,
    contentType?: string,
  ): Promise<string> {
    const path = isBusFile(destination)
      ? destination.name
      : this.sanitize(destination)

    if (data === null) {
      await this.#driver.delete(path)
    } else {
      let file: BusFile
      if (isBusFile(data)) {
        file = data
      } else if (isReadable(data)) {
        file = new BusFile(() => data, path)
      } else {
        file = new BusFile(data, path)
      }

      await this.#driver.set(path, file, contentType)
    }

    return path
  }

  async file(path: string): Promise<BusFile> {
    const destination = this.sanitize(path)
    const data = await this.#driver.get(destination)
    const metadata = await this.#driver.metadata(destination)

    if (data === null) {
      return new BusFile(null, destination)
    }

    return new BusFile(data, destination, metadata)
  }
}
