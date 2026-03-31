import type { Template } from './types'

const registry = new Map<string, Template>()

export function registerTemplate(template: Template): void {
  console.log('registerTemplate:', template.id, template.name)
  registry.set(template.id, template)
}

export function getTemplate(id: string, customTemplates: Template[] = []): Template | undefined {
  const result = registry.get(id) ?? customTemplates.find((t) => t.id === id)
  console.log('getTemplate:', id, result?.name ?? 'not found')
  return result
}

export function getAllTemplates(customTemplates: Template[] = []): Template[] {
  const result = [...Array.from(registry.values()), ...customTemplates]
  console.log('getAllTemplates:', result.map(t => t.id))
  return result
}
