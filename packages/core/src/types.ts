// ---------------------------------------------------------------------------
// Core types for the Automator UI template system
// ---------------------------------------------------------------------------

// --- Field schemas ----------------------------------------------------------

export type SliderField = {
  type: 'slider'
  id: string
  label: string
  description?: string
  min: number
  max: number
  step: number
  default: number
  /** Optional labels for min and max ends */
  minLabel?: string
  maxLabel?: string
}

export type ToggleField = {
  type: 'toggle'
  id: string
  label: string
  description: string
  default: boolean
}

export type TextInputField = {
  type: 'text'
  id: string
  label: string
  description?: string
  placeholder: string
  default: string
}

export type TextAreaField = {
  type: 'textarea'
  id: string
  label: string
  description?: string
  placeholder: string
  default: string
  rows?: number
}

export type MultiSelectField = {
  type: 'multi-select'
  id: string
  label: string
  description?: string
  options: string[]
  default: string[]
}

export type SelectField = {
  type: 'select'
  id: string
  label: string
  description?: string
  options: string[]
  default: string
}

/** Budget entries: each entry is { label, amount } */
export type BudgetEntry = { label: string; amount: number }

export type BudgetSplitField = {
  type: 'budget-split'
  id: string
  label: string
  description?: string
  entries: BudgetEntry[]
  default?: BudgetEntry[]
}

export type FieldSchema =
  | SliderField
  | ToggleField
  | TextInputField
  | TextAreaField
  | MultiSelectField
  | SelectField
  | BudgetSplitField

// --- Section ----------------------------------------------------------------

export type SectionSchema = {
  id: string
  title: string
  description?: string
  fields: FieldSchema[]
}

// --- Template ---------------------------------------------------------------

export type Template = {
  id: string
  name: string
  description: string
  icon?: string
  sections: SectionSchema[]
  /** Compiles the field values into a markdown string */
  render: (values: FieldValues) => string
}

// --- Values -----------------------------------------------------------------

/** Runtime values: keyed by field id */
export type FieldValues = Record<string, FieldValue>

export type FieldValue =
  | number
  | boolean
  | string
  | string[]
  | BudgetEntry[]

// --- Saved config -----------------------------------------------------------

export type SavedConfig = {
  templateId: string
  values: FieldValues
  savedAt: string
}
