export const LMS_DOMAIN = 'lms.sysu.edu.cn' as const

export const LMS_NAVIGATE_URLS = {
  dashboard: 'https://lms.sysu.edu.cn/my/?myoverviewtab=courses'
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

interface MoodleDashboardWsCourse {
  id?: number | string
  fullname?: string
  shortname?: string
  viewurl?: string
  courseurl?: string
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
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    const dashboardRoot = document.querySelector('[data-block="myoverview"]')
      || document.querySelector('.block_myoverview');
    const dashboardCourses = dashboardRoot?.querySelector('a[href*="course/view.php"]');
    const dashboardTitles = dashboardRoot?.querySelector('a[href*="course/view.php"][title], a[href*="course/view.php"]');
    if (dashboardCourses && dashboardTitles) return true;

    const selectors = ['#region-main', '[role="main"]', '.course-content', '#page-content'];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return true;
    }

    await new Promise(r => setTimeout(r, 250));
  }
  return true;
})()
`.trim()
}

/**
 * Wait specifically for Moodle dashboard course links to appear inside the myoverview block.
 * The shell region renders before the AJAX course list, so generic page-content checks are too early.
 */
export function waitForDashboardCourses(): string {
  return `
(async () => {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    const dashboardRoot = document.querySelector('[data-block="myoverview"]')
      || document.querySelector('.block_myoverview');
    const sesskey = globalThis.M?.cfg?.sesskey;
    if (dashboardRoot && sesskey) return true;
    await new Promise(r => setTimeout(r, 250));
  }
  return true;
})()
`.trim()
}

/**
 * Fetch Moodle dashboard courses via core_course_get_enrolled_courses_by_timeline_classification AJAX API.
 */
export function fetchDashboardCoursesScript(): string {
  return `
(async () => {
  const sesskey = (typeof M !== 'undefined' && M.cfg && M.cfg.sesskey)
    ? M.cfg.sesskey
    : (document.querySelector('input[name="sesskey"]')?.value || '');
  if (!sesskey) return [];

  const classifications = ['inprogress', 'all', 'current', 'future', 'past'];

  for (const classification of classifications) {
    try {
      const response = await fetch('/lib/ajax/service.php?sesskey=' + sesskey, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          index: 0,
          methodname: 'core_course_get_enrolled_courses_by_timeline_classification',
          args: { classification, limit: 50, offset: 0, sort: 'shortname' }
        }])
      });
      const data = await response.json();
      if (data?.[0]?.data?.courses?.length > 0) {
        return data[0].data.courses.map(function(c) {
          return {
            id: String(c.id),
            name: c.shortname || c.fullname || '',
            url: 'https://' + '${LMS_DOMAIN}' + '/course/view.php?id=' + c.id,
            summary: c.summary ? c.summary.replace(/<[^>]+>/g,'').trim().slice(0,200) : undefined
          };
        });
      }
    } catch(e) { /* try next */ }
  }
  return [];
})()
`.trim()
}

/**
 * Extract enrolled courses from the Moodle myoverview dashboard block after AJAX rendering.
 * Scope to the myoverview block and wait for course cards to appear.
 */
export function extractCoursesScript(): string {
  return `
(async () => {
  'use strict';
  const deadline = Date.now() + 10000;
  const seen = new Set();

  while (Date.now() < deadline) {
    const overviewBlock =
      document.querySelector('[data-block="myoverview"]') ||
      document.querySelector('.block_myoverview');

    if (overviewBlock) {
      // Look for course cards in the myoverview content region
      const courseCards = overviewBlock.querySelectorAll('[data-region="course-view-content"] .card, [data-region="course-view-content"] .course-list-item, [data-region="course-view-content"] a[href*="course/view.php?id="]');
      const courseLinks = overviewBlock.querySelectorAll('a[href*="course/view.php?id="]');

      // Only use links that have meaningful text (course names, not just icons)
      const matches = Array.from(courseCards.length > 0 ? courseCards : courseLinks)
        .filter(function(el) {
          const href = el.getAttribute('href') || (el.querySelector('[href]')?.getAttribute('href')) || '';
          const id = href.match(/id=(\\d+)/)?.[1];
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        })
        .map(function(el) {
          const link = el.tagName === 'A' ? el : el.querySelector('[href]');
          const href = link?.getAttribute('href') || '';
          const id = href.match(/id=(\\d+)/)?.[1] || '';
          const text = (link?.textContent || el.textContent || '').trim();
          // Filter out very short labels (icons, '课程图片', numbers)
          const name = text.length < 4 ? (link?.getAttribute('title') || text) : text;
          return { id: id, name: name, url: href };
        })
        .filter(function(c) { return c.id && c.name && c.name.length > 1; });

      if (matches.length > 0) return matches;

      // Check if the course-view-content region has rendered at all
      const contentRegion = overviewBlock.querySelector('[data-region="course-view-content"]');
      if (contentRegion && contentRegion.children.length > 0) {
        // Content rendered but no course links found with selectors
        // Try broader approach: find all links in the content region
        const allLinks = contentRegion.querySelectorAll('a');
        const broadMatches = Array.from(allLinks)
          .filter(function(a) {
            const href = a.getAttribute('href') || '';
            const id = href.match(/id=(\\d+)/)?.[1];
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
          })
          .map(function(a) {
            const href = a.getAttribute('href') || '';
            const id = href.match(/id=(\\d+)/)?.[1] || '';
            const name = (a.textContent || '').trim();
            return { id: id, name: name, url: href };
          })
          .filter(function(c) { return c.id && c.name.length > 1; });
        if (broadMatches.length > 0) return broadMatches;
      }
    }

    await new Promise(function(r) { setTimeout(r, 300); });
  }

  return [];
})()
`.trim()
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
const pathName = location.pathname || '';
const cm = new URLSearchParams(location.search).get('id');
activity.modName = bodyClass.match(/modtype_(\w+)/)?.[1] || '';

if (bodyClass.includes('modtype_assign') || pathName.includes('/mod/assign/')) activity.type = 'assignment';
else if (bodyClass.includes('modtype_quiz') || pathName.includes('/mod/quiz/')) activity.type = 'quiz';
else if (bodyClass.includes('modtype_forum') || pathName.includes('/mod/forum/')) activity.type = 'forum';
else if (bodyClass.includes('modtype_resource') || pathName.includes('/mod/resource/')) activity.type = 'resource';
else if (bodyClass.includes('modtype_page') || pathName.includes('/mod/page/')) activity.type = 'page';
else if (bodyClass.includes('modtype_url') || pathName.includes('/mod/url/')) activity.type = 'url';
else if (bodyClass.includes('modtype_folder') || pathName.includes('/mod/folder/')) activity.type = 'folder';
else if (bodyClass.includes('modtype_fsresource') || pathName.includes('/mod/fsresource/')) activity.type = 'video';

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
