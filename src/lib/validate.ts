export class CliValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CliValidationError'
  }
}

export interface ClassroomsArgs {
  building?: string
  classroom?: string
  dateFrom?: string
  dateTo?: string
  mode: 'time' | 'week'
  sectionFrom?: number
  sectionTo?: number
  weekFrom?: number
  weekTo?: number
  yearTerm?: string
}

const MAX_TIME_RANGE_DAYS = 30
const MAX_WEEK_SPAN = 4

function daysBetween(start: string, end: string): number {
  const startTime = Date.parse(start)
  const endTime = Date.parse(end)
  return (endTime - startTime) / (24 * 60 * 60 * 1000)
}

export function validateClassroomsArgs(args: ClassroomsArgs): ClassroomsArgs {
  if (!args.building && !args.classroom) {
    throw new CliValidationError('building or classroom is required')
  }

  if (args.mode === 'time') {
    if (!args.dateFrom || !args.dateTo) {
      throw new CliValidationError('time mode requires date-from and date-to')
    }

    if (daysBetween(args.dateFrom, args.dateTo) > MAX_TIME_RANGE_DAYS) {
      throw new CliValidationError('time mode date range cannot exceed 30 days')
    }
  }

  if (args.mode === 'week') {
    if (!args.yearTerm || args.weekFrom === undefined || args.weekTo === undefined) {
      throw new CliValidationError('week mode requires year-term, week-from, and week-to')
    }

    if (args.weekFrom > args.weekTo) {
      throw new CliValidationError('week-from cannot be greater than week-to')
    }

    if (args.weekTo - args.weekFrom > MAX_WEEK_SPAN) {
      throw new CliValidationError('week mode range cannot exceed 4 weeks')
    }
  }

  if (
    args.sectionFrom !== undefined &&
    args.sectionTo !== undefined &&
    args.sectionFrom > args.sectionTo
  ) {
    throw new CliValidationError('section-from cannot be greater than section-to')
  }

  return args
}
