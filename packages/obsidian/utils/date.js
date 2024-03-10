import { padLefZero } from './general.js'

export function formatDate(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`
  const day = `${date.getDate()}`
  const hours = `${date.getHours()}`
  const minutes = `${date.getMinutes()}`
  const seconds = `${date.getSeconds()}`
  const week = `${getWeek(date)}`
  return {
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    time: `${year}-${month.length === 1 ? padLefZero(month) : month}-${day.length === 1 ? padLefZero(day) : day}`,
    week: `${year}-W-${week}`,
    empty: `${year}${month}${day}${hours}${minutes}${seconds}`,
    task: 'task',
  }
}

export function getWeek(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const firstWeekStartDay = firstDayOfYear.getDay()
  const diffDays = Math.ceil((date - (firstDayOfYear - firstWeekStartDay * 86400000)) / 86400000)
  const week = `${Math.floor(diffDays / 7)}`
  return week.length === 1 ? padLefZero(week) : week
}
