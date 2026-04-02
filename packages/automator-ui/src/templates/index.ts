import { registerTemplate } from '@automator/core'
import { travelTemplate } from './travel'

export function registerAllTemplates() {
  registerTemplate(travelTemplate)
}
