import { registerTemplate } from '@automator/core'
import { travelTemplate } from './travel'
import { infraMonitorTemplate } from './infra-monitor'

export function registerAllTemplates() {
  console.log('[templates] registerAllTemplates called')
  registerTemplate(travelTemplate)
  registerTemplate(infraMonitorTemplate)
  console.log('[templates] registered travel and infra-monitor')
}
