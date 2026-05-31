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

export interface SearchResult {
  title: string
  url: string
  snippet?: string
  author?: string
  source?: string
  date?: string
}

export interface CatalogItemDetail {
  title: string
  author?: string
  isbn?: string
  callNumber?: string
  publisher?: string
  year?: string
  subjects?: string[]
  summary?: string
  location?: string
  status?: string
  url: string
}

export interface CatalogSearchArgs {
  query: string
  type?: 'title' | 'author' | 'subject' | 'isbn' | 'all'
}

function wrapBrowserScript(body: string): string {
  return `
(() => {
${body}
})()
`.trim()
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
  return wrapBrowserScript(`
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
`)
}

/**
 * Extract catalog search results from INNOPAC system.
 */
export function extractCatalogResultsScript(): string {
  return wrapBrowserScript(`
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
    ...(itemLocation ? { location: itemLocation } : {}),
    ...(status ? { status } : {})
  });
  count++;
}

return results;
`)
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

/**
 * Extract search results from the library literature search results page.
 */
export function extractSearchResultsScript(): string {
  return wrapBrowserScript(`
const cards = document.querySelectorAll('.node, .search-result, article, .views-row, .teaser');
const results = [];
const seen = new Set();

for (const card of cards) {
  const link = card.querySelector('a[href]');
  if (!link) continue;

  const title = (link.textContent || '').trim();
  if (!title || seen.has(title)) continue;
  seen.add(title);

  const snippet = card.querySelector('.node-content, .content, .description, .field-content, p')?.textContent?.trim() || undefined;

  results.push({
    title,
    url: link.getAttribute('href') || '',
    ...(snippet ? { snippet: snippet.slice(0, 200) } : {})
  });
}

return results.slice(0, 20);
`)
}

/**
 * Extract catalog item detail from an INNOPAC full record page.
 */
export function extractCatalogItemDetailScript(): string {
  return wrapBrowserScript(`
function getLabel(prefix) {
  const texts = document.body.innerText || '';
  const lines = texts.split('\\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith(prefix)) {
      return lines[i].replace(prefix, '').trim();
    }
  }
  return undefined;
}

const title = document.querySelector('h1, h2, .bib-title, [class*="title"]')?.textContent?.trim() || document.title;

const author = getLabel('Author:') || getLabel('作者:');
const isbn = getLabel('ISBN:');
const publisher = getLabel('Publisher:') || getLabel('出版:');
const year = getLabel('Year:') || getLabel('年份:');
const callNumber = getLabel('Call #:') || getLabel('索书号:') || getLabel('Call No:');
const itemLocation = getLabel('Location:') || getLabel('馆藏地:');
const status = getLabel('Status:') || getLabel('状态:');

const subjects = [];
for (const subj of ['Subject:', '主题:', 'Subjects:', 'Topic:']) {
  const val = getLabel(subj);
  if (val) subjects.push(val);
}

const summary = getLabel('Summary:') || getLabel('摘要:') || getLabel('Description:');

return {
  title,
  url: window.location.href,
  ...(author ? { author } : {}),
  ...(isbn ? { isbn } : {}),
  ...(callNumber ? { callNumber } : {}),
  ...(publisher ? { publisher } : {}),
  ...(year ? { year } : {}),
  ...(subjects.length ? { subjects } : {}),
  ...(summary ? { summary } : {}),
  ...(itemLocation ? { location: itemLocation } : {}),
  ...(status ? { status } : {})
};
`)
}

/**
 * Build an INNOPAC full record URL from a catalog record ID.
 */
export function buildCatalogDetailUrl(id: string): string {
  if (id.startsWith('http://') || id.startsWith('https://')) {
    return id
  }
  return `http://10.8.11.130:8991/F/-?func=full-set-set&set_number=${encodeURIComponent(id)}&format=999`
}
