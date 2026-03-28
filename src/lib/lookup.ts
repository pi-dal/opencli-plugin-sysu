export class CliLookupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CliLookupError'
  }
}

export interface LookupOption {
  aliases?: string[]
  label: string
  value: string
}

function formatCandidateHint(options: LookupOption[]): string {
  const labels = [...new Set(options.map((option) => option.label.trim()).filter(Boolean))].slice(0, 5)

  if (labels.length === 0) {
    return ''
  }

  return `. candidates: ${labels.join(', ')}`
}

export function resolveLookupValue(
  options: LookupOption[],
  input: string,
  fieldName: string
): string {
  const normalizedInput = input.trim().toLowerCase()

  const matches = options.filter((option) => {
    const labelMatch = option.label.trim().toLowerCase() === normalizedInput
    const aliasMatch = option.aliases?.some((alias) => alias.trim().toLowerCase() === normalizedInput)

    return labelMatch || aliasMatch
  })

  if (matches.length === 0) {
    throw new CliLookupError(`unknown ${fieldName}: ${input}${formatCandidateHint(options)}`)
  }

  if (matches.length > 1) {
    throw new CliLookupError(`ambiguous ${fieldName}: ${input}`)
  }

  return matches[0].value
}
