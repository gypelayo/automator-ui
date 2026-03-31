import { useState } from 'react'
import type { BudgetSplitField, BudgetEntry } from '@automator/core'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

interface BudgetSplitFieldProps {
  field: BudgetSplitField
  value: BudgetEntry[]
  onChange: (value: BudgetEntry[]) => void
}

export function BudgetSplitFieldComponent({ field, value, onChange }: BudgetSplitFieldProps) {
  const [newLabel, setNewLabel] = useState('')
  const [newAmount, setNewAmount] = useState('')

  const add = () => {
    const amount = parseFloat(newAmount)
    if (!newLabel.trim() || isNaN(amount)) return
    onChange([...value, { label: newLabel.trim(), amount }])
    setNewLabel('')
    setNewAmount('')
  }

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updateAmount = (index: number, amount: number) => {
    onChange(value.map((e, i) => (i === index ? { ...e, amount } : e)))
  }

  const total = value.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-foreground">{field.label}</label>
        {field.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
        )}
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-foreground truncate">{entry.label}</span>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={entry.amount}
                  onChange={(e) => updateAmount(i, parseFloat(e.target.value) || 0)}
                  className="w-24 h-7 text-sm"
                />
              </div>
              <button
                onClick={() => remove(i)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <div className="text-xs text-muted-foreground text-right pt-1 border-t border-border">
            Total: <span className="font-medium text-foreground">${total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Label (e.g. Hotel nights 1-3)"
          className="flex-1 h-8 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">$</span>
          <Input
            type="number"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="0"
            className="w-20 h-8 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
        </div>
        <Button size="icon" variant="outline" onClick={add} className="h-8 w-8 shrink-0">
          <Plus size={14} />
        </Button>
      </div>
    </div>
  )
}
