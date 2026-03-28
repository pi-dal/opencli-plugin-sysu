function camelCaseKey(key: string): string {
  return key.replace(/-([a-z])/g, (_match, char: string) => char.toUpperCase())
}

export function normalizeCliKwargs(
  kwargs: Record<string, unknown>
): Record<string, unknown> {
  const normalized = Object.fromEntries(
    Object.entries(kwargs).map(([key, value]) => [camelCaseKey(key), value])
  )

  if (typeof normalized.weekdays === 'string') {
    normalized.weekdays = normalized.weekdays
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return normalized
}
