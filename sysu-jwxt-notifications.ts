import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  SYSU_DOMAIN,
  SYSU_NAVIGATE_URLS,
  SYSU_ENDPOINTS
} from './src/lib/api'

cli({
  site: 'sysu',
  name: 'jwxt-notifications',
  description: 'SYSU notifications — academic affairs and department announcements from jwxt system',
  access: 'read',
  domain: SYSU_DOMAIN,
  navigateBefore: SYSU_NAVIGATE_URLS.timetable,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'category', help: 'Filter by category: education (教务部) or college (院系)' },
    { name: 'keyword', help: 'Search by keyword in title' },
    { name: 'limit', type: 'int', help: 'Max results (default: 50)' }
  ],
  func: async (page: any, kwargs: any) => {
    const limit = parseInt(String(kwargs.limit || '50'), 10)
    const categoryFilter = String(kwargs.category || '')
    const keywordFilter = String(kwargs.keyword || '').toLowerCase()

    const script = `
(async () => {
  const response = await fetch(${JSON.stringify(SYSU_ENDPOINTS.notifications)} + '?_t=' + Date.now(), {
    credentials: 'include'
  })
  const data = await response.json()
  const raw = data?.data ?? {}
  const result = []

  // Flatten college and education categories
  if (Array.isArray(raw.college)) {
    raw.college.forEach(function(item) {
      result.push({
        id: item.id || '',
        title: item.title || '',
        date: item.deliveryDate || '',
        category: 'college',
        status: item.status || '',
        url: item.url || ''
      })
    })
  }

  if (Array.isArray(raw.education)) {
    raw.education.forEach(function(item) {
      result.push({
        id: item.id || '',
        title: item.title || '',
        date: item.deliveryDate || '',
        category: 'education',
        status: item.status || '',
        url: item.url || ''
      })
    })
  }

  return result
})()
    `.trim()

    const all = await page.evaluate(script)
    let filtered = all

    if (categoryFilter) {
      filtered = filtered.filter((n: Record<string, string>) => n.category === categoryFilter)
    }
    if (keywordFilter) {
      filtered = filtered.filter((n: Record<string, string>) => n.title.toLowerCase().includes(keywordFilter))
    }

    return filtered.slice(0, Math.min(limit, 100))
  }
})
