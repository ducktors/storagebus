import { otherTypes } from './types/other.js'
import { standardTypes } from './types/standard.js'

class Mime {
  #types = new Map<string, string>()

  constructor(types: Record<string, readonly string[]>[]) {
    for (const typesObject of types) {
      for (const [type, extensions] of Object.entries<readonly string[]>(
        typesObject,
      )) {
        for (const extension of extensions) {
          const starred = extension.startsWith('*')
          if (!starred) {
            this.#types.set(extension, type)
          }
        }
      }
    }
  }

  // copied from https://github.com/broofa/mime/blob/0202521312497fd93c6b9bc9485b52c2b34b9aca/src/Mime.ts#L72
  getType(path?: string) {
    if (typeof path !== 'string') return null

    // Remove chars preceeding `/` or `\`
    const last = path.replace(/^.*[/\\]/, '').toLowerCase()

    // Remove chars preceeding '.'
    const ext = last.replace(/^.*\./, '').toLowerCase()

    const hasPath = last.length < path.length
    const hasDot = ext.length < last.length - 1

    // Extension-less file?
    if (!hasDot && hasPath) return null

    return this.#types.get(ext) ?? null
  }
}

export const mime = new Mime([standardTypes, otherTypes])
