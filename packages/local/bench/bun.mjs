import { randomUUID } from 'node:crypto'
import { mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = join(tmpdir(), randomUUID())
await mkdir(root, { recursive: true })

// test fot non existing file
const nonExistingFile = Bun.file(`${root}/nonExistingFile.txt`)
console.log('nonExistingFile', nonExistingFile)
console.log('nonExistingFile.size', nonExistingFile.size)
console.log('nonExistingFile.type', nonExistingFile.type)
console.log('nonExistingFile.name', nonExistingFile.name)
console.log('nonExistingFile.lastModified', nonExistingFile.lastModified)
// console.log('nonExistingFile.arrayBuffer', await nonExistingFile.arrayBuffer())
// console.log('nonExistingFile.text', await nonExistingFile.text())
console.log('nonExistingFile.stream', await nonExistingFile.stream())
console.log('consuming the stream')
for await (const line of await nonExistingFile.stream()) {
  console.log('line', line)
}
console.log('consumed the stream')

// test for empty file
await Bun.write(`${root}/emptyFile.txt`, '')
const emptyFile = Bun.file(`${root}/emptyFile.txt`)
console.log('emptyFile', emptyFile)
console.log('emptyFile.size', emptyFile.size)
console.log('emptyFile.type', emptyFile.type)
console.log('emptyFile.name', emptyFile.name)
console.log('emptyFile.lastModified', emptyFile.lastModified)
console.log('emptyFile.arrayBuffer', await emptyFile.arrayBuffer())
console.log('emptyFile.text', await emptyFile.text())
console.log('emptyFile.stream', await emptyFile.stream())
console.log('consuming the stream')
for await (const line of await emptyFile.stream()) {
  console.log('line', line)
}
console.log('consumed the stream')

// test for existing file with content
await Bun.write(`${root}/hello.txt`, 'hello')
const file = Bun.file(`${root}/hello.txt`)
console.log('file', file)
console.log('file.size', file.size)
console.log('file.type', file.type)
console.log('file.name', file.name)
console.log('file.lastModified', file.lastModified)
console.log('file.arrayBuffer', await file.arrayBuffer())
console.log('file.text', await file.text())
console.log('file.stream', await file.stream())
console.log('consuming the stream')
for await (const line of await file.stream()) {
  console.log('line', line)
}
console.log('consumed the stream')

// await file.stream()
// console.log('------------------------------')
// console.log('file', file)
// console.log('file.size', file.size)
// console.log('file.type', file.type)
// console.log('file.name', file.name)
// console.log('file.lastModified', file.lastModified)
