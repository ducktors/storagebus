// https://github.com/oven-sh/bun/blob/main/bench/snippets/write.bun.js
import { bench, run } from './runner.mjs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { mkdir } from 'node:fs/promises'

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
      await Bun.write(`${path}/short.txt`, 'short string')
    } catch (error) {
      if (error.code === 'ENOENT') {
        const folder = dirname(path)
        await mkdir(path, { recursive: true })
      }
      await Bun.write(`${path}/short.txt`, 'short string')
    }
  }
})

const buffer = Buffer.from('short string')
bench('write(path, Buffer.from("short string"))', async () => {
  for (const path of shortStringPaths) {
    try {
      await Bun.write(`${path}/short.txt`, buffer)
    } catch (error) {
      if (error.code === 'ENOENT') {
        const folder = dirname(path)
        await mkdir(folder, { recursive: true })
      }
      await Bun.write(`${path}/short.txt`, buffer)
    }
  }
})

await run()
