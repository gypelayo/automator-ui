import type { SliderField } from '@automator/core'
import { Slider } from '@/components/ui/slider'

interface SliderFieldProps {
  field: SliderField
  value: number
  onChange: (value: number) => void
}

export function SliderFieldComponent({ field, value, onChange }: SliderFieldProps) {
  const pct = ((value - field.min) / (field.max - field.min)) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label className="text-[13px] font-medium text-foreground leading-snug">
            {field.label}
          </label>
          {field.description && (
            <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-snug">
              {field.description}
            </p>
          )}
        </div>
        <span
          className="shrink-0 text-[11px] font-mono font-semibold tabular-nums px-1.5 py-0.5 rounded"
          style={{
            color: 'hsl(var(--primary))',
            backgroundColor: 'hsl(var(--primary) / 0.1)',
          }}
        >
          {value}{field.max <= 10 && <span className="opacity-40">/{field.max}</span>}
        </span>
      </div>

      <div className="space-y-1.5">
        <Slider
          min={field.min}
          max={field.max}
          step={field.step}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
        />
        {(field.minLabel || field.maxLabel) && (
          <div className="flex justify-between">
            <span className="text-[10px] text-muted-foreground/60">{field.minLabel}</span>
            <span
              className="text-[10px] font-mono"
              style={{ color: 'hsl(var(--primary) / 0.45)' }}
            >
              {'─'.repeat(Math.round(pct / 14))}●{'─'.repeat(Math.round((100 - pct) / 14))}
            </span>
            <span className="text-[10px] text-muted-foreground/60">{field.maxLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}
