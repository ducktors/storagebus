import type { Readable } from 'node:stream'
import type { BusFile, BusFileMetadata } from './file.ts'

type CreateStream = () => Readable | Promise<Readable>

export interface Adapter {
  set(data: BusFile): Promise<string>
  get(path: string): Promise<CreateStream | Buffer | string>
  metadata(path: string): Promise<BusFileMetadata>
  delete(path: string): Promise<void>
}
