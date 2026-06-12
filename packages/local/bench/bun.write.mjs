import { randomUUID } from 'node:crypto'
import { mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { bench, run } from './runner.mjs'

const root = join(tmpdir(), randomUUID())
const shortStringPaths = []

for (let j = 0; j < 1000; j++) {
  shortStringPaths.push(join(root, randomUUID()))
}

bench('write(path, "short string")', async () => {
  for (const path of shortStringPaths) {
    try {
      await Bun.write(`${path}/short.txt`, 'short string')
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }

      const folder = dirname(path)
      await mkdir(folder, { recursive: true })
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
      if (error.code !== 'ENOENT') {
        throw error
      }

      const folder = dirname(path)
      await mkdir(folder, { recursive: true })
      await Bun.write(`${path}/short.txt`, buffer)
    }
  }
})

await run()
