import { createStorage } from '@storagebus/storage/memory'

function driver() {
  const storage = new Map()
  return {
    async set(destination, data, contentType) {
      const buffer = await data.buffer()
      storage.set(destination, {
        lastModified: new Date(),
        size: buffer.length,
        data: buffer,
        type: contentType || '',
      })
      return destination
    },
    async get(path) {
      return storage.get(path)?.data ?? null
    },
    async metadata(path) {
      const data = storage.get(path)

      if (!data) {
        return {}
      }
      return {
        size: data.size,
        lastModified: data.lastModified,
        type: data.type,
        getMetdata: () => data,
      }
    },
    async delete(path) {
      storage.delete(path)
    },
  }
}
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
