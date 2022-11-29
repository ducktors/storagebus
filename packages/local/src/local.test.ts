import { randomUUID } from 'node:crypto';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import fs from 'node:fs/promises';

import { expect, test, vi } from 'vitest';
import { Storage as AbstractStorage } from '@ducktors/storagebus-abstract';

import { Storage } from './local';

const localStorage = new Storage();

test('create LocalStorage instance', () => {
  expect(localStorage).toBeInstanceOf(Storage);
});

test('localStorage instance extends from Storage', () => {
  expect(localStorage).toBeInstanceOf(AbstractStorage);
});

test('localStorage.write writes a Readable to disk', async () => {
  const tmp = await localStorage.getTmpFolder(randomUUID());
  const fileName = randomUUID();
  const filePath = join(tmp, fileName);

  await localStorage.write(filePath, Readable.from(fileName));
  const stats = await stat(filePath);

  expect(stats.size).toBe(36);
});

test('localStorage.read reads a file from disk', async () => {
  const fileName = randomUUID();
  const path = await localStorage.saveToTmpFolder(fileName, Readable.from(fileName));
  const file = await localStorage.read(path);

  let str = '';

  for await (const chunk of file) {
    str = str + Buffer.from(chunk).toString();
  }

  expect(str).toBe(fileName);
});

test('localStorage.exists return true if the file exists', async () => {
  const fileName = randomUUID();
  const path = await localStorage.saveToTmpFolder(fileName, Readable.from(fileName));
  expect(await localStorage.exists(path)).toBe(true);
});

test(`localStorage.exists return false if the file doesn't exists`, async () => {
  const tmp = await localStorage.getTmpFolder(randomUUID());
  const fileName = randomUUID();
  const filePath = join(tmp, fileName);

  expect(await localStorage.exists(filePath)).toBe(false);
});

test('localStorage.remove unlinks a path on the disk', async () => {
  const fileName = randomUUID();
  const path = await localStorage.saveToTmpFolder(fileName, Readable.from(fileName));

  await localStorage.remove(path);

  expect(await localStorage.exists(path)).toBe(false);
});

test('localStorage.copy copies a file to the new destination', async () => {
  const tmpFolder = await localStorage.getTmpFolder();
  const sourceFileName = randomUUID();
  const destFileName = randomUUID();
  const destpath = join(tmpFolder, destFileName);

  const sourcePath = await localStorage.saveToTmpFolder(
    sourceFileName,
    Readable.from(sourceFileName),
  );
  await localStorage.copy(sourcePath, destpath);

  expect(await localStorage.exists(sourcePath)).toBe(true);
  expect(await localStorage.exists(destpath)).toBe(true);
});

test('localStorage.move moves a file to the new destination', async () => {
  const tmpFolder = await localStorage.getTmpFolder();
  const sourceFileName = randomUUID();
  const destFileName = randomUUID();
  const destpath = join(tmpFolder, destFileName);

  const sourcePath = await localStorage.saveToTmpFolder(
    sourceFileName,
    Readable.from(sourceFileName),
  );
  await localStorage.move(sourcePath, destpath);

  expect(await localStorage.exists(sourcePath)).toBe(false);
  expect(await localStorage.exists(destpath)).toBe(true);
});

test('localStorage.move defaults to copy when EXDEV is thrown', async () => {
  const renameSpy = vi.spyOn(fs, 'rename');
  const exDevError: NodeJS.ErrnoException = new Error('EXDEV: cross-device link not permitted');
  exDevError.code = 'EXDEV';

  renameSpy.mockRejectedValueOnce(exDevError);

  const tmpFolder = await localStorage.getTmpFolder();
  const sourceFileName = randomUUID();
  const destFileName = randomUUID();
  const destpath = join(tmpFolder, destFileName);

  const sourcePath = await localStorage.saveToTmpFolder(
    sourceFileName,
    Readable.from(sourceFileName),
  );
  await localStorage.move(sourcePath, destpath);

  expect(await localStorage.exists(sourcePath)).toBe(false);
  expect(await localStorage.exists(destpath)).toBe(true);
  renameSpy.mockReset();
});

test('localStorage.move rethrows generic error', async () => {
  const renameSpy = vi.spyOn(fs, 'rename');

  renameSpy.mockRejectedValueOnce(new Error('Generic error'));

  const tmpFolder = await localStorage.getTmpFolder();
  const sourceFileName = randomUUID();
  const destFileName = randomUUID();
  const destpath = join(tmpFolder, destFileName);

  const sourcePath = await localStorage.saveToTmpFolder(
    sourceFileName,
    Readable.from(sourceFileName),
  );

  await expect(() => localStorage.move(sourcePath, destpath)).rejects.toThrow('Generic error');
  renameSpy.mockReset();
});

test('localStorage.saveToTmpFolder saves a Readable to the tmp folder', async () => {
  const fileName = randomUUID();
  const path = await localStorage.saveToTmpFolder(fileName, Readable.from(fileName));

  expect(path.includes(fileName)).toBe(true);
});

test('localStorage.saveToTmpFolder saves a Readable to tmp subfolder', async () => {
  const fileName = randomUUID();
  const subFolder = randomUUID();
  const path = await localStorage.saveToTmpFolder(fileName, Readable.from(fileName), subFolder);

  expect(path.includes(subFolder)).toBe(true);
  expect(path.includes(fileName)).toBe(true);
});

test('localStorage.getTmpFolder returns a path to system tmp subfolder', async () => {
  const subFolder = randomUUID();
  const tmp = await localStorage.getTmpFolder(subFolder);

  expect(tmp.includes(subFolder)).toBe(true);
});

test('logs the error when in debug mode', async () => {
  const localStorage = new Storage({ debug: true });

  try {
    await localStorage.exists('foo');
  } catch (err: any) {
    expect(err.message).toMatch('ENOENT: no such file or directory');
  }
});

test('toBuffer returns a buffer from readable with objectMode true', async () => {
  const localStorage = new Storage();

  const readable = Readable.from('foo', { objectMode: true });
  readable.readableObjectMode;

  const buffer = await localStorage.toBuffer(readable);
  expect(buffer).toBeInstanceOf(Buffer);
  expect(buffer.toString()).toBe('foo');
});

test('toBuffer returns a buffer from readable with objectMode false', async () => {
  const localStorage = new Storage();

  const readable = Readable.from('foo', { objectMode: false });
  readable.readableObjectMode;

  const buffer = await localStorage.toBuffer(readable);
  expect(buffer).toBeInstanceOf(Buffer);
  expect(buffer.toString()).toBe('foo');
});
