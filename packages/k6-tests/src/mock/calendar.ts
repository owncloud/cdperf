import { range, times } from 'lodash'

export interface Calendar {
  root: string,
  y: string[];
  m: string[];
  d: string[];
}

export const createCalendar = (p: { root?: string, fromYear: number, toYear: number }): Calendar => {
  return range(p.fromYear, p.toYear + 1).reduce<Calendar>((acc, yn) => {
    const y = String(yn)
    acc.y.push([p.root, y].filter(Boolean).join('/'))
    times(12, (mi) => {
      const m = mi + 1
      const mn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][mi]
      acc.m.push([p.root, y, mn].filter(Boolean).join('/'))
      times(new Date(yn, m, 0).getDate(), (di) => {
        const d = di + 1
        const dn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(yn, mi, d).getDay()]
        acc.d.push([p.root, y, mn, `${d}-${dn}`].filter(Boolean).join('/'))
      })
    })
    return acc
  }, { root: p.root || '', y: [], m: [], d: [] })
}

export interface CalendarResource {
  resourceName: string;
  resourcePath: string;
  resourceContent: string;
}

export const createCalendarResource = (p: { v: string }): CalendarResource => {
  const resourceName = [p.v.split('/').join('-'), 'txt'].join('.')
  const resourcePath = [p.v, resourceName].join('/')
  const resourceContent = `content for ${p.v.split('/').join(' ')}`

  return {
    resourceName,
    resourcePath,
    resourceContent
  }
}
