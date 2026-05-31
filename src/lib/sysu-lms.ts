export const LMS_DOMAIN = 'lms.sysu.edu.cn' as const

export const LMS_NAVIGATE_URLS = {
  dashboard: 'https://lms.sysu.edu.cn/my/'
} as const

export interface MoodleCourse {
  id: string
  name: string
  url: string
  summary?: string
}

export interface MoodleModule {
  type: string
  name: string
  url: string
  modId: number
}

export interface MoodleSection {
  name: string
  modules: MoodleModule[]
}

export interface MoodleResourceInfo {
  id?: string
  name: string
  type: string
  url: string
  mimetype?: string
  downloadUrl?: string
  playback?: {
    hasPlayer: boolean
    hasRateControl?: boolean
  }
}

function wrapBrowserScript(body: string): string {
  return `
(() => {
${body}
})()
`.trim()
}

/**
 * Extract the course name from a Moodle course page heading.
 */
export function extractCourseNameScript(): string {
  return wrapBrowserScript(`
const h1 = document.querySelector('h1');
return h1?.textContent?.trim() || document.title.replace(/\\s*\\|.*$/, '').trim() || '';
`)
}

/**
 * Wait for a Moodle page's main content region to be visible.
 */
export function waitForContent(): string {
  return `
(async () => {
  const selectors = ['#region-main', '[role="main"]', '.course-content', '#page-content'];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return true;
  }
  // fallback: wait a fixed window
  await new Promise(r => setTimeout(r, 2000));
  return true;
})()
`.trim()
}

/**
 * Extract enrolled courses from the Moodle dashboard page.
 * Dashboard lists courses as cards with title links.
 */
export function extractCoursesScript(): string {
  return wrapBrowserScript(`
const cards = document.querySelectorAll('.card .card-body, .coursebox .info, .dashboard-card');
if (cards.length === 0) {
  // fallback: look for any course link matching /course/view.php
  const links = document.querySelectorAll('a[href*="/course/view.php"]');
  const seen = new Set();
  return Array.from(links)
    .filter(a => {
      const href = a.getAttribute('href') || '';
      const id = href.match(/id=(\\d+)/)?.[1];
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map(a => ({
      id: a.href.match(/id=(\\d+)/)?.[1] || '',
      name: (a.textContent || '').trim(),
      url: a.href
    }));
}
return Array.from(cards).map(card => {
  const link = card.querySelector('a');
  const anchor = link || card.querySelector('a[href*="/course/view.php"]');
  const href = anchor?.getAttribute('href') || '';
  return {
    id: href.match(/id=(\\d+)/)?.[1] || '',
    name: (anchor?.textContent || card.textContent || '').trim().split('\\n')[0].trim(),
    url: href,
    summary: card.querySelector('.card-subtitle, .summary, .card-body p')?.textContent?.trim() || undefined
  };
});
`)
}

/**
 * Extract sections and their modules from a Moodle course page.
 * Sections are <li> elements with class "section" or "section main".
 */
export function extractSectionsScript(): string {
  return wrapBrowserScript(`
const sections = document.querySelectorAll('.section.main, li.section, .course-section');
if (sections.length === 0) return [];
return Array.from(sections).map(section => {
  const sectionTitle = section.querySelector('.sectionname, .section-title, h3');
  const modules = section.querySelectorAll('.activity, .modtype_assign, .modtype_resource, .modtype_forum, .modtype_quiz, .modtype_page, .modtype_url, .modtype_folder, .modtype_label, li.activity');
  return {
    name: sectionTitle?.textContent?.trim() || '',
    modules: Array.from(modules).map(mod => {
      const link = mod.querySelector('a');
      const href = link?.getAttribute('href') || '';
      const modIdMatch = href.match(/id=(\\d+)/) || mod.className.match(/modtype_(\\w+)/);
      return {
        type: mod.className.match(/modtype_(\\w+)/)?.[1] || 'unknown',
        name: (link?.textContent?.trim() || mod.getAttribute('aria-label') || mod.textContent?.trim() || '').split('\\n')[0].trim(),
        url: href,
        modId: modIdMatch ? parseInt(modIdMatch[1], 10) : 0
      };
    }).filter(m => m.name && m.url)
  };
}).filter(s => s.modules.length > 0);
`)
}

/**
 * Extract resource details from a resource page (file, video, page, URL, folder).
 */
export function extractResourceScript(): string {
  return wrapBrowserScript(`
const resource = { name: '', type: 'unknown', url: location.href };

// page title
const title = document.querySelector('h1, h2');
resource.name = title?.textContent?.trim() || document.title;

// detect type from page body class or URL path
const bodyClass = document.body.className || '';
if (bodyClass.includes('modtype_resource') || location.pathname.includes('/mod/resource/')) resource.type = 'file';
else if (bodyClass.includes('modtype_page') || location.pathname.includes('/mod/page/')) resource.type = 'page';
else if (bodyClass.includes('modtype_url') || location.pathname.includes('/mod/url/')) resource.type = 'url';
else if (bodyClass.includes('modtype_folder') || location.pathname.includes('/mod/folder/')) resource.type = 'folder';
else if (bodyClass.includes('modtype_fsresource') || location.pathname.includes('/mod/fsresource/')) resource.type = 'video';

// direct download link
const downloadLink = document.querySelector('a[href*="pluginfile.php"]');
if (downloadLink) {
  resource.downloadUrl = downloadLink.getAttribute('href');
}

// file mimetype from content area
const contentEl = document.querySelector('[role="main"], #region-main, #page-content');
if (contentEl && resource.type === 'file') {
  const text = contentEl.textContent || '';
  const typeMatch = text.match(/(?:File|Type|MIME):\\s*([\\w./-]+)/i);
  if (typeMatch) resource.mimetype = typeMatch[1].trim();
}

// video detection
resource.playback = { hasPlayer: false };
const video = document.querySelector('video');
if (video) {
  resource.playback.hasPlayer = true;
  // check for speed control buttons
  resource.playback.hasRateControl = !!document.querySelector('[data-rate], .vjs-playback-rate, .speed-button, button:has(svg)');
  if (!resource.downloadUrl) {
    const src = video.getAttribute('src') || video.querySelector('source')?.getAttribute('src');
    if (src) resource.downloadUrl = src;
  }
}

return resource;
`)
}

/**
 * Extract generic activity details from a Moodle activity page.
 */
export function extractActivityDetailScript(): string {
  return wrapBrowserScript(`
const activity = {
  name: '',
  type: 'unknown',
  modId: 0,
  url: location.href
};

const h1 = document.querySelector('h1');
activity.name = h1?.textContent?.trim() || document.title;

const bodyClass = document.body.className || '';
if (bodyClass.includes('modtype_assign')) activity.type = 'assignment';
else if (bodyClass.includes('modtype_quiz')) activity.type = 'quiz';
else if (bodyClass.includes('modtype_forum')) activity.type = 'forum';
else if (bodyClass.includes('modtype_resource')) activity.type = 'resource';
else if (bodyClass.includes('modtype_page')) activity.type = 'page';
else if (bodyClass.includes('modtype_url')) activity.type = 'url';
else if (bodyClass.includes('modtype_folder')) activity.type = 'folder';
else if (bodyClass.includes('modtype_fsresource')) activity.type = 'video';

const urlMatch = location.href.match(/id=(\\d+)/);
if (urlMatch) activity.modId = parseInt(urlMatch[1], 10);

const courseLink = document.querySelector('a[href*="/course/view.php?id="]');
activity.courseId = courseLink?.href.match(/id=(\\d+)/)?.[1] || undefined;

const descEl = document.querySelector('[role="main"] .description, #region-main .description, .activity-description, .no-overflow');
activity.description = descEl?.textContent?.trim().slice(0, 500) || undefined;

const contentEl = document.querySelector('[role="main"], #region-main, #page-content');
activity.content = contentEl?.textContent?.trim().slice(0, 1000) || undefined;

const loginForm = document.querySelector('#loginform, .login-form, input[name="logintoken"]');
if (loginForm) activity.requiresLogin = true;

const files = [];
const fileLinks = document.querySelectorAll('a[href*="pluginfile.php"], a[href*="mod_resource/content"]');
for (const link of fileLinks) {
  const name = (link.textContent || '').trim() || 'file';
  if (!name) continue;
  files.push({
    name,
    url: link.getAttribute('href') || ''
  });
}
if (files.length) activity.files = files.slice(0, 10);

return activity;
`)
}
