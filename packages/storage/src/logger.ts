export const logger = {
  trace: console.log.bind(console),
  debug: console.debug.bind(console),
  info: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  fatal: console.error.bind(console),
}
