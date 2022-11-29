import { Readable } from 'node:stream';
import { expect, test } from 'vitest';

import { Storage } from './abstract-storage';

test('constructs abstract storage', () => {
  // @ts-expect-error: testing wrong type
  const storage = new Storage();
  expect(storage).instanceOf(Storage);
});

test('constructs abstract storage in debug mode', () => {
  // @ts-expect-error: testing wrong type
  const storage = new Storage({ debug: true });

  expect(storage._debug).toBe(true);
});

test('abstract storage uses custom logger', () => {
  // @ts-expect-error: testing wrong type
  const storage = new Storage({ debug: true, logger: { info: 'foo' } });

  expect(storage._logger).toEqual({ info: 'foo' });
});

test('toBuffer returns a buffer from Readable with objectMode true', async () => {
  // @ts-expect-error: testing wrong type
  const storage = new Storage();
  const buffer = await storage.toBuffer(Readable.from('foo', { objectMode: true }));

  expect(buffer).toBeInstanceOf(Buffer);
  expect(buffer.toString()).toBe('foo');
});

test('toBuffer returns a buffer from Readable with objectMode false', async () => {
  // @ts-expect-error: testing wrong type
  const storage = new Storage();
  const buffer = await storage.toBuffer(Readable.from('foo', { objectMode: false }));

  expect(buffer).toBeInstanceOf(Buffer);
  expect(buffer.toString()).toBe('foo');
});

test('create storage instance with custom sanitizeKey function', () => {
  // @ts-expect-error: testing wrong type
  const storage = new Storage({
    sanitizeKey: (key: string) => key,
  });

  expect(storage).toBeInstanceOf(Storage);
});

test('create storage instance with wrong type for sanitizeKey param', () => {
  try {
    // @ts-expect-error: testing wrong type
    new Storage({
      sanitizeKey: '',
    });
  } catch (err) {
    expect(err).toBeInstanceOf(TypeError);
  }
});

test('create storage instance with default sanitize function', () => {
  // @ts-expect-error: testing wrong type
  const storage = new Storage({
    sanitizeKey: true,
  });
  expect(storage).toBeInstanceOf(Storage);
});
