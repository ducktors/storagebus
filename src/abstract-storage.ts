import { Readable } from 'node:stream'

export abstract class Storage {
  public abstract write(fileName: string, fileReadable: Readable): Promise<void>
  public abstract exists(fileName: string): Promise<boolean>
  public abstract read(fileName: string): Promise<Readable>
  public abstract remove(fileName: string): Promise<void>
}
