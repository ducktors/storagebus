declare module 's3rver' {
  interface S3rverOptions {
    directory: string
    silent?: boolean
    configureBuckets?: S3rverBucket[]
  }
  interface S3rverBucket {
    name: string
  }
  class S3rver {
    constructor(options: S3rverOptions)
    run(callback: (err: Error) => void): void
    close(): void
  }
  export = S3rver
}
