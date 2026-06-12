import type { Readable } from 'node:stream'
import type { BusFile, BusFileMetadata } from './file.ts'

type CreateStream = () => Readable | Promise<Readable>

export interface Adapter {
  set(data: BusFile): Promise<string>
  get(key: string): Promise<CreateStream>
  metadata(key: string): Promise<BusFileMetadata>
  delete(key: string): Promise<void>
}
