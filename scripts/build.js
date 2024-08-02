import { cpus } from 'node:os'
import path from 'node:path'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { targets as allTargets } from './utils.js'

const require = createRequire(import.meta.url)

run()

function run() {
  buildAll(allTargets)
}

async function buildAll(targets) {
  await runParallel(cpus.length, targets, build)
}

async function runParallel(maxConcurrency, source, iteratorFn) {
  const ret = []

  const executing = []
  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item, source))
    ret.push(p)

    if (maxConcurrency <= source.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1))
      executing.push(e)
      if (executing.length >= maxConcurrency)
        await Promise.race(executing)
    }
  }
  return Promise.all(ret)
}

async function build(target) {
  const pkgDir = path.resolve(`packages/${target}`)
  console.log(pkgDir)
  const pkg = require(`${pkgDir}/package.json`)
  // ignore private package
  if (pkg.private) return
  // remove dist
  if (existsSync(`${pkgDir}/dist`))
    fs.rm(`${pkgDir}/dist`, { recursive: true })

  const env = (pkg.buildOptions && pkg.buildOptions.env) || 'production'
}
