import { useState } from 'react'
import type { SectionSchema, FieldValue, BudgetEntry } from '@automator/core'
import { useConfigStore } from '@/store/config'
import { SliderFieldComponent } from '@/components/fields/SliderField'
import { ToggleFieldComponent } from '@/components/fields/ToggleField'
import { TextInputFieldComponent, TextAreaFieldComponent } from '@/components/fields/TextInputField'
import { MultiSelectFieldComponent } from '@/components/fields/MultiSelectField'
import { SelectFieldComponent } from '@/components/fields/SelectField'
import { BudgetSplitFieldComponent } from '@/components/fields/BudgetSplitField'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionGroupProps {
  section: SectionSchema
  templateId: string
  values: Record<string, FieldValue>
}

function SectionGroup({ section, templateId, values }: SectionGroupProps) {
  const [open, setOpen] = useState(true)
  const { setFieldValue } = useConfigStore()

  const setValue = (fieldId: string, value: FieldValue) => {
    setFieldValue(templateId, fieldId, value)
  }

  return (
    <div
      className="rounded-lg overflow-hidden border"
      style={{
        borderColor: 'hsl(var(--border))',
        backgroundColor: 'hsl(var(--card))',
      }}
    >
      {/* Section header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-accent/40 group"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Accent bar */}
          <span
            className="w-1 h-5 rounded-full shrink-0"
            style={{
              backgroundColor: open ? 'hsl(var(--primary))' : 'hsl(var(--border))',
              transition: 'background-color 0.15s',
            }}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground tracking-tight">
              {section.title}
            </p>
            {section.description && (
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {section.description}
              </p>
            )}
          </div>
        </div>
        <span className="text-muted-foreground shrink-0 ml-2 transition-transform duration-150" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          <ChevronDown size={15} />
        </span>
      </button>

      {/* Fields */}
      {open && (
        <div
          className="border-t"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          <div className="px-5 py-4 space-y-5">
            {section.fields.map((field, i) => (
              <div
                key={field.id}
                className={cn(
                  i > 0 && 'pt-5 border-t',
                )}
                style={i > 0 ? { borderColor: 'hsl(var(--border) / 0.5)' } : {}}
              >
                {field.type === 'slider' && (
                  <SliderFieldComponent
                    field={field}
                    value={(values[field.id] as number) ?? field.default}
                    onChange={(v) => setValue(field.id, v)}
                  />
                )}
                {field.type === 'toggle' && (
                  <ToggleFieldComponent
                    field={field}
                    value={(values[field.id] as boolean) ?? field.default}
                    onChange={(v) => setValue(field.id, v)}
                  />
                )}
                {field.type === 'text' && (
                  <TextInputFieldComponent
                    field={field}
                    value={(values[field.id] as string) ?? field.default}
                    onChange={(v) => setValue(field.id, v)}
                  />
                )}
                {field.type === 'textarea' && (
                  <TextAreaFieldComponent
                    field={field}
                    value={(values[field.id] as string) ?? field.default}
                    onChange={(v) => setValue(field.id, v)}
                  />
                )}
                {field.type === 'multi-select' && (
                  <MultiSelectFieldComponent
                    field={field}
                    value={(values[field.id] as string[]) ?? field.default}
                    onChange={(v) => setValue(field.id, v)}
                  />
                )}
                {field.type === 'select' && (
                  <SelectFieldComponent
                    field={field}
                    value={(values[field.id] as string) ?? field.default}
                    onChange={(v) => setValue(field.id, v)}
                  />
                )}
                {field.type === 'budget-split' && (
                  <BudgetSplitFieldComponent
                    field={field}
                    value={(values[field.id] as BudgetEntry[]) ?? []}
                    onChange={(v) => setValue(field.id, v)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface TemplateFormProps {
  sections: SectionSchema[]
  templateId: string
}

export function TemplateForm({ sections, templateId }: TemplateFormProps) {
  const { templateValues } = useConfigStore()
  const values = (templateValues[templateId] ?? {}) as Record<string, FieldValue>

  return (
    <div className="space-y-3">
      {sections.map((sec) => (
        <SectionGroup
          key={sec.id}
          section={sec}
          templateId={templateId}
          values={values}
        />
      ))}
    </div>
  )
}
