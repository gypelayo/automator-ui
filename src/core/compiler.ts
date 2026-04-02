import type { FieldSchema, FieldValues, FieldValue, BudgetEntry, TemplateDefinition, Template } from './types'

/** Returns the default values for a list of field schemas */
export function getDefaultValues(fields: FieldSchema[]): FieldValues {
  const values: FieldValues = {}
  for (const field of fields) {
    if ('default' in field && field.default !== undefined) {
      values[field.id] = field.default as FieldValue
    }
  }
  return values
}

/** Formats a slider value as a human-readable label */
export function formatSlider(
  value: number,
  min: number,
  max: number,
  minLabel?: string,
  maxLabel?: string,
): string {
  const pct = Math.round(((value - min) / (max - min)) * 100)
  if (minLabel && maxLabel) {
    return `${pct}% (${minLabel} → ${maxLabel})`
  }
  return `${value}/${max}`
}

/** Formats a budget split as markdown lines */
export function formatBudgetSplit(entries: BudgetEntry[]): string {
  return entries
    .map((e) => `- **${e.label}**: $${e.amount.toLocaleString()}`)
    .join('\n')
}

/** Formats a multi-select as a comma-separated list */
export function formatMultiSelect(values: string[]): string {
  if (values.length === 0) return '_none selected_'
  return values.join(', ')
}

/** Wraps a markdown section header + body */
export function section(title: string, body: string): string {
  return `## ${title}\n\n${body.trim()}\n`
}

/** Wraps a markdown subsection */
export function subsection(title: string, body: string): string {
  return `### ${title}\n\n${body.trim()}\n`
}

/** Compiles field values for a set of fields into markdown lines */
export function compileFields(
  fields: FieldSchema[],
  values: FieldValues,
): string {
  const lines: string[] = []

  for (const field of fields) {
    const value = values[field.id]
    if (value === undefined) continue

    switch (field.type) {
      case 'slider': {
        const label = formatSlider(
          value as number,
          field.min,
          field.max,
          field.minLabel,
          field.maxLabel,
        )
        lines.push(`- **${field.label}**: ${label}`)
        break
      }
      case 'toggle':
        lines.push(`- **${field.label}**: ${value ? 'Yes' : 'No'}`)
        break
      case 'text':
      case 'textarea':
        if (String(value).trim()) {
          lines.push(`- **${field.label}**: ${value}`)
        }
        break
      case 'select':
        lines.push(`- **${field.label}**: ${value}`)
        break
      case 'multi-select':
        lines.push(
          `- **${field.label}**: ${formatMultiSelect(value as string[])}`,
        )
        break
      case 'budget-split':
        lines.push(`- **${field.label}**:`)
        ;(value as BudgetEntry[]).forEach((e) => {
          lines.push(`  - ${e.label}: $${e.amount.toLocaleString()}`)
        })
        break
    }
  }

  return lines.join('\n')
}

/**
 * A generic render function used for AI-generated / imported templates.
 * Iterates every section and field and emits clean markdown.
 */
export function genericRender(
  sections: TemplateDefinition['sections'],
  values: FieldValues,
): string {
  const lines: string[] = []
  for (const sec of sections) {
    const body = compileFields(sec.fields, values)
    if (body.trim()) {
      lines.push(section(sec.title, body))
    }
  }
  return lines.join('\n')
}

/**
 * Hydrates a TemplateDefinition (JSON-serialisable) into a full Template
 * with a generic render function.
 */
export function templateFromDefinition(def: TemplateDefinition): Template {
  return {
    ...def,
    render: (values: FieldValues) => genericRender(def.sections, values),
  }
}
