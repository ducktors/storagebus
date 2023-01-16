import { Readable } from 'node:stream';

import { AbstractStorageOptions, Storage as AbstractStorage } from '@ducktors/storagebus-abstract';

export type StorageOptions = AbstractStorageOptions;

export class Storage extends AbstractStorage {
  protected bucket: Map<string, Buffer>;

  constructor(opts: StorageOptions) {
    super({ debug: opts?.debug, logger: opts?.logger });
    this.bucket = new Map();
  }

  async write(key: string, fileReadable: Readable): Promise<string> {
    key = this.sanitize(key);

    this.bucket.set(key, await this.toBuffer(fileReadable));
    return key;
  }

  async exists(key: string): Promise<boolean> {
    key = this.sanitize(key);
    return this.bucket.has(key);
  }

  async read(key: string): Promise<Readable> {
    key = this.sanitize(key);
    if (!(await this.exists(key))) {
      throw new Error(`Missing ${key} from Storagebus Memory`);
    }

    return Readable.from(this.bucket.get(key)!);
  }

  async remove(key: string): Promise<void> {
    key = this.sanitize(key);
    this.bucket.delete(key);
  }

  async copy(key: string, destKey: string): Promise<string> {
    key = this.sanitize(key);
    const file = this.bucket.has(key);
    if (!file) {
      throw new Error(`Missing ${key} from Storagebus Memory`);
    }
    destKey = this.sanitize(destKey);
    this.bucket.set(destKey, this.bucket.get(key)!);
    return destKey;
  }

  async move(key: string, destKey: string): Promise<string> {
    destKey = await this.copy(key, destKey);
    await this.remove(key);

    return destKey;
  }
}
