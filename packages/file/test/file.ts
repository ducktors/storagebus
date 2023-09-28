import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Readable } from 'node:stream'

import { BusFile } from '../src/file.js'

test('@storagebus/file', async () => {
  await test(`creates new File instance from a '() => Readable' function`, async () => {
    const file = new BusFile(() => Readable.from('hello'), 'hello.txt')

    assert.equal(file.name, 'hello.txt')
    assert.equal(file.lastModified, undefined)
    assert.equal(file.size, undefined)
    assert.equal(file.type, '')
    assert.equal((await file.stream()) instanceof Readable, true)
    assert.equal(await file.text(), 'hello')
    assert.equal((await file.buffer()) instanceof Buffer, true)
    assert.equal((await file.arrayBuffer()) instanceof ArrayBuffer, true)
  })

  await test(`creates new File instance from a '() => Readable({ objectMode: false })'`, async () => {
    const stream = Readable.from('hello', { objectMode: false })
    const file = new BusFile(() => stream, 'hello.txt')

    assert.equal(file.name, 'hello.txt')
    assert.equal(file.lastModified, undefined)
    assert.equal(file.size, undefined)
    assert.equal(file.type, '')
    assert.equal((await file.stream()) instanceof Readable, true)
    assert.equal(await file.text(), 'hello')
    assert.equal((await file.buffer()) instanceof Buffer, true)
    assert.equal((await file.arrayBuffer()) instanceof ArrayBuffer, true)
  })

  await test('creates new File instance from a string', async () => {
    const file = new BusFile('hello', 'hello.txt')

    assert.equal(file.name, 'hello.txt')
    assert.equal(file.lastModified, undefined)
    assert.equal(file.size, 5)
    assert.equal(file.type, '')
    assert.equal((await file.stream()) instanceof Readable, true)
    assert.equal(await file.text(), 'hello')
    assert.equal((await file.buffer()) instanceof Buffer, true)
    assert.equal((await file.arrayBuffer()) instanceof ArrayBuffer, true)
  })

  await test('creates new File instance from a string with metadata', async () => {
    const lastModified = new Date()
    const file = new BusFile('hello', 'hello.txt', {
      size: 5,
      lastModified,
      type: 'text/plain',
    })

    assert.equal(file.name, 'hello.txt')
    assert.equal(file.lastModified, lastModified)
    assert.equal(file.size, 5)
    assert.equal(file.type, 'text/plain')
  })

  await test('creates new File instance from a Buffer', async () => {
    const file = new BusFile(Buffer.from('hello'), 'hello.txt')

    assert.equal(file.name, 'hello.txt')
    assert.equal(file.lastModified, undefined)
    assert.equal(file.size, 5)
    assert.equal(file.type, '')
    assert.equal((await file.stream()) instanceof Readable, true)
    assert.equal(await file.text(), 'hello')
    assert.equal((await file.buffer()) instanceof Buffer, true)
    assert.equal((await file.arrayBuffer()) instanceof ArrayBuffer, true)
  })

  await test('creates new File instance from a Buffer with metadata', async () => {
    const lastModified = new Date()
    const file = new BusFile(Buffer.from('hello'), 'hello.txt', {
      size: 5,
      lastModified,
      type: 'text/plain',
    })

    assert.equal(file.name, 'hello.txt')
    assert.equal(file.lastModified, lastModified)
    assert.equal(file.size, 5)
    assert.equal(file.type, 'text/plain')
  })

  await test('creates new File empty instance from null', async () => {
    const file = new BusFile(null, 'hello.txt')

    assert.equal(file.name, 'hello.txt')
    assert.equal(file.lastModified, undefined)
    assert.equal(file.size, 0)
    assert.equal(file.type, '')
    assert.equal((await file.stream()) instanceof Readable, true)
    assert.equal(await file.text(), '')
    assert.equal((await file.buffer()) instanceof Buffer, true)
    assert.equal((await file.arrayBuffer()) instanceof ArrayBuffer, true)
  })

  await test('throws when creating from unsupported data type', async () => {
    assert.throws(
      () =>
        // @ts-expect-error
        new BusFile({}, 'hello.txt'),
      TypeError(
        `"data" argument must be null, a string, an instance of Buffer or a function returning a Readable, found ${typeof {}}`,
      ),
    )
    assert.throws(
      () =>
        // @ts-expect-error
        new BusFile(2, 'hello.txt'),
      TypeError(
        `"data" argument must be null, a string, an instance of Buffer or a function returning a Readable, found ${typeof 2}`,
      ),
    )
    assert.throws(
      () =>
        // @ts-expect-error
        new BusFile(false, 'hello.txt'),
      TypeError(
        `"data" argument must be null, a string, an instance of Buffer or a function returning a Readable, found ${typeof false}`,
      ),
    )
    assert.throws(
      () =>
        // @ts-expect-error
        new BusFile(undefined, 'hello.txt'),
      TypeError(
        `"data" argument must be null, a string, an instance of Buffer or a function returning a Readable, found ${typeof undefined}`,
      ),
    )
  })

  await test('throws when name is not a string', async () => {
    const fileContent = Buffer.from('hello')

    assert.throws(
      () =>
        new BusFile(
          fileContent,
          // @ts-expect-error
          {},
        ),
      TypeError(`"name" argument must be a string, found ${typeof {}}`),
    )
    assert.throws(
      () =>
        // @ts-expect-error
        new BusFile(fileContent, 2),
      TypeError(`"name" argument must be a string, found ${typeof 2}`),
    )
    assert.throws(
      () =>
        // @ts-expect-error
        new BusFile(fileContent, false),
      TypeError(`"name" argument must be a string, found ${typeof false}`),
    )
    assert.throws(
      () =>
        // @ts-expect-error
        new BusFile(fileContent, null),
      TypeError(`"name" argument must be a string, found ${typeof null}`),
    )
    assert.throws(
      () =>
        // @ts-expect-error
        new BusFile(fileContent, undefined),
      TypeError(`"name" argument must be a string, found ${typeof undefined}`),
    )
  })

  await test('throws when lastModified is not a Date', async () => {
    const fileContent = Buffer.from('hello')
    const fileName = 'hello.txt'

    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          lastModified: {},
        }),
      TypeError(`"lastModified" argument must be a Date, found ${typeof {}}`),
    )
    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          lastModified: 2,
        }),
      TypeError(`"lastModified" argument must be a Date, found ${typeof 2}`),
    )
    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          lastModified: false,
        }),
      TypeError(
        `"lastModified" argument must be a Date, found ${typeof false}`,
      ),
    )
    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          lastModified: null,
        }),
      TypeError(`"lastModified" argument must be a Date, found ${typeof null}`),
    )
  })

  await test('throws when size is not a number', async () => {
    const fileContent = Buffer.from('hello')
    const fileName = 'hello.txt'

    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          size: {},
        }),
      TypeError(`"size" argument must be a number, found ${typeof {}}`),
    )
    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          size: '',
        }),
      TypeError(`"size" argument must be a number, found ${typeof ''}`),
    )
    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          size: false,
        }),
      TypeError(`"size" argument must be a number, found ${typeof false}`),
    )
    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          size: null,
        }),
      TypeError(`"size" argument must be a number, found ${typeof null}`),
    )
    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          size: () => {},
        }),
      TypeError(`"size" argument must be a number, found ${typeof (() => {})}`),
    )
  })

  await test('throws when type is not a string', async () => {
    const fileContent = Buffer.from('hello')
    const fileName = 'hello.txt'

    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          type: {},
        }),
      TypeError(`"type" argument must be a string, found ${typeof {}}`),
    )
    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          type: 2,
        }),
      TypeError(`"type" argument must be a string, found ${typeof 2}`),
    )
    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          type: false,
        }),
      TypeError(`"type" argument must be a string, found ${typeof false}`),
    )
    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          type: null,
        }),
      TypeError(`"type" argument must be a string, found ${typeof null}`),
    )
    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          type: () => {},
        }),
      TypeError(`"type" argument must be a string, found ${typeof (() => {})}`),
    )
  })

  await test('throws when getMetadata is not a function', async () => {
    const fileContent = Buffer.from('hello')
    const fileName = 'hello.txt'

    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          getMetadata: '',
        }),
      TypeError(
        `"getMetadata" argument must be a function, found ${typeof ''}`,
      ),
    )
    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          getMetadata: {},
        }),
      TypeError(
        `"getMetadata" argument must be a function, found ${typeof {}}`,
      ),
    )
    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          getMetadata: 2,
        }),
      TypeError(`"getMetadata" argument must be a function, found ${typeof 2}`),
    )
    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          getMetadata: false,
        }),
      TypeError(
        `"getMetadata" argument must be a function, found ${typeof false}`,
      ),
    )
    assert.throws(
      () =>
        new BusFile(fileContent, fileName, {
          // @ts-expect-error
          getMetadata: null,
        }),
      TypeError(
        `"getMetadata" argument must be a function, found ${typeof null}`,
      ),
    )
  })

  await test('creating from function returning a Readable works as expected', async (t) => {
    const lastModified = new Date()
    const fileContent = 'hello'
    const metadata = {
      lastModified,
      size: fileContent.length,
      type: 'text/plain',
    }
    const file = new BusFile(() => Readable.from(fileContent), 'hello.txt', {
      ...metadata,
      getMetadata: () => metadata,
    })

    const streamSpy = t.mock.method(file, 'stream')
    const textSpy = t.mock.method(file, 'text')
    const bufferSpy = t.mock.method(file, 'buffer')
    const arrayBufferSpy = t.mock.method(file, 'arrayBuffer')

    assert.equal(file.name, 'hello.txt')
    assert.equal(file.lastModified, metadata.lastModified)
    assert.equal(file.size, metadata.size)
    assert.equal(file.type, metadata.type)

    const stream = await file.stream()
    const text = await file.text()
    const buffer = await file.buffer()
    const arrayBuffer = await file.arrayBuffer()

    assert.equal(stream instanceof Readable, true)
    assert.equal(typeof text === 'string', true)
    assert.equal(buffer instanceof Buffer, true)
    assert.equal(arrayBuffer instanceof ArrayBuffer, true)

    assert.equal(buffer.toString('utf8'), fileContent)
    assert.equal(new TextDecoder('utf-8').decode(arrayBuffer), fileContent)

    assert.equal(streamSpy.mock.calls.length, 2, 'stream called twice')
    assert.equal(textSpy.mock.calls.length, 1, 'text called once')
    assert.equal(bufferSpy.mock.calls.length, 3, 'buffer called thrice')
    assert.equal(arrayBufferSpy.mock.calls.length, 1, 'arrayBuffer called once')
  })

  await test('creating from string works as expected', async (t) => {
    const lastModified = new Date()
    const fileContent = 'hello'
    const metadata = {
      lastModified,
      size: fileContent.length,
      type: 'text/plain',
    }
    const file = new BusFile(fileContent, 'hello.txt', {
      ...metadata,
      getMetadata: () => metadata,
    })

    const streamSpy = t.mock.method(file, 'stream')
    const textSpy = t.mock.method(file, 'text')
    const bufferSpy = t.mock.method(file, 'buffer')
    const arrayBufferSpy = t.mock.method(file, 'arrayBuffer')

    assert.equal(file.name, 'hello.txt')
    assert.equal(file.lastModified, metadata.lastModified)
    assert.equal(file.size, metadata.size)
    assert.equal(file.type, metadata.type)

    const stream = await file.stream()
    const text = await file.text()
    const buffer = await file.buffer()
    const arrayBuffer = await file.arrayBuffer()

    assert.equal(stream instanceof Readable, true)
    assert.equal(typeof text === 'string', true)
    assert.equal(buffer instanceof Buffer, true)
    assert.equal(arrayBuffer instanceof ArrayBuffer, true)

    assert.equal(buffer.toString('utf8'), fileContent)
    assert.equal(new TextDecoder('utf-8').decode(arrayBuffer), fileContent)

    assert.equal(streamSpy.mock.calls.length, 2, 'stream called twice')
    assert.equal(textSpy.mock.calls.length, 1, 'text called once')
    assert.equal(bufferSpy.mock.calls.length, 3, 'buffer called thrice')
    assert.equal(arrayBufferSpy.mock.calls.length, 1, 'arrayBuffer called once')
  })

  await test('creating from Buffer works as expected', async (t) => {
    const lastModified = new Date()
    const fileContent = 'hello'
    const metadata = {
      lastModified,
      size: fileContent.length,
      type: 'text/plain',
    }
    const file = new BusFile(Buffer.from(fileContent), 'hello.txt', {
      ...metadata,
      getMetadata: () => metadata,
    })

    const streamSpy = t.mock.method(file, 'stream')
    const textSpy = t.mock.method(file, 'text')
    const bufferSpy = t.mock.method(file, 'buffer')
    const arrayBufferSpy = t.mock.method(file, 'arrayBuffer')

    assert.equal(file.name, 'hello.txt')
    assert.equal(file.lastModified, metadata.lastModified)
    assert.equal(file.size, metadata.size)
    assert.equal(file.type, metadata.type)

    const stream = await file.stream()
    const text = await file.text()
    const buffer = await file.buffer()
    const arrayBuffer = await file.arrayBuffer()

    assert.equal(stream instanceof Readable, true)
    assert.equal(typeof text === 'string', true)
    assert.equal(buffer instanceof Buffer, true)
    assert.equal(arrayBuffer instanceof ArrayBuffer, true)

    assert.equal(buffer.toString('utf8'), fileContent)
    assert.equal(new TextDecoder('utf-8').decode(arrayBuffer), fileContent)

    assert.equal(streamSpy.mock.calls.length, 2, 'stream called once')
    assert.equal(textSpy.mock.calls.length, 1, 'text called once')
    assert.equal(bufferSpy.mock.calls.length, 3, 'buffer called thrice')
    assert.equal(arrayBufferSpy.mock.calls.length, 1, 'arrayBuffer called once')
  })

  await test('uses getMetadata after the file is consumed as stream', async (t) => {
    const lastModified = new Date()
    const fileContent = 'hello'
    const metadata = {
      lastModified,
      size: fileContent.length,
      type: 'text/plain',
    }
    const file = new BusFile(() => Readable.from(fileContent), 'hello.txt', {
      getMetadata: () => metadata,
    })
    const streamSpy = t.mock.method(file, 'stream')

    assert.equal(file.lastModified, undefined)
    assert.equal(file.size, undefined)
    assert.equal(file.type, '')

    await file.stream()

    assert.equal(file.lastModified, metadata.lastModified)
    assert.equal(file.size, metadata.size)
    assert.equal(file.type, metadata.type)
    assert.equal(streamSpy.mock.calls.length, 1, 'stream called once')
  })

  await test('uses getMetadata after the file is consumed as buffer', async (t) => {
    const lastModified = new Date()
    const fileContent = 'hello'
    const metadata = {
      lastModified,
      size: fileContent.length,
      type: 'text/plain',
    }
    const file = new BusFile(() => Readable.from(fileContent), 'hello.txt', {
      getMetadata: () => metadata,
    })
    const streamSpy = t.mock.method(file, 'stream')

    assert.equal(file.lastModified, undefined)
    assert.equal(file.size, undefined)
    assert.equal(file.type, '')

    await file.buffer()

    assert.equal(file.lastModified, metadata.lastModified)
    assert.equal(file.size, metadata.size)
    assert.equal(file.type, metadata.type)
    assert.equal(streamSpy.mock.calls.length, 1, 'stream called once')
  })

  await test('uses getMetadata after the file is consumed as string', async (t) => {
    const lastModified = new Date()
    const fileContent = 'hello'
    const metadata = {
      lastModified,
      size: fileContent.length,
      type: 'text/plain',
    }
    const file = new BusFile(() => Readable.from(fileContent), 'hello.txt', {
      getMetadata: () => metadata,
    })
    const streamSpy = t.mock.method(file, 'stream')

    assert.equal(file.lastModified, undefined)
    assert.equal(file.size, undefined)
    assert.equal(file.type, '')

    await file.text()

    assert.equal(file.lastModified, metadata.lastModified)
    assert.equal(file.size, metadata.size)
    assert.equal(file.type, metadata.type)
    assert.equal(streamSpy.mock.calls.length, 1, 'stream called once')
  })

  await test('text() uses cached string if present', async (t) => {
    const file = new BusFile(() => Readable.from('hello'), 'hello.txt')

    const streamSpy = t.mock.method(file, 'stream')
    const textSpy = t.mock.method(file, 'text')

    await file.text()
    await file.text()

    assert.equal(streamSpy.mock.calls.length, 1, 'stream() called once')
    assert.equal(textSpy.mock.calls.length, 2, 'text() called twice')
  })

  await test('buffer() uses cached buffer if present', async (t) => {
    const file = new BusFile(() => Readable.from('hello'), 'hello.txt')

    const streamSpy = t.mock.method(file, 'stream')
    const bufferSpy = t.mock.method(file, 'buffer')

    await file.buffer()
    await file.buffer()

    assert.equal(streamSpy.mock.calls.length, 1, 'stream() called once')
    assert.equal(bufferSpy.mock.calls.length, 2, 'buffer() called twice')
  })

  await test('consume stream multiple times', async () => {
    const file = new BusFile(() => Readable.from('hello'), 'hello.txt')

    const stream1 = await file.stream()
    const stream2 = await file.stream()
    let consumed = 0

    for await (const chunk of stream1) {
      consumed++
      assert.equal(chunk.toString(), 'hello')
    }

    assert.equal((await file.buffer()).toString('utf8'), 'hello')

    for await (const chunk of stream2) {
      consumed++
      assert.equal(chunk.toString(), 'hello')
    }
    assert.equal(consumed, 2)
  })
})
