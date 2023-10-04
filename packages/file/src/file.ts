import { PassThrough, Readable } from 'node:stream'
import { mime } from './mime/mime.js'

const kBusFile = Symbol('storagebus-file')

export function isBusFile(value: unknown): value is BusFile {
  return value instanceof BusFile || !!(value && (value as any)[kBusFile])
}

type CreateStream = () => Readable | Promise<Readable>
type GetMetadata = () => BusFileMetadata | Promise<BusFileMetadata>
type GetMetadataOption = GetMetadata | undefined
type LastModified = number | undefined
type Type = string | undefined
type Size = number | undefined
export type BusFileMetadata = {
  lastModified?: LastModified
  type?: Type
  size?: Size
}
export type Options = BusFileMetadata & { getMetadata?: GetMetadataOption }

const isValidLastModified = (value: unknown): value is LastModified => {
  if (value !== undefined && typeof value !== 'number') {
    throw new TypeError(
      `"lastModified" argument must be a number, found ${typeof value}`,
    )
  }
  return true
}

const isValidSize = (value: unknown): value is Size => {
  if (value !== undefined && typeof value !== 'number') {
    throw new TypeError(
      `"size" argument must be a number, found ${typeof value}`,
    )
  }
  return true
}

const isValidType = (value: unknown): value is Type => {
  if (value !== undefined && typeof value !== 'string') {
    throw new TypeError(
      `"type" argument must be a string, found ${typeof value}`,
    )
  }
  return true
}

const isValidGetMetadataOption = (
  value: unknown,
): value is GetMetadataOption => {
  if (value !== undefined && !(value instanceof Function)) {
    throw new TypeError(
      `"getMetadata" argument must be a function, found ${typeof value}`,
    )
  }
  return true
}

function getType(type: BusFileMetadata['type'], name?: string): string {
  return type ?? mime.getType(name) ?? 'application/octet-stream'
}

function getlastModified(
  lastModified: BusFileMetadata['lastModified'],
): number {
  return lastModified || -1
}

function getSize(size: BusFileMetadata['size'], dataLength?: number): number {
  return size ?? dataLength ?? 0
}

function validateOptions(options: Options = {}) {
  isValidLastModified(options.lastModified)
  isValidSize(options.size)
  isValidType(options.type)
  isValidGetMetadataOption(options.getMetadata)
}

export class BusFile {
  [kBusFile] = true
  #buffer: Buffer | null = null
  #createStream: CreateStream
  #lastModified: number
  #metadata: GetMetadata
  #name: string
  #size: number
  #string: string | null = null
  #type: string

  constructor(
    data: CreateStream | Buffer | string | null,
    name: string,
    options?: Options,
  ) {
    const { getMetadata, ...metadata } = options || {}
    validateOptions(options)

    if (!(typeof name === 'string')) {
      throw new TypeError(
        `"name" argument must be a string, found ${typeof name}`,
      )
    }

    if (data instanceof Function) {
      this.#buffer = null
      this.#createStream = data
      this.#size = getSize(metadata.size)
      this.#string = null
    } else if (typeof data === 'string') {
      this.#buffer = null
      this.#createStream = () => Readable.from(data)
      this.#size = getSize(metadata.size, data.length)
      this.#string = data
    } else if (Buffer.isBuffer(data)) {
      this.#buffer = data
      this.#createStream = () => Readable.from(data)
      this.#size = getSize(metadata.size, data.length)
      this.#string = null
    } else if (data === null) {
      this.#buffer = null
      this.#createStream = () => Readable.from(new PassThrough().end())
      this.#size = getSize(0)
      this.#string = null
    } else {
      throw new TypeError(
        `"data" argument must be null, a string, an instance of Buffer or a function returning a Readable, found ${typeof data}`,
      )
    }

    this.#name = name

    this.#lastModified = getlastModified(metadata.lastModified)
    this.#metadata = getMetadata ?? (() => metadata)
    this.#type = getType(metadata.type, name)
  }

  get name(): string {
    return this.#name
  }
  get lastModified(): number {
    return this.#lastModified
  }
  get type(): string {
    return this.#type
  }
  get size(): number {
    return this.#size
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const buf = await this.buffer()
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length)
  }

  async text(encoding: BufferEncoding = 'utf8'): Promise<string> {
    if (this.#string) {
      return this.#string
    }
    this.#string = (await this.buffer()).toString(encoding)
    return this.#string
  }

  async buffer(): Promise<Buffer> {
    if (this.#buffer) {
      return this.#buffer
    }
    const stream = await this.stream()
    const inputStream = stream.readableObjectMode
      ? Readable.from(stream, { objectMode: false })
      : stream

    this.#buffer = Buffer.concat(await inputStream.toArray())
    return this.#buffer
  }

  async stream(): Promise<Readable> {
    const metadata = await this.#metadata()

    this.#lastModified = getlastModified(metadata.lastModified)
    this.#type = getType(metadata.type, this.#name)
    this.#size = getSize(metadata.size)
    this.#buffer = null
    this.#string = null

    return this.#createStream()
  }
}
