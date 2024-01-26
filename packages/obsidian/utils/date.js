export function formatDate(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`
  const day = `${date.getDate()}`
  const hours = `${date.getHours()}`
  const minutes = `${date.getMinutes()}`
  const seconds = `${date.getSeconds()}`
  const week = `${getWeek()}`
  return {
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    time: `${year}-${month.length === 1 ? padLefZero(month) : month}-${day.length === 1 ? padLefZero(day) : day}`,
    week: `${year}-W-${week.length === 1 ? padLefZero(week) : week}`,
    empty: `${year}${month}${day}${hours}${minutes}${seconds}`,
    task: 'task',
  }
  function getWeek() {
    const firstDayOfYear = new Date(year, 0, 1)
    const firstWeekStartDay = firstDayOfYear.getDay()
    const diffDays = Math.ceil((date - (firstDayOfYear - firstWeekStartDay * 86400000)) / 86400000)
    return Math.ceil(diffDays / 7)
  }
  function padLefZero(str) {
    return (`00${str}`).substr(str.length)
  }
}
