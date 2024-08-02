import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import consola from 'consola'

const require = createRequire(import.meta.url)
const __dirname = fileURLToPath(new URL('.', import.meta.url))

const packagesDir = path.resolve(__dirname, 'packages')
const packageDir = path.resolve(packagesDir, process.env.TARGET)

const resolve = p => path.resolve(packageDir, p)
const pkg = require(resolve('package.json'))
const packageOptions = pkg.buildOptions || {}
const name = packageOptions.filename || path.basename(packageDir)

const outputConfigs = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: 'es',
  },
  'esm-browser': {
    file: resolve(`dist/${name}.esm-browser.js`),
    format: 'es',
  },
  'cjs': {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs',
  },
  'global': {
    file: resolve(`dist/${name}.global.js`),
    format: 'iife',
  },
}

const defaultFormats = ['esm-bundler', 'cjs']
const packageFormats = packageOptions.formats || defaultFormats

const packageConfig = []
if (process.env.NODE_ENV === 'production') {
  defaultFormats.forEach((format) => {
    if (packageOptions.prod === false)
      return

    if (format === 'cjs')
      consola.success('cjs success')
      // packageConfigs.push(createProductionConfig(format))

    if (/^(global|esm-browser)?/.test(format))
      consola.success('global|esm-browser success')
      // packageConfigs.push(createMinifiedConfig(format))
  })
}

export default packageConfig
