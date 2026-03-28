const PLUGIN_COMMAND_SOURCE_FILES = [
  'courses.ts',
  'classrooms.ts',
  'classroom-occupy-detail.ts',
  'classroom-schedule-detail.ts'
] as const

export function getPluginCommandSourceFiles(): string[] {
  return [...PLUGIN_COMMAND_SOURCE_FILES]
}

export function getPluginCommandBuildEntries() {
  return PLUGIN_COMMAND_SOURCE_FILES.map((input) => ({
    input,
    output: input.replace(/\.ts$/, '.js')
  }))
}
