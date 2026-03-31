import { useState, useEffect } from 'react'
import { useTemplateStore } from '@/store/templates'
import type { Template, SectionSchema, FieldSchema, FieldValues } from '@automator/core'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  ChevronDown, 
  ChevronRight,
  Save,
  X,
} from 'lucide-react'

type FieldTypeOption = {
  type: FieldSchema['type']
  label: string
}

const FIELD_TYPE_OPTIONS: FieldTypeOption[] = [
  { type: 'text', label: 'Text Input' },
  { type: 'textarea', label: 'Text Area' },
  { type: 'toggle', label: 'Toggle' },
  { type: 'slider', label: 'Slider' },
  { type: 'select', label: 'Select' },
  { type: 'multi-select', label: 'Multi Select' },
  { type: 'budget-split', label: 'Budget Split' },
]

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

interface FieldEditorProps {
  templateId: string
  sectionId: string
  field: FieldSchema
}

function FieldEditor({ templateId, sectionId, field }: FieldEditorProps) {
  const { updateField, deleteField } = useTemplateStore()
  const [expanded, setExpanded] = useState(false)

  const handleUpdate = (updates: Partial<FieldSchema>) => {
    updateField(templateId, sectionId, field.id, updates)
  }

  return (
    <div className="border rounded-lg bg-card">
      <div 
        className="flex items-center gap-2 p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <GripVertical size={14} className="text-muted-foreground" />
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
          {field.type}
        </span>
        <span className="flex-1 text-sm font-medium truncate">{field.label || 'Untitled field'}</span>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </div>

      {expanded && (
        <div className="p-3 pt-0 space-y-3 border-t">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">ID</label>
              <Input 
                value={field.id}
                onChange={(e) => handleUpdate({ id: e.target.value })}
                placeholder="field-id"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Label</label>
              <Input 
                value={field.label}
                onChange={(e) => handleUpdate({ label: e.target.value })}
                placeholder="Field label"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Input 
              value={field.description || ''}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              placeholder="Help text for this field"
            />
          </div>

          {field.type === 'text' || field.type === 'textarea' ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Placeholder</label>
                <Input 
                  value={field.placeholder}
                  onChange={(e) => handleUpdate({ placeholder: e.target.value })}
                  placeholder="Placeholder text"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Default Value</label>
                <Input 
                  value={field.default as string}
                  onChange={(e) => handleUpdate({ default: e.target.value })}
                  placeholder="Default value"
                />
              </div>
              {field.type === 'textarea' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Rows</label>
                  <Input 
                    type="number"
                    value={field.rows || 3}
                    onChange={(e) => handleUpdate({ rows: parseInt(e.target.value) || 3 })}
                  />
                </div>
              )}
            </div>
          ) : null}

          {field.type === 'toggle' && (
            <div className="flex items-center gap-2">
              <Switch 
                checked={field.default as boolean}
                onCheckedChange={(checked) => handleUpdate({ default: checked })}
              />
              <span className="text-sm">Default: {field.default ? 'On' : 'Off'}</span>
            </div>
          )}

          {field.type === 'slider' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Min</label>
                <Input 
                  type="number"
                  value={field.min}
                  onChange={(e) => handleUpdate({ min: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Max</label>
                <Input 
                  type="number"
                  value={field.max}
                  onChange={(e) => handleUpdate({ max: parseInt(e.target.value) || 100 })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Step</label>
                <Input 
                  type="number"
                  value={field.step}
                  onChange={(e) => handleUpdate({ step: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Default</label>
                <Input 
                  type="number"
                  value={field.default as number}
                  onChange={(e) => handleUpdate({ default: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Min Label</label>
                <Input 
                  value={field.minLabel || ''}
                  onChange={(e) => handleUpdate({ minLabel: e.target.value })}
                  placeholder="e.g. Low"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Max Label</label>
                <Input 
                  value={field.maxLabel || ''}
                  onChange={(e) => handleUpdate({ maxLabel: e.target.value })}
                  placeholder="e.g. High"
                />
              </div>
            </div>
          )}

          {field.type === 'select' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Options (comma-separated)</label>
                <Input 
                  value={field.options.join(', ')}
                  onChange={(e) => handleUpdate({ 
                    options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                  })}
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Default</label>
                <Input 
                  value={field.default as string}
                  onChange={(e) => handleUpdate({ default: e.target.value })}
                  placeholder="Default option"
                />
              </div>
            </>
          )}

          {field.type === 'multi-select' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Options (comma-separated)</label>
                <Input 
                  value={field.options.join(', ')}
                  onChange={(e) => handleUpdate({ 
                    options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                  })}
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Default (comma-separated)</label>
                <Input 
                  value={(field.default as string[]).join(', ')}
                  onChange={(e) => handleUpdate({ 
                    default: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                  })}
                  placeholder="Default 1, Default 2"
                />
              </div>
            </>
          )}

          {field.type === 'budget-split' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Budget entries will be set at runtime</label>
              <p className="text-xs text-muted-foreground">Leave entries empty - users will configure budget categories when using the template.</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => deleteField(templateId, sectionId, field.id)}
            >
              <Trash2 size={14} className="mr-1" /> Delete Field
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

interface SectionEditorProps {
  templateId: string
  section: SectionSchema
}

function SectionEditor({ templateId, section }: SectionEditorProps) {
  const { addField, deleteSection, updateSection } = useTemplateStore()
  const [expanded, setExpanded] = useState(true)
  const [showAddField, setShowAddField] = useState(false)
  const [newFieldType, setNewFieldType] = useState<FieldSchema['type']>('text')

  const handleAddField = () => {
    const baseField: Partial<FieldSchema> = {
      id: generateId(),
      label: 'New Field',
    }

    switch (newFieldType) {
      case 'text':
        Object.assign(baseField, { type: 'text', placeholder: '', default: '' })
        break
      case 'textarea':
        Object.assign(baseField, { type: 'textarea', placeholder: '', default: '', rows: 3 })
        break
      case 'toggle':
        Object.assign(baseField, { type: 'toggle', description: '', default: false })
        break
      case 'slider':
        Object.assign(baseField, { type: 'slider', min: 0, max: 10, step: 1, default: 5 })
        break
      case 'select':
        Object.assign(baseField, { type: 'select', options: ['Option 1'], default: 'Option 1' })
        break
      case 'multi-select':
        Object.assign(baseField, { type: 'multi-select', options: ['Option 1'], default: [] })
        break
      case 'budget-split':
        Object.assign(baseField, { type: 'budget-split', entries: [] })
        break
    }

    addField(templateId, section.id, baseField as FieldSchema)
    setShowAddField(false)
  }

  return (
    <div className="border rounded-lg bg-card mb-4">
      <div 
        className="flex items-center gap-2 p-3 cursor-pointer bg-muted/30 rounded-t-lg"
        onClick={() => setExpanded(!expanded)}
      >
        <GripVertical size={14} className="text-muted-foreground" />
        <span className="flex-1 font-medium">{section.title || 'Untitled Section'}</span>
        <span className="text-xs text-muted-foreground">{section.fields.length} fields</span>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </div>

      {expanded && (
        <div className="p-3 space-y-3 border-t">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Section ID</label>
              <Input 
                value={section.id}
                onChange={(e) => updateSection(templateId, section.id, { id: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <Input 
                value={section.title}
                onChange={(e) => updateSection(templateId, section.id, { title: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Input 
              value={section.description || ''}
              onChange={(e) => updateSection(templateId, section.id, { description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Fields</label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddField(!showAddField)}
              >
                <Plus size={14} className="mr-1" /> Add Field
              </Button>
            </div>

            {showAddField && (
              <div className="flex gap-2 p-2 bg-muted/30 rounded">
                <select 
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as FieldSchema['type'])}
                  className="flex-1 px-2 py-1 text-sm border rounded bg-background"
                >
                  {FIELD_TYPE_OPTIONS.map(opt => (
                    <option key={opt.type} value={opt.type}>{opt.label}</option>
                  ))}
                </select>
                <Button size="sm" onClick={handleAddField}>Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddField(false)}>
                  <X size={14} />
                </Button>
              </div>
            )}

            {section.fields.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No fields yet. Add one to get started.</p>
            ) : (
              <div className="space-y-2">
                {section.fields.map(field => (
                  <FieldEditor 
                    key={field.id}
                    templateId={templateId}
                    sectionId={section.id}
                    field={field}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => deleteSection(templateId, section.id)}
            >
              <Trash2 size={14} className="mr-1" /> Delete Section
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

interface TemplateBuilderProps {
  templateId?: string
  onSave: () => void
  onCancel: () => void
}

export function TemplateBuilder({ templateId, onSave, onCancel }: TemplateBuilderProps) {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplateStore()
  
  const existingTemplate = templateId ? templates.find(t => t.id === templateId) : null
  const [name, setName] = useState(existingTemplate?.name || 'New Template')
  const [description, setDescription] = useState(existingTemplate?.description || '')
  const [icon, setIcon] = useState(existingTemplate?.icon || '📝')
  const [sections, setSections] = useState<SectionSchema[]>(existingTemplate?.sections || [])

  // Sync sections from store when editing existing template
  useEffect(() => {
    if (existingTemplate) {
      setSections(existingTemplate.sections)
    }
  }, [existingTemplate?.sections])

  const handleSave = () => {
    const id = templateId || `custom-${generateId()}`
    const render = (values: FieldValues): string => {
      const lines: string[] = []
      lines.push(`# ${name}\n`)
      if (description) lines.push(`${description}\n`)
      
      for (const section of sections) {
        if (section.fields.length === 0) continue
        
        lines.push(`## ${section.title}\n`)
        for (const field of section.fields) {
          const value = values[field.id]
          if (value === undefined) continue
          
          switch (field.type) {
            case 'text':
            case 'textarea':
              if (String(value).trim()) {
                lines.push(`- **${field.label}**: ${value}`)
              }
              break
            case 'toggle':
              lines.push(`- **${field.label}**: ${value ? 'Yes' : 'No'}`)
              break
            case 'slider':
              lines.push(`- **${field.label}**: ${value}`)
              break
            case 'select':
              lines.push(`- **${field.label}**: ${value}`)
              break
            case 'multi-select':
              lines.push(`- **${field.label}**: ${(value as string[]).join(', ')}`)
              break
          }
        }
        lines.push('')
      }
      return lines.join('\n')
    }

    const template: Template = {
      id,
      name,
      description,
      icon,
      sections,
      render,
    }

    if (templateId) {
      updateTemplate(templateId, { name, description, icon, sections })
    } else {
      addTemplate(template)
    }

    onSave()
  }

  const handleAddSection = () => {
    const newSection: SectionSchema = {
      id: generateId(),
      title: 'New Section',
      description: '',
      fields: [],
    }
    setSections([...sections, newSection])
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X size={14} className="mr-1" /> Cancel
          </Button>
          <h1 className="text-lg font-semibold">
            {templateId ? 'Edit Template' : 'Create New Template'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={() => {
            if (templateId) {
              deleteTemplate(templateId)
              onCancel()
            }
          }}>
            <Trash2 size={14} className="mr-1" /> Delete Template
          </Button>
          <Button onClick={handleSave}>
            <Save size={14} className="mr-1" /> Save Template
          </Button>
        </div>
      </div>

      <div className="space-y-4 p-4 border rounded-lg bg-card">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Icon</label>
            <Input 
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="📝"
              className="w-16 text-center"
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Template Name</label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Template"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <Textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this template is for..."
            rows={2}
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Sections</h2>
          <Button variant="outline" size="sm" onClick={handleAddSection}>
            <Plus size={14} className="mr-1" /> Add Section
          </Button>
        </div>

        {sections.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground text-sm">No sections yet. Add one to get started.</p>
            <Button className="mt-2" onClick={handleAddSection}>
              <Plus size={14} className="mr-1" /> Add First Section
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {sections.map(section => (
              <SectionEditor 
                key={section.id}
                templateId={templateId || 'new'}
                section={section}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
