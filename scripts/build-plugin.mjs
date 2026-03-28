import { rmSync } from 'node:fs'
import { build } from 'esbuild'

const commandEntries = [
  ['courses.ts', 'courses.js'],
  ['classrooms.ts', 'classrooms.js'],
  ['classroom-occupy-detail.ts', 'classroom-occupy-detail.js'],
  ['classroom-schedule-detail.ts', 'classroom-schedule-detail.js']
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
