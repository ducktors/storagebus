import { Readable } from 'node:stream'
import { BusFile, isBusFile } from './file.js'

import { logger as defaultLogger } from './logger.js'
import { sanitize } from './sanitize-key.js'
import { Driver } from './memory.js'

function isFunction(x: unknown): x is (x: string) => string {
  return Object.prototype.toString.call(x) === '[object Function]'
}
export { type Driver }

type Data = (() => Readable | Promise<Readable>) | Buffer | string | BusFile

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
        'Invalid data: must be a string, Buffer, Readable, BusFile or null.',
      )
    }
    if (data === null) {
      await this.#driver.delete(path)
    } else {
      let _data: Data
      if (isBusFile(data)) {
        _data = () => data.stream()
      } else {
        _data = data
      }

      const file = new BusFile(_data, path, { type: contentType })
      await this.#driver.set(file)
    }

    return path
  }

  async file(path: string): Promise<BusFile> {
    const destination = this.sanitize(path)
    const data = await this.#driver.get(destination)
    const metadata = await this.#driver.metadata(destination)

    const getMetadata = this.#driver.metadata.bind(this.#driver, destination)

    return new BusFile(data, destination, { ...metadata, getMetadata })
  }
}
