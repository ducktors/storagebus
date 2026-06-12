const WINDOWS_DRIVE_PREFIX = /^[A-Za-z]:/

export function validateObjectKey(key: string): string {
  if (typeof key !== 'string' || key.length === 0) {
    throw new TypeError('Invalid Object Key: must be a non-empty string.')
  }

  if (
    key.startsWith('/') ||
    key.includes('\\') ||
    WINDOWS_DRIVE_PREFIX.test(key)
  ) {
    throw new TypeError(
      'Invalid Object Key: must be a POSIX-style relative key.',
    )
  }

  const segments = key.split('/')

  if (
    segments.some(
      (segment) => segment === '' || segment === '.' || segment === '..',
    )
  ) {
    throw new TypeError(
      'Invalid Object Key: must not contain empty, dot, or dot-dot segments.',
    )
  }

  return key
}
