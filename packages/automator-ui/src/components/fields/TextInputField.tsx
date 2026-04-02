import type React from 'react'
import type { TextInputField, TextAreaField } from '@automator/core'

const inputBase: React.CSSProperties = {
  display: 'flex',
  width: '100%',
  borderRadius: 'var(--radius)',
  border: '1px solid hsl(var(--border))',
  backgroundColor: 'hsl(var(--background))',
  color: 'hsl(var(--foreground))',
  padding: '0.4rem 0.6rem',
  fontSize: '0.8125rem',
  lineHeight: '1.5',
  outline: 'none',
  transition: 'border-color 0.12s, box-shadow 0.12s',
  fontFamily: 'inherit',
}

interface TextInputFieldProps {
  field: TextInputField
  value: string
  onChange: (value: string) => void
}

export function TextInputFieldComponent({ field, value, onChange }: TextInputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium text-foreground">{field.label}</label>
      {field.description && (
        <p className="text-[11px] text-muted-foreground/70">{field.description}</p>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        style={inputBase}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--ring))'
          e.currentTarget.style.boxShadow = '0 0 0 3px hsl(var(--ring) / 0.15)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--border))'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}

interface TextAreaFieldProps {
  field: TextAreaField
  value: string
  onChange: (value: string) => void
}

export function TextAreaFieldComponent({ field, value, onChange }: TextAreaFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium text-foreground">{field.label}</label>
      {field.description && (
        <p className="text-[11px] text-muted-foreground/70">{field.description}</p>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={field.rows ?? 3}
        style={{
          ...inputBase,
          resize: 'vertical',
          minHeight: '5rem',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--ring))'
          e.currentTarget.style.boxShadow = '0 0 0 3px hsl(var(--ring) / 0.15)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--border))'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}
