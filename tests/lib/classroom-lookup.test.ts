import { describe, expect, it } from 'vitest'

import {
  CLASSROOM_LOOKUP_ENDPOINTS,
  extractLookupOptions
} from '../../src/lib/classroom-lookup'

describe('extractLookupOptions', () => {
  it('uses the routed jwxt base-info endpoints required by opencli browser fetches', () => {
    expect(CLASSROOM_LOOKUP_ENDPOINTS).toEqual({
      building: '/jwxt/base-info/teaching-building/pull',
      campus: '/jwxt/base-info/campus/findCampusNamesBox',
      classroom: '/jwxt/base-info/classroom/queryclassroombymulticonditionV2'
    })
  })

  it('normalizes lookup rows with nested data arrays', () => {
    expect(
      extractLookupOptions(
        {
          data: {
            data: [
              { id: 'CAMPUS-1', name: '东校园' },
              { id: 'CAMPUS-2', name: '南校园' }
            ]
          }
        },
        {
          labelKeys: ['name'],
          valueKeys: ['id']
        }
      )
    ).toEqual([
      {
        aliases: ['CAMPUS-1'],
        label: '东校园',
        value: 'CAMPUS-1'
      },
      {
        aliases: ['CAMPUS-2'],
        label: '南校园',
        value: 'CAMPUS-2'
      }
    ])
  })

  it('supports classroom payloads that expose code and id', () => {
    expect(
      extractLookupOptions(
        {
          data: [
            { code: '东A101', id: 'ROOM-1' },
            { code: '东A102', id: 'ROOM-2' }
          ]
        },
        {
          labelKeys: ['code', 'name'],
          valueKeys: ['id', 'value']
        }
      )
    ).toEqual([
      {
        aliases: ['ROOM-1'],
        label: '东A101',
        value: 'ROOM-1'
      },
      {
        aliases: ['ROOM-2'],
        label: '东A102',
        value: 'ROOM-2'
      }
    ])
  })

  it('supports campus payloads that expose campusName instead of name', () => {
    expect(
      extractLookupOptions(
        {
          data: [{ campusName: '东校园', id: 'CAMPUS-1' }]
        },
        {
          labelKeys: ['name', 'campusName'],
          valueKeys: ['id']
        }
      )
    ).toEqual([
      {
        aliases: ['CAMPUS-1'],
        label: '东校园',
        value: 'CAMPUS-1'
      }
    ])
  })
})
