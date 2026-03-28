import {
  buildJsonPostEvaluateScript,
  buildQueryEvaluateScript
} from './api'
import { resolveLookupValue, type LookupOption } from './lookup'

export const CLASSROOM_LOOKUP_ENDPOINTS = {
  building: '/jwxt/base-info/teaching-building/pull',
  campus: '/jwxt/base-info/campus/findCampusNamesBox',
  classroom: '/jwxt/base-info/classroom/queryclassroombymulticonditionV2'
} as const

interface LookupShape {
  aliasKeys?: string[]
  labelKeys: string[]
  valueKeys: string[]
}

interface EvaluatePage {
  evaluate: (script: string) => Promise<unknown>
}

type ClassroomLookupArgs = Record<string, unknown> & {
  building?: unknown
  campus?: unknown
  classroom?: unknown
}

function extractLookupRows(payload: any): Array<Record<string, unknown>> {
  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data
  }

  if (Array.isArray(payload?.data?.rows)) {
    return payload.data.rows
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.rows)) {
    return payload.rows
  }

  return []
}

function firstString(row: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key]

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return undefined
}

function isRawLookupValue(input: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(input.trim())
}

export function extractLookupOptions(payload: unknown, shape: LookupShape): LookupOption[] {
  return extractLookupRows(payload).flatMap((row) => {
    const label = firstString(row, shape.labelKeys)
    const value = firstString(row, shape.valueKeys)

    if (!label || !value) {
      return []
    }

    const aliases = new Set<string>([value])

    for (const key of shape.aliasKeys ?? []) {
      const alias = row[key]

      if (typeof alias === 'string' && alias.trim()) {
        aliases.add(alias.trim())
      }
    }

    return [
      {
        aliases: [...aliases],
        label,
        value
      }
    ]
  })
}

async function resolveRemoteLookupValue(
  page: EvaluatePage,
  input: string,
  fieldName: string,
  request: { body?: Record<string, unknown>; endpoint: string; params?: Record<string, string> },
  shape: LookupShape
): Promise<string> {
  if (isRawLookupValue(input)) {
    return input
  }

  const script =
    request.body === undefined
      ? buildQueryEvaluateScript({
          endpoint: request.endpoint,
          params: request.params ?? {}
        })
      : buildJsonPostEvaluateScript({
          body: request.body,
          endpoint: request.endpoint
        })
  const payload = await page.evaluate(script)
  const options = extractLookupOptions(payload, shape)

  return resolveLookupValue(options, input, fieldName)
}

export async function resolveClassroomLookupArgs<T extends ClassroomLookupArgs>(
  page: EvaluatePage,
  args: T
): Promise<T> {
  const resolvedArgs = { ...args }
  const campusInput = typeof resolvedArgs.campus === 'string' ? resolvedArgs.campus : undefined
  const buildingInput = typeof resolvedArgs.building === 'string' ? resolvedArgs.building : undefined
  const classroomInput = typeof resolvedArgs.classroom === 'string' ? resolvedArgs.classroom : undefined

  if (campusInput) {
    resolvedArgs.campus = await resolveRemoteLookupValue(
      page,
      campusInput,
      'campus',
      {
        endpoint: CLASSROOM_LOOKUP_ENDPOINTS.campus
      },
      {
        labelKeys: ['name', 'campusName', 'label', 'dataName'],
        valueKeys: ['id', 'value', 'code', 'dataNumber']
      }
    )
  }

  if (buildingInput) {
    resolvedArgs.building = await resolveRemoteLookupValue(
      page,
      buildingInput,
      'building',
      {
        endpoint: CLASSROOM_LOOKUP_ENDPOINTS.building,
        params: resolvedArgs.campus
          ? {
              campusId: String(resolvedArgs.campus)
            }
          : {}
      },
      {
        labelKeys: ['name', 'label', 'code', 'dataName'],
        valueKeys: ['id', 'value', 'code', 'dataNumber']
      }
    )
  }

  if (classroomInput) {
    resolvedArgs.classroom = await resolveRemoteLookupValue(
      page,
      classroomInput,
      'classroom',
      {
        body: {
          campusId: resolvedArgs.campus,
          classroomCode: classroomInput,
          teachingBuildIDs: resolvedArgs.building
        },
        endpoint: CLASSROOM_LOOKUP_ENDPOINTS.classroom
      },
      {
        labelKeys: ['code', 'name', 'classroomNo', 'label'],
        valueKeys: ['id', 'value', 'classroomID', 'code']
      }
    )
  }

  return resolvedArgs
}
