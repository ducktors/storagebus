import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdir } from 'node:fs/promises'
import { createReadStream } from 'node:fs'

const root = join(tmpdir(), randomUUID())
await mkdir(root, { recursive: true })

const nonExistingFile = createReadStream(`${root}/nonExistingFile.txt`)
