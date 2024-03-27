import { randomUUID } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStorage } from '../dist/local.js'
// https://github.com/oven-sh/bun/blob/main/bench/snippets/write.bun.js
import { bench, run } from './runner.mjs'

const storage = createStorage({ root: join(tmpdir(), randomUUID()) })
const shortStringPaths = []
const shortBuffers = []

for (let j = 0; j < 1000; j++) {
  shortStringPaths.push(randomUUID())
}

for (let j = 0; j < 1000; j++) {
  shortBuffers.push(randomUUID())
}

bench('write(path, "short string")', async () => {
  for (const path of shortStringPaths) {
    await storage.write(`${path}/short.txt`, 'short string')
  }
})

const buffer = Buffer.from('short string')
bench('write(path, Buffer.from("short string"))', async () => {
  for (const path of shortStringPaths) {
    await storage.write(`${path}/short.txt`, buffer)
  }
})

await run()
