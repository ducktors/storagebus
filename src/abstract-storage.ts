import { Readable } from 'node:stream'

import { logger as defaultLogger } from './logger'

export interface AbstractStorageOptions {
  debug?: boolean
  logger?: typeof defaultLogger
}

export abstract class Storage {
  protected _debug = false
  protected _logger: typeof defaultLogger

  constructor(opts: AbstractStorageOptions = { logger: defaultLogger }) {
    const { debug, logger = defaultLogger } = opts

    this._logger = logger

    if (debug) {
      this._debug = debug
    }
  }
  public abstract write(fileName: string, fileReadable: Readable): Promise<string>
  public abstract exists(fileName: string): Promise<boolean>
  public abstract read(fileName: string): Promise<Readable>
  public abstract remove(fileName: string): Promise<void>
  public abstract copy(key: string, destKey: string): Promise<string>
  public abstract move(key: string, destKey: string): Promise<string>
}
