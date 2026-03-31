import type { SliderField } from '@automator/core'
import { Slider } from '@/components/ui/slider'

interface SliderFieldProps {
  field: SliderField
  value: number
  onChange: (value: number) => void
}

export function SliderFieldComponent({ field, value, onChange }: SliderFieldProps) {
  // Normalised 0–1 position for the fill bar percentage label
  const pct = ((value - field.min) / (field.max - field.min)) * 100

  return (
    <div className="space-y-2.5">
      {/* Label row */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <label className="text-sm font-medium text-foreground leading-snug">
            {field.label}
          </label>
          {field.description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              {field.description}
            </p>
          )}
        </div>
        {/* Value badge */}
        <span
          className="shrink-0 text-xs font-mono font-medium px-2 py-0.5 rounded"
          style={{
            color: 'hsl(var(--primary))',
            backgroundColor: 'hsl(var(--primary) / 0.12)',
            border: '1px solid hsl(var(--primary) / 0.25)',
          }}
        >
          {value}
          {field.max <= 10 && <span className="opacity-40">/{field.max}</span>}
        </span>
      </div>

      {/* Slider + labels */}
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
            <span className="text-[10px] font-mono text-muted-foreground">
              {field.minLabel}
            </span>
            {/* tick-style fill indicator */}
            <span
              className="text-[10px] font-mono"
              style={{ color: 'hsl(var(--primary) / 0.5)' }}
            >
              {'─'.repeat(Math.round(pct / 14))}●{'─'.repeat(Math.round((100 - pct) / 14))}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {field.maxLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
