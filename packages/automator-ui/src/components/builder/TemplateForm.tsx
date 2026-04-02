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
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid hsl(var(--border) / 0.7)' }}>
      {/* Section header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left group"
        style={{ backgroundColor: 'hsl(var(--background-2) / 0.5)' }}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-0.5 h-4 rounded-full shrink-0 transition-colors duration-150"
            style={{ backgroundColor: open ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
          />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground tracking-tight leading-snug">
              {section.title}
            </p>
            {section.description && (
              <p className="text-[11px] text-muted-foreground/70 truncate leading-tight mt-0.5">
                {section.description}
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          size={14}
          className="shrink-0 ml-3 text-muted-foreground/50 transition-transform duration-150"
          style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        />
      </button>

      {/* Fields */}
      {open && (
        <div
          className="border-t"
          style={{ borderColor: 'hsl(var(--border) / 0.7)' }}
        >
          <div className="px-5 py-4 space-y-5">
            {section.fields.map((field, i) => (
              <div
                key={field.id}
                className={cn(i > 0 && 'pt-5 border-t')}
                style={i > 0 ? { borderColor: 'hsl(var(--border) / 0.4)' } : {}}
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
    <div className="space-y-2.5">
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
