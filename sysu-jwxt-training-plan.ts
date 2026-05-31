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
    { name: 'college', help: 'College/department name' },
    { name: 'major', help: 'Major/direction name' },
    { name: 'type', help: 'Training type, e.g. 主修, 辅修' }
  ],
  func: async (page: any, kwargs: any) => {
    const collegeFilter = String(kwargs.college || '')
    const yearFilter = String(kwargs.year || '')
    const majorFilter = String(kwargs.major || '')
    const typeFilter = String(kwargs.type || '')

    await new Promise(r => setTimeout(r, 3000))

    const script = `
(async () => {
  const collegeFilter = ${JSON.stringify(collegeFilter)};
  const yearFilter = ${JSON.stringify(yearFilter)};
  const majorFilter = ${JSON.stringify(majorFilter)};
  const typeFilter = ${JSON.stringify(typeFilter)};

  const deadline = Date.now() + 12000;

  // Helper: set an Element UI el-select value
  function setSelectValue(placeholder, value) {
    const inputs = document.querySelectorAll('.el-select .el-input__inner');
    let targetInput = null;
    for (const input of inputs) {
      if (input.placeholder && input.placeholder.includes(placeholder)) {
        targetInput = input;
        break;
      }
    }
    if (!targetInput) return false;
    targetInput.click();
    return new Promise(function(resolve) {
      setTimeout(function() {
        const popper = document.querySelector('.el-select-dropdown:not(.el-select-dropdown--hidden)');
        if (popper) {
          const options = popper.querySelectorAll('.el-select-dropdown__item');
          for (const opt of options) {
            const text = (opt.textContent || '').trim();
            if (text.includes(value)) {
              opt.click();
              resolve(true);
              return;
            }
          }
        }
        targetInput.blur();
        resolve(false);
      }, 300);
    });
  }

  // Apply filters via SPA components
  if (collegeFilter) await setSelectValue('学院', collegeFilter);
  if (yearFilter) await setSelectValue('年级', yearFilter);
  if (majorFilter) await setSelectValue('专业方向', majorFilter);
  if (typeFilter) await setSelectValue('培养类别', typeFilter);

  // Click query button
  const buttons = document.querySelectorAll('button, .el-button');
  for (const btn of buttons) {
    const text = (btn.textContent || '').trim();
    if (text === '查 询' || text === '查询') { btn.click(); break; }
  }

  // Wait for filtered results
  while (Date.now() < deadline) {
    const loading = document.querySelector('.el-loading-mask, .v-loading');
    if (!loading) {
      const bodyRows = document.querySelectorAll('.el-table__body-wrapper tr');
      const dataRows = Array.from(bodyRows).filter(function(row) {
        const tds = row.querySelectorAll('td');
        return tds.length >= 5 && Array.from(tds).some(function(td) { return (td.textContent || '').trim().length > 2; });
      });
      if (dataRows.length > 0) {
        const headers = Array.from(document.querySelectorAll('.el-table__header-wrapper th .cell, th')).map(function(h) { return (h.textContent || '').trim(); }).filter(Boolean);
        const rows = dataRows.map(function(row) {
          return Array.from(row.querySelectorAll('td')).map(function(c) { return (c.textContent || '').trim(); });
        }).filter(function(r) { return r.length >= 5; });
        return { headers, rows: rows.slice(0, 100), total: rows.length };
      }
    }
    await new Promise(function(r) { setTimeout(r, 300); });
  }

  return { text: (document.body.textContent || '').trim().slice(0, 1000) };
})()
    `
    const data = await page.evaluate(script)
    return data
  }
})
