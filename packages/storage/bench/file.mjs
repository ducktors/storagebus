import { Readable } from 'node:stream'
import { BusFile } from '@storagebus/storage/file'

for (let j = 0; j < 100000000; j++) {
  const file = new BusFile(() => Readable.from('hello'), 'hello.txt')
  file.size
  file.type
  file.name
  file.lastModified
}
