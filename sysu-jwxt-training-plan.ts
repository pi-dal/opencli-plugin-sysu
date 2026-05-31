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
    await new Promise(r => setTimeout(r, 3000))

    const data = await page.evaluate(`
(async () => {
  const deadline = Date.now() + 10000;
  const seen = new Set();

  while (Date.now() < deadline) {
    // Try to find any table rows with data content
    const allRows = document.querySelectorAll('.el-table__body-wrapper tr, .el-table__body tr, table tr');
    const dataRows = Array.from(allRows).filter(function(row) {
      const tds = row.querySelectorAll('td');
      return tds.length >= 5 && Array.from(tds).some(function(td) { return (td.textContent || '').trim().length > 2; });
    });

    if (dataRows.length > 0) {
      const headers = Array.from(document.querySelectorAll('.el-table__header-wrapper th .cell, th')).map(function(h) { return (h.textContent || '').trim(); }).filter(Boolean);

      const rows = dataRows.map(function(row) {
        const cells = row.querySelectorAll('td');
        return Array.from(cells).map(function(c) { return (c.textContent || '').trim(); });
      }).filter(function(r) { return r.length >= 5; });

      if (rows.length > 0) return { headers: headers.length > 0 ? headers : [], rows: rows.slice(0, 100), total: rows.length };
    }

    // Check raw text for data patterns
    const text = document.body.textContent || '';
    const entries = text.match(/\d+\u5e74\u4e2d\u5c71\u5927\u5b66/g);
    if (entries && entries.length > 0) break;

    await new Promise(function(r) { setTimeout(r, 300); });
  }

  return { text: (document.body.textContent || '').trim().slice(0, 1000) };
})()
    `)
    return data
  }
})
