import { describe, expect, it } from 'vitest'

import { CliValidationError, validateClassroomsArgs } from '../../src/lib/validate'

describe('validateClassroomsArgs', () => {
  it('requires date range in time mode', () => {
    expect(() =>
      validateClassroomsArgs({
        mode: 'time',
        building: '东A'
      })
    ).toThrowError(new CliValidationError('time mode requires date-from and date-to'))
  })

  it('requires academic range in week mode', () => {
    expect(() =>
      validateClassroomsArgs({
        mode: 'week',
        building: '东A'
      })
    ).toThrowError(new CliValidationError('week mode requires year-term, week-from, and week-to'))
  })

  it('requires building or classroom', () => {
    expect(() =>
      validateClassroomsArgs({
        mode: 'time',
        dateFrom: '2026-03-28',
        dateTo: '2026-03-29'
      })
    ).toThrowError(new CliValidationError('building or classroom is required'))
  })

  it('rejects time ranges longer than 30 days', () => {
    expect(() =>
      validateClassroomsArgs({
        mode: 'time',
        building: '东A',
        dateFrom: '2026-03-01',
        dateTo: '2026-04-15'
      })
    ).toThrowError(new CliValidationError('time mode date range cannot exceed 30 days'))
  })

  it('rejects week ranges longer than 4 weeks', () => {
    expect(() =>
      validateClassroomsArgs({
        mode: 'week',
        building: '东A',
        yearTerm: '2025-2',
        weekFrom: 1,
        weekTo: 6
      })
    ).toThrowError(new CliValidationError('week mode range cannot exceed 4 weeks'))
  })

  it('rejects reversed section ranges', () => {
    expect(() =>
      validateClassroomsArgs({
        mode: 'time',
        building: '东A',
        dateFrom: '2026-03-28',
        dateTo: '2026-03-29',
        sectionFrom: 6,
        sectionTo: 2
      })
    ).toThrowError(new CliValidationError('section-from cannot be greater than section-to'))
  })

  it('accepts a valid week-mode query', () => {
    expect(
      validateClassroomsArgs({
        mode: 'week',
        building: '东A',
        yearTerm: '2025-2',
        weekFrom: 1,
        weekTo: 4,
        sectionFrom: 1,
        sectionTo: 2
      })
    ).toMatchObject({
      mode: 'week',
      building: '东A',
      yearTerm: '2025-2',
      weekFrom: 1,
      weekTo: 4,
      sectionFrom: 1,
      sectionTo: 2
    })
  })
})
