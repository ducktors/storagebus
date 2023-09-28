import { PassThrough, Readable } from 'node:stream'

const kBuffer = Symbol('storagebus-buffer')
const kBusFile = Symbol('storagebus-file')
const kCreateStream = Symbol('storagebus-createStream')
const kMetadata = Symbol('storagebus-metadata')
const kLastModified = Symbol('storagebus-lastModified')
const kName = Symbol('storagebus-name')
const kSize = Symbol('storagebus-size')
const kString = Symbol('storagebus-string')
const kType = Symbol('storagebus-type')

export function isBusFile(value: unknown): value is BusFile {
  return value instanceof BusFile || !!(value && (value as any)[kBusFile])
}

type CreateStream = () => Readable | Promise<Readable>
type GetMetadata = () => BusFileMetadata | Promise<BusFileMetadata>
type BusFileMetadata = {
  lastModified?: Date
  type?: string
  size?: number
}

export class BusFile {
  [kBuffer]: Buffer | null = null;
  [kBusFile] = true;
  [kCreateStream]: CreateStream;
  [kLastModified]?: Date;
  [kMetadata]: GetMetadata;
  [kName]: string;
  [kSize]?: number;
  [kString]: string | null = null;
  [kType]: string

  constructor(
    data: CreateStream | Buffer | string | null,
    name: string,
    options?: BusFileMetadata & { getMetadata?: GetMetadata },
  ) {
    const { getMetadata, ...metadata } = options || {}

    if (!(typeof name === 'string')) {
      throw new TypeError(
        `"name" argument must be a string, found ${typeof name}`,
      )
    }

    if (
      'lastModified' in metadata &&
      !(metadata.lastModified instanceof Date)
    ) {
      throw new TypeError(
        `"lastModified" argument must be a Date, found ${typeof metadata.lastModified}`,
      )
    }

    if (getMetadata !== undefined && !(getMetadata instanceof Function)) {
      throw new TypeError(
        `"getMetadata" argument must be a function, found ${typeof getMetadata}`,
      )
    }

    if ('size' in metadata && typeof metadata.size !== 'number') {
      throw new TypeError(
        `"size" argument must be a number, found ${typeof metadata.size}`,
      )
    }

    if ('type' in metadata && typeof metadata.type !== 'string') {
      throw new TypeError(
        `"type" argument must be a string, found ${typeof metadata.type}`,
      )
    }

    if (data instanceof Function) {
      this[kBuffer] = null
      this[kCreateStream] = data
      this[kSize] = metadata.size ?? undefined
      this[kString] = null
    } else if (typeof data === 'string') {
      this[kBuffer] = null
      this[kCreateStream] = () => Readable.from(data)
      this[kSize] = metadata.size ?? data.length
      this[kString] = data
    } else if (Buffer.isBuffer(data)) {
      this[kBuffer] = data
      this[kCreateStream] = () => Readable.from(data)
      this[kSize] = metadata.size ?? data.length
      this[kString] = null
    } else if (data === null) {
      this[kBuffer] = null
      this[kCreateStream] = () => Readable.from(new PassThrough().end())
      this[kSize] = 0
      this[kString] = null
    } else {
      throw new TypeError(
        `"data" argument must be null, a string, an instance of Buffer or a function returning a Readable, found ${typeof data}`,
      )
    }

    this[kLastModified] = metadata.lastModified
    this[kMetadata] = getMetadata ?? (() => metadata)
    this[kName] = name
    this[kType] = metadata.type ?? ''
  }

  get name() {
    return this[kName]
  }
  get lastModified() {
    return this[kLastModified]
  }
  get type() {
    return this[kType]
  }
  get size() {
    return this[kSize]
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const buf = await this.buffer()
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length)
  }

  async text(encoding: BufferEncoding = 'utf8'): Promise<string> {
    if (this[kString]) {
      return this[kString]
    }
    this[kString] = (await this.buffer()).toString(encoding)
    return this[kString]
  }

  async buffer(): Promise<Buffer> {
    if (this[kBuffer]) {
      return this[kBuffer]
    }
    const stream = await this.stream()
    const inputStream = stream.readableObjectMode
      ? Readable.from(stream, { objectMode: false })
      : stream

    this[kBuffer] = Buffer.concat(await inputStream.toArray())
    return this[kBuffer]
  }

  async stream() {
    const metadata = await this[kMetadata]()

    this[kLastModified] = metadata.lastModified
    this[kType] = metadata.type ?? ''
    this[kSize] = metadata.size ?? 0
    this[kBuffer] = null
    this[kString] = null

    return this[kCreateStream]()
  }
}
