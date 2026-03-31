import type { MultiSelectField } from '@/core/types'
import { cn } from '@/lib/utils'

interface MultiSelectFieldProps {
  field: MultiSelectField
  value: string[]
  onChange: (value: string[]) => void
}

export function MultiSelectFieldComponent({ field, value, onChange }: MultiSelectFieldProps) {
  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-foreground">{field.label}</label>
        {field.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {field.options.map((option) => {
          const selected = value.includes(option)
          return (
            <button
              key={option}
              onClick={() => toggle(option)}
              className={cn(
                'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors cursor-pointer',
                selected
                  ? 'bg-primary/10 text-primary ring-primary/30'
                  : 'bg-background text-muted-foreground ring-border hover:bg-muted',
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">{value.length} selected</p>
      )}
    </div>
  )
}
