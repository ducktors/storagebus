import * as Mitata from 'mitata'
import process from 'node:process'

const asJSON = !!process?.env?.BENCHMARK_RUNNER

export function run(opts = {}) {
  if (asJSON) {
    opts.json = true
  }

  return Mitata.run(opts)
}

export function bench(name, fn) {
  return Mitata.bench(name, fn)
}

export function group(name, fn) {
  return Mitata.group(name, fn)
}
