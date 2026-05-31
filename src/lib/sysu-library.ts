export const LIBRARY_DOMAIN = 'library.sysu.edu.cn' as const

export const LIBRARY_NAVIGATE_URLS = {
  databases: 'https://library.sysu.edu.cn/page/3640',
  catalog: 'http://10.8.11.130:8991/F/-?func=find-b-0'
} as const

export interface DatabaseInfo {
  name: string
  url: string
  description?: string
  subjects?: string[]
  type?: string
  language?: string
  status?: string
}

export interface CatalogRecord {
  title: string
  author?: string
  isbn?: string
  callNumber?: string
  location?: string
  status?: string
  url: string
}

export interface CatalogSearchArgs {
  query: string
  type?: 'title' | 'author' | 'subject' | 'isbn' | 'all'
}

/**
 * Wait for library page content to be ready.
 */
export function waitForLibraryContent(): string {
  return `
(async () => {
  const selectors = ['#main-content', '[role="main"]', '.content', 'main'];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return true;
  }
  await new Promise(r => setTimeout(r, 3000));
  return true;
})()
`.trim()
}

/**
 * Extract database listing from the library database page.
 */
export function extractDatabasesScript(): string {
  return `
const rows = document.querySelectorAll('.resource-item, .database-item, .search-result-item, .views-row, tr');
const databases = [];
const seen = new Set();

for (const row of rows) {
  const link = row.querySelector('a[href*="/page/3640"]') || row.querySelector('a:not([href*="#"])');
  if (!link) continue;

  const name = (link.textContent || '').trim();
  if (!name || seen.has(name)) continue;
  seen.add(name);

  const description = row.querySelector('.description, .summary, p, .field-content')?.textContent?.trim() || undefined;
  const type = row.querySelector('.type, .resource-type')?.textContent?.trim() || undefined;
  const lang = row.querySelector('.language, .lang')?.textContent?.trim() || undefined;

  databases.push({
    name,
    url: link.getAttribute('href') || '',
    ...(description ? { description } : {}),
    ...(type ? { type } : {}),
    ...(lang ? { language: lang } : {})
  });
}

return databases.slice(0, 50);
`.trim()
}

/**
 * Extract catalog search results from INNOPAC system.
 */
export function extractCatalogResultsScript(): string {
  return `
const results = [];
const rows = document.querySelectorAll('tr, .briefcitRow, .briefcitDetail, .bibItemsEntry');
let count = 0;

for (const row of rows) {
  if (count >= 30) break;

  const titleLink = row.querySelector('a[href*="func=full-set"]');
  if (!titleLink) continue;

  const title = (titleLink.textContent || '').trim();
  if (!title) continue;

  const author = row.querySelector('.author, [class*="author"]')?.textContent?.trim() || undefined;
  const callNo = row.querySelector('.callNo, [class*="call"]')?.textContent?.trim() || undefined;
  const location = row.querySelector('.location, [class*="location"]')?.textContent?.trim() || undefined;
  const status = row.querySelector('.status, [class*="status"]')?.textContent?.trim() || undefined;

  results.push({
    title,
    url: titleLink.getAttribute('href') || '',
    ...(author ? { author } : {}),
    ...(callNo ? { callNumber: callNo } : {}),
    ...(location ? { location } : {}),
    ...(status ? { status } : {})
  });
  count++;
}

return results;
`.trim()
}

/**
 * Build the INNOPAC catalog search URL for a given query.
 */
export function buildCatalogSearchUrl(args: CatalogSearchArgs): string {
  const { query, type = 'title' } = args
  const encodedQuery = encodeURIComponent(query)

  const findCodeMap: Record<string, string> = {
    title: 'WRD',
    author: 'AWRD',
    subject: 'WRD',
    isbn: 'ISBN',
    all: 'WRD'
  }

  const code = findCodeMap[type] || 'WRD'
  return `http://10.8.11.130:8991/F/-?func=find-b&find_code=${code}&request=${encodedQuery}&local_base=ZSU09`
}

/**
 * Search query for the library one-stop literature search.
 * The literature search appears to be a frontend form that submits to a
 * third-party discovery service.
 */
export function buildLiteratureSearchUrl(query: string): string {
  return `https://${LIBRARY_DOMAIN}/search?q=${encodeURIComponent(query)}`
}
