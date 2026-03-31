import type { TextInputField, TextAreaField } from '@automator/core'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface TextInputFieldProps {
  field: TextInputField
  value: string
  onChange: (value: string) => void
}

export function TextInputFieldComponent({ field, value, onChange }: TextInputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{field.label}</label>
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
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
      <label className="text-sm font-medium text-foreground">{field.label}</label>
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={field.rows ?? 3}
      />
    </div>
  )
}
