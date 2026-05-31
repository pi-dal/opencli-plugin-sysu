import { Strategy, cli } from '@jackwener/opencli/registry'

import { SYSU_DOMAIN } from './src/lib/api'

type TrainingPlanPayload = {
  collected?: number
  headers?: string[]
  message?: string
  rows?: string[][]
  total?: number
  totalDeclared?: number
}

type TrainingPlanFilters = {
  college: string
  major: string
  type: string
  year: string
}

function normalizeText(value: unknown) {
  return String(value ?? '').trim()
}

function buildTrainingPlanScript() {
  return `
(async () => {
  const headers = [
    '序号',
    '年级',
    '学院',
    '专业方向代码',
    '专业方向名称',
    '培养类别',
    '修业年限',
    '学科门类',
    '学位授予门类'
  ];
  const endpoint = '/jwxt/training-programe/training-programe/undergradute/profession-info';
  const pageSize = 200;

  function getText(node) {
    return (node && node.textContent ? node.textContent : '').replace(/\\s+/g, ' ').trim();
  }

  function hasAuthExpired() {
    return getText(document.body).includes('登录过期');
  }

  function rowKey(row) {
    return String(row.id || row.teachPlanNumber || row.code || row.professionCode || '');
  }

  function toDisplayRow(row, index) {
    return [
      String(index + 1),
      String(row.grade ?? ''),
      String(row.manageUnitName ?? ''),
      String(row.professionCode ?? ''),
      String(row.professionName ?? ''),
      String(row.trainTypeName ?? ''),
      String(row.educationalSystem ?? ''),
      String(row.disciplineCateName ?? ''),
      String(row.degreeGrantName ?? '')
    ];
  }

  async function requestPage(pageNo) {
    const response = await fetch(endpoint + '?_t=' + Date.now(), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        pageNo: pageNo,
        pageSize: pageSize,
        total: true
      })
    });

    const text = await response.text();

    if (text.includes('登录过期') || text.includes('No permission')) {
      return {
        authRequired: true,
        payload: null
      };
    }

    try {
      return {
        authRequired: false,
        payload: JSON.parse(text)
      };
    } catch (error) {
      return {
        authRequired: false,
        payload: null,
        raw: text
      };
    }
  }

  if (hasAuthExpired()) {
    throw new Error('AUTH_REQUIRED: 登录过期，请重新登录 jwxt.sysu.edu.cn');
  }

  const firstPage = await requestPage(1);
  if (firstPage.authRequired) {
    throw new Error('AUTH_REQUIRED: 登录过期，请重新登录 jwxt.sysu.edu.cn');
  }

  const firstData = firstPage.payload && firstPage.payload.data ? firstPage.payload.data : null;
  if (!firstData || !Array.isArray(firstData.rows)) {
    throw new Error('EMPTY_RESULT: training program API returned no data');
  }

  const totalDeclared = Number(firstData.total || 0);
  const seen = new Set();
  const collected = [];

  function appendRows(items) {
    items.forEach(function(item) {
      const key = rowKey(item);
      if (!key || !seen.has(key)) {
        if (key) seen.add(key);
        collected.push(item);
      }
    });
  }

  appendRows(firstData.rows);

  const maxPages = Math.ceil(totalDeclared / pageSize) + 5;
  let pageNo = 2;
  while (collected.length < totalDeclared && pageNo <= maxPages) {
    const nextPage = await requestPage(pageNo);
    if (nextPage.authRequired) break;

    const nextData = nextPage.payload && nextPage.payload.data ? nextPage.payload.data : null;
    if (!nextData || !Array.isArray(nextData.rows) || nextData.rows.length === 0) {
      break;
    }

    appendRows(nextData.rows);

    if (nextData.rows.length < pageSize) {
      break;
    }

    pageNo += 1;
  }

  const rows = collected.map(function(row, index) {
    return toDisplayRow(row, index);
  });

  return {
    collected: collected.length,
    headers: headers,
    rows: rows,
    total: rows.length,
    totalDeclared: totalDeclared
  };
})()
`.trim()
}

function applyTrainingPlanFilters(payload: TrainingPlanPayload, filters: TrainingPlanFilters) {
  const headers = Array.isArray(payload.headers) ? payload.headers : []
  const rows = Array.isArray(payload.rows) ? payload.rows : []
  const headerIndex = new Map(headers.map((header, index) => [header, index]))

  const yearIndex = headerIndex.get('年级') ?? 1
  const collegeIndex = headerIndex.get('学院') ?? 2
  const majorIndex = headerIndex.get('专业方向名称') ?? 4
  const typeIndex = headerIndex.get('培养类别') ?? 5

  const filteredRows = rows.filter((row) => {
    const yearValue = normalizeText(row[yearIndex])
    const collegeValue = normalizeText(row[collegeIndex])
    const majorValue = normalizeText(row[majorIndex])
    const typeValue = normalizeText(row[typeIndex])

    if (filters.year && yearValue !== filters.year) return false
    if (filters.college && !collegeValue.includes(filters.college)) return false
    if (filters.major && !majorValue.includes(filters.major)) return false
    if (filters.type && typeValue !== filters.type) return false
    return true
  })

  return {
    collected: Number(payload.collected ?? rows.length),
    headers,
    ...(payload.message ? { message: payload.message } : {}),
    rows: filteredRows,
    total: filteredRows.length,
    totalDeclared: Number(payload.totalDeclared ?? rows.length)
  }
}

cli({
  site: 'sysu',
  name: 'jwxt-training-plan',
  description: 'SYSU training programs — browse all-school training program view (full dataset)',
  access: 'read',
  domain: SYSU_DOMAIN,
  navigateBefore: 'https://jwxt.sysu.edu.cn/jwxt/mk/#/allSchoolTrainingProgramView?code=jwxsd_qxpyfack&resourceName=%E5%85%A8%E6%A0%A1%E5%9F%B9%E5%85%BB%E6%96%B9%E6%A1%88%E6%9F%A5%E7%9C%8B',
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'year', help: 'Filter by grade year, e.g. 2021' },
    { name: 'college', help: 'Filter by college/department name (full dataset)' },
    { name: 'major', help: 'Filter by major/direction name' },
    { name: 'type', help: 'Filter by training type, e.g. 主修, 辅修' }
  ],
  func: async (page: any, kwargs: any) => {
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const payload = await page.evaluate(buildTrainingPlanScript())

    const result = applyTrainingPlanFilters(payload as TrainingPlanPayload, {
      college: normalizeText(kwargs.college),
      major: normalizeText(kwargs.major),
      type: normalizeText(kwargs.type),
      year: normalizeText(kwargs.year)
    })

    return result.rows
  }
})
