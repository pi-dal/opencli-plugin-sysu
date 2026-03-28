import { describe, expect, it } from 'vitest'

import { CliLookupError, resolveLookupValue } from '../../src/lib/lookup'

describe('resolveLookupValue', () => {
  const options = [
    { aliases: ['东校', 'east'], label: '东校园', value: 'EAST' },
    { aliases: ['南校', 'south'], label: '南校园', value: 'SOUTH' }
  ]

  it('returns the backend value for an exact label match', () => {
    expect(resolveLookupValue(options, '东校园', 'campus')).toBe('EAST')
  })

  it('returns the backend value for an alias match', () => {
    expect(resolveLookupValue(options, 'east', 'campus')).toBe('EAST')
  })

  it('throws when the lookup value is unknown', () => {
    expect(() => resolveLookupValue(options, '珠海', 'campus')).toThrowError(
      new CliLookupError('unknown campus: 珠海. candidates: 东校园, 南校园')
    )
  })

  it('throws when alias resolution is ambiguous', () => {
    expect(() =>
      resolveLookupValue(
        [
          { aliases: ['common'], label: '甲', value: 'A' },
          { aliases: ['common'], label: '乙', value: 'B' }
        ],
        'common',
        'department'
      )
    ).toThrowError(new CliLookupError('ambiguous department: common'))
  })

  it('limits candidate hints to a small readable set', () => {
    expect(() =>
      resolveLookupValue(
        [
          { label: 'A', value: 'A' },
          { label: 'B', value: 'B' },
          { label: 'C', value: 'C' },
          { label: 'D', value: 'D' },
          { label: 'E', value: 'E' },
          { label: 'F', value: 'F' }
        ],
        'missing',
        'building'
      )
    ).toThrowError(new CliLookupError('unknown building: missing. candidates: A, B, C, D, E'))
  })
})
