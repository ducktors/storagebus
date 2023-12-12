import { randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = join(tmpdir(), randomUUID())
await mkdir(root, { recursive: true })

const nonExistingFile = createReadStream(`${root}/nonExistingFile.txt`)
