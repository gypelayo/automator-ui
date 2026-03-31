import type { Template } from './types'

const registry = new Map<string, Template>()

export function registerTemplate(template: Template): void {
  registry.set(template.id, template)
}

export function getTemplate(id: string): Template | undefined {
  return registry.get(id)
}

export function getAllTemplates(): Template[] {
  return Array.from(registry.values())
}
