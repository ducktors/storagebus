import { randomUUID } from 'node:crypto';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import fs from 'node:fs/promises';
import { join } from 'node:path';

import { expect, test, vi } from 'vitest';
import { Storage as AbstractStorage } from '@ducktors/storagebus-abstract';

import { Storage } from './local';

test('Storage constructor accepts rootFolder parameter', async () => {
  const storage = new Storage({ rootFolder: await Storage.getTmpSubFolder() });
  expect(storage).toBeInstanceOf(Storage);
  expect(storage).toBeInstanceOf(AbstractStorage);
});

test('Storage constructor accepts bucket parameter', async () => {
  const storage = new Storage({ bucket: await Storage.getTmpSubFolder() });
  expect(storage).toBeInstanceOf(Storage);
  expect(storage).toBeInstanceOf(AbstractStorage);
});

test('storage.write writes a Readable to disk', async () => {
  const tmpFolder = await Storage.getTmpSubFolder();
  const storage = new Storage({ bucket: tmpFolder });

  const fileName = randomUUID();
  const path = await storage.write(fileName, Readable.from(fileName));
  const stats = await stat(join(tmpFolder, fileName));

  expect(stats.size).toBe(36);
  expect(path).toBe(fileName);
});

test('storage.read reads a file from disk', async () => {
  const storage = new Storage({ bucket: await Storage.getTmpSubFolder() });
  const fileName = randomUUID();

  await storage.write(fileName, Readable.from(fileName));
  const file = await storage.read(fileName);
  let str = '';

  for await (const chunk of file) {
    str = str + Buffer.from(chunk).toString();
  }

  expect(str).toBe(fileName);
});

test('storage.exists return true if the file exists', async () => {
  const storage = new Storage({ bucket: await Storage.getTmpSubFolder() });

  const fileName = randomUUID();
  const path = await storage.write(fileName, Readable.from(fileName));

  expect(await storage.exists(path)).toBe(true);
});

test(`storage.exists return false if the file doesn't exists`, async () => {
  const storage = new Storage({ bucket: await Storage.getTmpSubFolder() });

  const fileName = randomUUID();

  expect(await storage.exists(fileName)).toBe(false);
});

test('storage.remove unlinks a path on the disk', async () => {
  const storage = new Storage({ bucket: await Storage.getTmpSubFolder() });

  const fileName = randomUUID();

  await storage.write(fileName, Readable.from(fileName));
  await storage.remove(fileName);

  expect(await storage.exists(fileName)).toBe(false);
});

test('storage.copy copies a file to the new destination', async () => {
  const storage = new Storage({ bucket: await Storage.getTmpSubFolder() });

  const sourceFileName = randomUUID();
  const destFileName = randomUUID();

  await storage.write(sourceFileName, Readable.from(sourceFileName));
  await storage.copy(sourceFileName, destFileName);

  expect(await storage.exists(sourceFileName)).toBe(true);
  expect(await storage.exists(destFileName)).toBe(true);
});

test('storage.move moves a file to the new destination', async () => {
  const storage = new Storage({ bucket: await Storage.getTmpSubFolder() });

  const sourceFileName = randomUUID();
  const destFileName = randomUUID();

  await storage.write(sourceFileName, Readable.from(sourceFileName));
  await storage.move(sourceFileName, destFileName);

  expect(await storage.exists(sourceFileName)).toBe(false);
  expect(await storage.exists(destFileName)).toBe(true);
});

test('storage.move defaults to copy when EXDEV is thrown', async () => {
  const storage = new Storage({ bucket: await Storage.getTmpSubFolder() });

  const renameSpy = vi.spyOn(fs, 'rename');
  const exDevError: NodeJS.ErrnoException = new Error('EXDEV: cross-device link not permitted');
  exDevError.code = 'EXDEV';

  renameSpy.mockRejectedValueOnce(exDevError);

  const sourceFileName = randomUUID();
  const destFileName = randomUUID();

  await storage.write(sourceFileName, Readable.from(sourceFileName));
  await storage.move(sourceFileName, destFileName);

  expect(await storage.exists(sourceFileName)).toBe(false);
  expect(await storage.exists(destFileName)).toBe(true);
  renameSpy.mockReset();
});

test('storage.move rethrows generic error', async () => {
  const storage = new Storage({ bucket: await Storage.getTmpSubFolder() });
  const renameSpy = vi.spyOn(fs, 'rename');

  renameSpy.mockRejectedValueOnce(new Error('Generic error'));

  const sourceFileName = randomUUID();
  const destFileName = randomUUID();

  await storage.write(sourceFileName, Readable.from(sourceFileName));
  await expect(() => storage.move(sourceFileName, destFileName)).rejects.toThrow('Generic error');
  renameSpy.mockReset();
});

test('Storage.getTmpFolder returns a path to system tmp subfolder', async () => {
  const subFolder = randomUUID();
  const tmp = await Storage.getTmpSubFolder(subFolder);

  expect(tmp.includes(subFolder)).toBe(true);
});

test('logs the error when in debug mode', async () => {
  const storage = new Storage({ debug: true, bucket: await Storage.getTmpSubFolder() });

  try {
    await storage.exists('foo');
  } catch (err: any) {
    expect(err.message).toMatch('ENOENT: no such file or directory');
  }
});

test('toBuffer returns a buffer from readable with objectMode true', async () => {
  const storage = new Storage({ bucket: await Storage.getTmpSubFolder() });

  const readable = Readable.from('foo', { objectMode: true });
  readable.readableObjectMode;

  const buffer = await storage.toBuffer(readable);
  expect(buffer).toBeInstanceOf(Buffer);
  expect(buffer.toString()).toBe('foo');
});

test('toBuffer returns a buffer from readable with objectMode false', async () => {
  const storage = new Storage({ bucket: await Storage.getTmpSubFolder() });

  const readable = Readable.from('foo', { objectMode: false });
  const buffer = await storage.toBuffer(readable);

  expect(buffer).toBeInstanceOf(Buffer);
  expect(buffer.toString()).toBe('foo');
});
