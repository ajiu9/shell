/* eslint-disable no-eval */
/* eslint-disable no-undef */
import { getWeek } from './date.js'

export function getTasksData(args) {
  if (args.weekly) {
    const s = args.s || `${new Date().getFullYear()}-W-${getWeek(new Date())}.md`
    return getWeekly(s)
  }
  if (args.yearly)
    return getYearly(args.s || `#Plan/Weekly/${new Date().getFullYear()}`)
}

function getWeekly(selector) {
  function getTaskData(options) {
    const data = `\`\`\`dataviewjs\n
    ${getFormatWeeklyTask.toString()}\n
    ${getWeeklyTasks.toString()}\n
    getWeeklyTasks(${toString(options)})\n\`\`\`
    `
    return data
  }
  function getWeeklyTasks({ selector, filterCb }) {
    const page = dv.page(selector)
    getFormatWeeklyTask(page, filterCb)
  }
  let data = getTaskData({ selector, filterCb: item => !item.completed })
  data = `${data}\n\r` + '---\n\r'
  data = data + getTaskData({ selector })
  return data
}

function getYearly(selector) {
  const data = `## Yearly Tasks\n\r\`\`\`dataviewjs\n
  ${getFormatWeeklyTask.toString()}\n
  const pages = dv.pages('${selector}')
  pages.forEach((page) => {
    getFormatWeeklyTask(page)
  })
  \n\`\`\`
  `

  return data
}

function getFormatWeeklyTask(page, filterCb) {
  if (filterCb)
    filterCb = eval(filterCb)
  else
    filterCb = item => item.completed

  const taskList = new Set()
  const tableName = ['Name', 'Scheduled', 'Project'/* , 'Completion', 'links' */]
  if (!page) return dv.el('p', 'No Data')
  const { tasks = [], name, path } = page.file
  dv.header(4, name)
  taskList.add({
    name,
    path,
    tasks,
  })
  const parseText = (input) => {
    const regex = /\[(\w+)::([^[\]]*)]/g
    const projectReg = /【([\w\W]+)】/
    const typeReg = /(^[\w\W]+)：/

    const result = {}

    input = input.replace(regex, (match, key, value) => {
      result[key] = value.trim()
      return ''
    })

    result.text = input.trim()

    const matchProject = input.match(projectReg)
    if (matchProject)
      result.project = matchProject[1]

    const matchType = input.match(typeReg)
    if (matchType)
      result.type = matchType[1]

    return result
  }

  const getSummaries = (data) => {
    const sums = []
    data.forEach((_item, index) => {
      if (index === 0) return sums[index] = 'Total'

      const values = data.map((item) => {
      // only calculate time of hours
        return Number(item[index]?.hours)
      })
      if (!values.every(value => Number.isNaN(value))) {
        sums[index] = values.reduce((prev, curr) => {
          const value = Number(curr)
          if (!Number.isNaN(value))
            return prev + curr
          else
            return prev
        }, 0)
      }
      if (sums[index]) sums[index] = `${sums[index]} hours`
    })
    return sums
  }

  const getData = () => {
    const ret = []
    dv.array(Array.from(taskList)).forEach((item) => {
      const { name, path, links, tasks } = item
      tasks.filter(filterCb).forEach((el) => {
        const { text, project, type } = parseText(el.text)
        ret.push([
          text,
          el.scheduled,
          project || type, /* ,
          el.completion,
          el.link, */
        ])
      })
    })
    const summary = getSummaries(ret)
    ret.push(summary)
    return ret
  }
  dv.table(tableName, getData())
}

function toString(data) {
  const replacer = (key, value) => {
    if (typeof value === 'function')
      return value.toString()

    return value
  }
  return JSON.stringify(data, replacer)
}
