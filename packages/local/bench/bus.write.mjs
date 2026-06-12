import { randomUUID } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStorage } from '../dist/local.js'
import { bench, run } from './runner.mjs'

const storage = createStorage({ root: join(tmpdir(), randomUUID()) })
const shortStringPaths = []

for (let j = 0; j < 1000; j++) {
  shortStringPaths.push(randomUUID())
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
