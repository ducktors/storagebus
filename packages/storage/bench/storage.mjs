import { createStorage } from '@storagebus/storage/memory'

;(async function main() {
  const storage = createStorage()
  await storage.write('hello.txt', 'hello', 'text/plain')
  const files = []
  for (let j = 0; j < 1000000; j++) {
    const file = await storage.file('hello.txt')
    file.type
    file.name
    file.lastModified
    files.push(file.type)
  }
  console.log(files)
})()
