import type { SelectField } from '@automator/core'
import { cn } from '@/lib/utils'

interface SelectFieldProps {
  field: SelectField
  value: string
  onChange: (value: string) => void
}

export function SelectFieldComponent({ field, value, onChange }: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{field.label}</label>
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        {field.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
