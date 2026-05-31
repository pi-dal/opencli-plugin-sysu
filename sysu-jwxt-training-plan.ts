import { Strategy, cli } from '@jackwener/opencli/registry'

import {
  SYSU_DOMAIN
} from './src/lib/api'

cli({
  site: 'sysu',
  name: 'jwxt-training-plan',
  description: 'SYSU training programs — browse all-school training program view',
  access: 'read',
  domain: SYSU_DOMAIN,
  navigateBefore: 'https://jwxt.sysu.edu.cn/jwxt/mk/#/allSchoolTrainingProgramView?code=jwxsd_qxpyfack&resourceName=%E5%85%A8%E6%A0%A1%E5%9F%B9%E5%85%BB%E6%96%B9%E6%A1%88%E6%9F%A5%E7%9C%8B',
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'year', help: 'Grade year, e.g. 2021' },
    { name: 'college', help: 'College/department name' }
  ],
  func: async (page: any, _kwargs: any) => {
    await new Promise(r => setTimeout(r, 5000))

    const data = await page.evaluate(`
(async () => {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const table = document.querySelector('.el-table__body, table');
    if (table && table.querySelectorAll('tr').length > 3) break;
    await new Promise(r => setTimeout(r, 300));
  }

  const table = document.querySelector('.el-table__body, table');
  if (!table) return { text: (document.body.textContent || '').trim().slice(0, 300) };

  const rows = table.querySelectorAll('tr');
  const result = [];
  for (const row of rows) {
    const cells = row.querySelectorAll('td, th');
    const rowData = [];
    for (const cell of cells) {
      const text = cell.textContent?.trim() || '';
      if (text) rowData.push(text);
    }
    if (rowData.length > 0) result.push(rowData);
  }
  return result.length > 0 ? result : { text: (document.body.textContent || '').trim().slice(0, 300) };
})()
    `)
    return data
  }
})
