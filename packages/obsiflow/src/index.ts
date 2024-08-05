#!/usr/bin/env node
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import { parseArgs } from 'node:util'
import { formatDate, getTasksData } from './utils/index.js'

// import { fileURLToPath } from 'node:url'
// import { dirname } from 'node:path'

// const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const { values, positionals: targets } = parseArgs({
  allowPositionals: true,
  options: {
    formats: {
      type: 'string',
      short: 'f',
    },
    devOnly: {
      type: 'boolean',
      short: 'd',
    },
    prodOnly: {
      type: 'boolean',
      short: 'p',
    },
    withTypes: {
      type: 'boolean',
      short: 't',
    },
    sourceMap: {
      type: 'boolean',
      short: 's',
    },
    release: {
      type: 'boolean',
    },
    all: {
      type: 'boolean',
      short: 'a',
    },
    size: {
      type: 'boolean',
    },
  },
})

const target = targets[0] || 'daily'

const config = require('../config.json')

run()

async function run() {
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
