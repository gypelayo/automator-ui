import type { SliderField } from '@/core/types'
import { Slider } from '@/components/ui/slider'

interface SliderFieldProps {
  field: SliderField
  value: number
  onChange: (value: number) => void
}

export function SliderFieldComponent({ field, value, onChange }: SliderFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-foreground">{field.label}</label>
          {field.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
          )}
        </div>
        <span className="text-sm font-mono text-primary min-w-[2.5rem] text-right">
          {value}
        </span>
      </div>
      <div className="px-1">
        <Slider
          min={field.min}
          max={field.max}
          step={field.step}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
        />
        {(field.minLabel || field.maxLabel) && (
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">{field.minLabel}</span>
            <span className="text-xs text-muted-foreground">{field.maxLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}
