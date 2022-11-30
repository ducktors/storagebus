import { randomUUID } from 'node:crypto';
import { constants, createReadStream, createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { AbstractStorageOptions, Storage as AbstractStorage } from '@ducktors/storagebus-abstract';

// taken from https://github.com/sindresorhus/type-fest/blob/main/source/require-exactly-one.d.ts
type RequireExactlyOne<ObjectType, KeysType extends keyof ObjectType = keyof ObjectType> = {
  [Key in KeysType]: Required<Pick<ObjectType, Key>> &
    Partial<Record<Exclude<KeysType, Key>, never>>;
}[KeysType] &
  Omit<ObjectType, KeysType>;

export type StorageOptions = RequireExactlyOne<
  {
    bucket: string;
    rootFolder: string;
  },
  'bucket' | 'rootFolder'
> &
  AbstractStorageOptions;

export class Storage extends AbstractStorage {
  protected bucket: string;

  constructor(opts: StorageOptions) {
    super(opts);

    this.bucket = opts.bucket ?? opts.rootFolder;
  }
  async write(filePath: string, fileReadable: Readable): Promise<string> {
    const path = join(this.bucket, filePath);
    await pipeline(fileReadable, createWriteStream(path));

    return filePath;
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      const path = join(this.bucket, filePath);
      await fs.access(path, constants.F_OK);
      return true;
    } catch (err) {
      if (this._debug) {
        this._logger.info({ err });
      }
      return false;
    }
  }

  async read(filePath: string): Promise<Readable> {
    const path = join(this.bucket, filePath);
    return createReadStream(path);
  }

  async remove(filePath: string): Promise<void> {
    const path = join(this.bucket, filePath);
    return fs.unlink(path);
  }

  async copy(filePath: string, destFilePath: string): Promise<string> {
    const path = join(this.bucket, filePath);
    const destPath = join(this.bucket, destFilePath);
    await fs.copyFile(path, destPath);
    return destFilePath;
  }

  async move(filePath: string, destFilePath: string): Promise<string> {
    const path = join(this.bucket, filePath);
    const destPath = join(this.bucket, destFilePath);
    try {
      await fs.rename(path, destPath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'EXDEV') {
        await this.copy(filePath, destFilePath);
        await this.remove(filePath);
      } else {
        throw err;
      }
    }
    return destFilePath;
  }

  static async getTmpSubFolder(subFolder?: string) {
    if (!subFolder) {
      subFolder = randomUUID();
    }
    const path = join(tmpdir(), subFolder);
    await fs.mkdir(path, {
      recursive: true,
    });
    return path;
  }
}
