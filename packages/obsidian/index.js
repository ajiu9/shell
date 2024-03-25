#!/usr/bin/env node
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import minimist from 'minimist'
import { formatDate, getTasksData } from './utils/index.js'

// const __dirname = fileURLToPath(new URL('.', import.meta.url))
const require = createRequire(import.meta.url)
const args = minimist(process.argv.slice(2))
const targets = args._
const target = targets[0] || 'daily'

const config = require('./config.json')

run()

async function run() {
  const now = new Date()
  if (args.next && ['daily', 'saturday', 'sunday'].includes(target)) now.setDate(now.getDate() + 1)
  if (args.next && target === 'weekly') now.setDate(now.getDate() + 7)
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
    targetTemplateData = getTasksData(args)
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
