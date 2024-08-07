import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import { parseArgs } from 'node:util'
import { formatDate, getTasksData } from './utils/index'
import { ExitCode } from './exit-code'

console.log(process.env.HOME)

const require = createRequire(import.meta.url)

const { values, positionals: targets } = parseArgs({
  allowPositionals: true,
  options: {
    next: {
      type: 'boolean',
      short: 'n',
    },
    weekly: {
      type: 'boolean',
      short: 'w',
    },
    task: {
      type: 'boolean',
      short: 't',
    },
  },
})

console.log(values, targets)
const target = targets[0] || 'daily'

const config = require('../config.json')

main()

export async function main() {
  try {
    // Setup global error handlers
    process.on('uncaughtException', errorHandler)
    process.on('unhandledRejection', errorHandler)

    const now = new Date()
    if (values.next && ['daily', 'saturday', 'sunday'].includes(target)) now.setDate(now.getDate() + 1)
    if (values.next && target === 'weekly') now.setDate(now.getDate() + 7)
    const currentTime = formatDate(now)
    const nameEnum = {
      daily: 'time',
      saturday: 'time',
      sunday: 'time',
      weekly: 'week',
      empty: 'empty',
      task: 'task',
    }
    const fileName = currentTime[nameEnum[target]]
    let targetTemplateData = ''
    if (fileName === 'task') {
      targetTemplateData = getTasksData(values)
    }
    else {
      let templateData = ''
      const templatePath = config[target]?.template
      if (templatePath)
        templateData = await fs.readFile(templatePath, 'utf8')

      targetTemplateData = getTargetTemplateData(templateData)
    }

    return fs.writeFile(`${config[target].target}/${fileName}.md`, targetTemplateData)

    function getTargetTemplateData(data) {
      if (target === 'weekly') {
        const time = now
        time.setDate(time.getDate() + 7)
        const { week } = formatDate(time)
        data = data.replace(/\{week\}/g, week)
      }
      return data
    }
  }
  catch (error) {
    errorHandler(error as Error)
  }
}

function errorHandler(error: Error): void {
  let message = error.message || String(error)

  if (process.env.DEBUG || process.env.NODE_ENV === 'development')
    message = error.stack || message

  console.error(message)
  process.exit(ExitCode.FatalError)
}
