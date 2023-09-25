import { Readable } from 'node:stream'

import { logger as defaultLogger } from './logger.js'
import { sanitize } from './sanitize-key.js'

function isFunction(x: unknown): x is (x: string) => string {
  return Object.prototype.toString.call(x) === '[object Function]'
}

export interface StorageOptions {
  debug?: boolean
  logger?: typeof defaultLogger
  sanitizeKey?: ((key: string) => string) | boolean
}

export abstract class Storage {
  protected _debug = false
  protected _logger: typeof defaultLogger
  protected sanitize: (key: string) => string

  constructor(opts: StorageOptions = { logger: defaultLogger }) {
    const { debug, logger = defaultLogger, sanitizeKey = false } = opts

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
  public abstract write(
    fileName: string,
    fileReadable: Readable,
  ): Promise<string>
  public abstract exists(fileName: string): Promise<boolean>
  public abstract read(fileName: string): Promise<Readable>
  public abstract remove(fileName: string): Promise<void>
  public abstract copy(key: string, destKey: string): Promise<string>
  public abstract move(key: string, destKey: string): Promise<string>
  async toBuffer(readableStream: Readable): Promise<Buffer> {
    const inputStream = readableStream.readableObjectMode
      ? Readable.from(readableStream, { objectMode: false })
      : readableStream

    const chunks = []
    for await (const chunk of inputStream) {
      chunks.push(chunk)
    }
    return Buffer.concat(chunks)
  }
}
