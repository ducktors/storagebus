import { randomUUID } from 'node:crypto'
import { createReadStream, createWriteStream, writeFile } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { bench, run } from './runner.mjs'

const root = join(tmpdir(), randomUUID())
const shortStringPaths = []
const shortBuffers = []

for (let j = 0; j < 1000; j++) {
  shortStringPaths.push(join(root, randomUUID()))
}
for (let j = 0; j < 1000; j++) {
  shortBuffers.push(join(root, randomUUID()))
}

bench('write(path, "short string")', async () => {
  for (const path of shortStringPaths) {
    try {
      await pipeline(Readable.from('short string'), createWriteStream(path))
    } catch (error) {
      if (error.code === 'ENOENT') {
        const folder = dirname(path)
        await mkdir(folder, { recursive: true })
      }
      await pipeline(Readable.from('short string'), createWriteStream(path))
    }
  }
})

const buffer = Buffer.from('short string')
bench('write(path, Buffer.from("short string"))', async () => {
  for (const path of shortStringPaths) {
    try {
      await pipeline(Readable.from(buffer), createWriteStream(path))
    } catch (error) {
      if (error.code === 'ENOENT') {
        const folder = dirname(path)
        await mkdir(folder, { recursive: true })
      }
      await pipeline(Readable.from(buffer), createWriteStream(path))
    }
  }
})

await run()
