import type { MultiSelectField } from '@automator/core'
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
          <p className="text-[11px] text-muted-foreground mt-0.5">{field.description}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {field.options.map((option) => {
          const selected = value.includes(option)
          return (
            <button
              key={option}
              onClick={() => toggle(option)}
              className={cn(
                'inline-flex items-center rounded px-2.5 py-1 text-xs font-medium transition-all duration-100 cursor-pointer',
                'border',
              )}
              style={
                selected
                  ? {
                      backgroundColor: 'hsl(var(--primary) / 0.15)',
                      borderColor: 'hsl(var(--primary) / 0.5)',
                      color: 'hsl(var(--primary))',
                    }
                  : {
                      backgroundColor: 'hsl(var(--background-2))',
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--muted-foreground))',
                    }
              }
            >
              {option}
            </button>
          )
        })}
      </div>
      {value.length > 0 && (
        <p className="text-[10px] font-mono text-muted-foreground">
          {value.length} selected: {value.join(', ')}
        </p>
      )}
    </div>
  )
}
