import type { SelectField } from '@automator/core'

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
        <p className="text-[11px] text-muted-foreground">{field.description}</p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          display: 'flex',
          width: '100%',
          borderRadius: 'var(--radius)',
          border: '1px solid hsl(var(--border))',
          backgroundColor: 'hsl(var(--background-2))',
          color: 'hsl(var(--foreground))',
          padding: '0.4rem 0.625rem',
          fontSize: '0.8125rem',
          lineHeight: '1.5',
          outline: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          appearance: 'auto',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--ring))'
          e.currentTarget.style.boxShadow = '0 0 0 2px hsl(var(--ring) / 0.2)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--border))'
          e.currentTarget.style.boxShadow = 'none'
        }}
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
