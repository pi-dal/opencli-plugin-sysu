const PLUGIN_COMMAND_SOURCE_FILES = [
  'sysu-jwxt-courses.ts',
  'sysu-jwxt-classrooms.ts',
  'sysu-jwxt-classroom-occupy-detail.ts',
  'sysu-jwxt-classroom-schedule-detail.ts',
  'sysu-lms-dashboard.ts',
  'sysu-lms-course.ts',
  'sysu-lms-resource.ts',
  'sysu-library-databases.ts',
  'sysu-library-catalog.ts',
  'sysu-library-item.ts',
  'sysu-lms-activity.ts',
  'sysu-jwxt-timetable.ts',
  'sysu-jwxt-grades.ts',
  'sysu-jwxt-notifications.ts'
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
