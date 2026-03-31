import { useState } from 'react'
import type { SectionSchema, FieldValue, BudgetEntry } from '@automator/core'
import { useConfigStore } from '@/store/config'
import { SliderFieldComponent } from '@/components/fields/SliderField'
import { ToggleFieldComponent } from '@/components/fields/ToggleField'
import { TextInputFieldComponent, TextAreaFieldComponent } from '@/components/fields/TextInputField'
import { MultiSelectFieldComponent } from '@/components/fields/MultiSelectField'
import { SelectFieldComponent } from '@/components/fields/SelectField'
import { BudgetSplitFieldComponent } from '@/components/fields/BudgetSplitField'
import { ChevronDown, ChevronRight } from 'lucide-react'
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
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <div>
          <p className="text-sm font-semibold text-foreground">{section.title}</p>
          {section.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
          )}
        </div>
        {open
          ? <ChevronDown size={16} className="text-muted-foreground shrink-0" />
          : <ChevronRight size={16} className="text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="px-4 py-4 space-y-5 divide-y divide-border/60">
          {section.fields.map((field, i) => (
            <div key={field.id} className={cn(i > 0 && 'pt-5')}>
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
    <div className="space-y-4">
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
