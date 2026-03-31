import { registerTemplate } from '@/core/registry'
import { travelTemplate } from './travel'
import { infraMonitorTemplate } from './infra-monitor'

export function registerAllTemplates() {
  registerTemplate(travelTemplate)
  registerTemplate(infraMonitorTemplate)
}
