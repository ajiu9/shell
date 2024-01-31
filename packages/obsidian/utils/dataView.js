/* eslint-disable no-undef */
export function getWeeklyTasks({ selector, filterCb }) {
  if (filterCb)
    filterCb = eval(filterCb)
  else
    filterCb = item => item.completed

  const taskList = new Set()
  const tableName = ['Name', 'Scheduled', 'Completion', 'links']
  const page = dv.page(selector)
  if (page) {
    const { tasks = [], name, path } = page.file
    taskList.add({
      name,
      path,
      tasks,
    })
  }
  const parseText = (input) => {
    const regex = /\[(\w+)::([^[\]]*)]/g
    const result = {}

    input = input.replace(regex, (match, key, value) => {
      result[key] = value.trim()
      return ''
    })

    result.text = input.trim()

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
        const { text } = parseText(el.text)
        ret.push([
          text,
          el.scheduled,
          el.completion,
          el.link,
        ])
      })
    })
    const summary = getSummaries(ret)
    ret.push(summary)
    return ret
  }
  dv.table(tableName, getData())
}

export function getTaskData(options) {
  const data = `\`\`\`dataviewjs\n
  ${getWeeklyTasks.toString()}\n
  getWeeklyTasks(${toString(options)})\n
  \`\`\`
  `
  return data
}

export function getAllTasks(selector) {
  let data = getTaskData({ selector, filterCb: item => !item.completed })
  data = `${data}\n\r` + '---\n\r'
  data = data + getTaskData({ selector })
  return data
}

function toString(data) {
  const replacer = (key, value) => {
    if (typeof value === 'function')
      return value.toString()

    return value
  }
  return JSON.stringify(data, replacer)
}
