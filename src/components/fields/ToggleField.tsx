import type { ToggleField } from '@/core/types'
import { Switch } from '@/components/ui/switch'

interface ToggleFieldProps {
  field: ToggleField
  value: boolean
  onChange: (value: boolean) => void
}

export function ToggleFieldComponent({ field, value, onChange }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <label className="text-sm font-medium text-foreground">{field.label}</label>
        {field.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
        )}
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  )
}
