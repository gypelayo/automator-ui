import type { ToggleField } from '@automator/core'
import { Switch } from '@/components/ui/switch'

interface ToggleFieldProps {
  field: ToggleField
  value: boolean
  onChange: (value: boolean) => void
}

export function ToggleFieldComponent({ field, value, onChange }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div
        className="flex-1 min-w-0 cursor-pointer select-none"
        onClick={() => onChange(!value)}
      >
        <label className="text-sm font-medium text-foreground cursor-pointer leading-snug">
          {field.label}
        </label>
        {field.description && (
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
            {field.description}
          </p>
        )}
      </div>
      <Switch
        checked={value}
        onCheckedChange={onChange}
      />
    </div>
  )
}
