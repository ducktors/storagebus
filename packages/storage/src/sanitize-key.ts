// ported to TS from https://github.com/Advanon/sanitize-s3-objectkey
import latinChars from './latin-chars.json'
const SAFE_CHARACTERS = /[^0-9a-zA-Z! _\\.\\*'\\(\\)\\\-/]/g

function isNumber(value: string | number): value is number {
  return typeof value === 'number'
}

function isString(value: string | number): value is string {
  return Object.prototype.toString.call(value) === '[object String]'
}

function replaceLatinCharacters(value: string): string {
  return value.replace(
    /[^A-Za-z0-9[\] ]/g,
    (character) =>
      latinChars[character as keyof typeof latinChars] || character,
  )
}

function removeIllegalCharacters(value: string): string {
  return value.replace(SAFE_CHARACTERS, '')
}

function isValidSeparator(separator: string): boolean {
  return !!separator && !separator.match(SAFE_CHARACTERS)
}

export function sanitize(key: string | number, separator = '-') {
  if (!isValidSeparator(separator)) {
    throw new Error(`${separator} is not a valid separator`)
  }

  if (!(key && (isString(key) || isNumber(key)))) {
    throw new Error(`Expected non-empty string or number, got ${key}`)
  }

  if (isNumber(key)) {
    return key.toString()
  }

  return removeIllegalCharacters(replaceLatinCharacters(key.trim())).replace(
    / /g,
    separator,
  )
}
