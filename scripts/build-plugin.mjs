import { rmSync } from 'node:fs'
import { build } from 'esbuild'

const commandEntries = [
  ['sysu-jwxt-courses.ts', 'sysu-jwxt-courses.js'],
  ['sysu-jwxt-classrooms.ts', 'sysu-jwxt-classrooms.js'],
  ['sysu-jwxt-classroom-schedule-detail.ts', 'sysu-jwxt-classroom-schedule-detail.js'],
  ['sysu-lms-dashboard.ts', 'sysu-lms-dashboard.js'],
  ['sysu-lms-course.ts', 'sysu-lms-course.js'],
  ['sysu-lms-resource.ts', 'sysu-lms-resource.js'],
  ['sysu-library-databases.ts', 'sysu-library-databases.js'],
  ['sysu-library-catalog.ts', 'sysu-library-catalog.js'],
  ['sysu-library-item.ts', 'sysu-library-item.js'],
  ['sysu-lms-activity.ts', 'sysu-lms-activity.js'],
  ['sysu-jwxt-timetable.ts', 'sysu-jwxt-timetable.js'],
  ['sysu-jwxt-grades.ts', 'sysu-jwxt-grades.js'],
  ['sysu-jwxt-notifications.ts', 'sysu-jwxt-notifications.js'],
  ['sysu-jwxt-training-plan.ts', 'sysu-jwxt-training-plan.js']
]

for (const [input, output] of commandEntries) {
  await build({
    bundle: true,
    entryPoints: [input],
    external: ['@jackwener/opencli/registry'],
    format: 'esm',
    outfile: output,
    packages: 'external',
    platform: 'node',
    target: 'node20'
  })
}

rmSync('pnpm-lock.yaml', { force: true })
