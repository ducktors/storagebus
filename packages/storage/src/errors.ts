export class ENOENT extends Error implements NodeJS.ErrnoException {
  code = 'ENOENT'
  errno = -2
  path: string

  constructor(name: string) {
    super(`ENOENT: no such file, open '${name}'`)
    this.path = name
    Error.captureStackTrace(this, ENOENT)
  }
}
