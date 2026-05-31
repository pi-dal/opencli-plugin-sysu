import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  SYSU_DOMAIN,
  SYSU_NAVIGATE_URLS
} from './src/lib/api'

cli({
  site: 'sysu',
  name: 'jwxt-timetable',
  description: 'SYSU course schedule — personal timetable for current semester',
  access: 'read',
  domain: SYSU_DOMAIN,
  navigateBefore: SYSU_NAVIGATE_URLS.timetable,
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'year-term', help: 'Academic year term, e.g. 2025-2' },
    { name: 'week', type: 'int', help: 'Week number (1-20)' }
  ],
  func: async (page: any, _kwargs: any) => {
    // Let the SPA fully load and render the timetable
    await new Promise(r => setTimeout(r, 3000))

    // Try to call the API using the page's own XMLHttpRequest with proper headers
    const script = `
(async () => {
  return new Promise(function(resolve) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/jwxt/timetable-search/classTableInfo/selectStudentClassTable?academicYear=2025-2&weekly=13&_t=' + Date.now(), true);
    xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
    xhr.withCredentials = true;
    xhr.onload = function() {
      try {
        var data = JSON.parse(xhr.responseText);
        if (data && data.code === 200 && Array.isArray(data.data)) {
          resolve(data.data);
        } else {
          resolve(data && data.data ? data.data : []);
        }
      } catch(e) { resolve([]); }
    };
    xhr.onerror = function() { resolve([]); };
    xhr.send();
  });
})()
    `
    const data = await page.evaluate(script)
    return data
  }
})
