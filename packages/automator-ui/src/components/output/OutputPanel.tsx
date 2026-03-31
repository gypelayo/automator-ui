import { useState, useCallback } from 'react'
import { useConfigStore } from '@/store/config'
import { Copy, Download, Check, RotateCcw } from 'lucide-react'

export function OutputPanel() {
  const [copied, setCopied] = useState(false)
  const { getCompiledMarkdown, activeTemplateId, resetTemplate } = useConfigStore()
  const markdown = getCompiledMarkdown()

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [markdown])

  const download = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'context.md'
    a.click()
    URL.revokeObjectURL(url)
  }, [markdown])

  if (!activeTemplateId) return null

  const btnBase =
    'inline-flex items-center gap-1.5 px-3 h-8 rounded text-xs font-medium transition-colors cursor-pointer border'

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copy}
        className={btnBase}
        style={{
          backgroundColor: copied
            ? 'hsl(var(--primary) / 0.15)'
            : 'hsl(var(--background-2))',
          borderColor: copied
            ? 'hsl(var(--primary) / 0.4)'
            : 'hsl(var(--border))',
          color: copied ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
        }}
      >
        {copied
          ? <Check size={13} />
          : <Copy size={13} />}
        {copied ? 'Copied' : 'Copy'}
      </button>

      <button
        onClick={download}
        className={btnBase}
        style={{
          backgroundColor: 'hsl(var(--background-2))',
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--foreground))',
        }}
      >
        <Download size={13} />
        Export
      </button>

      <button
        onClick={() => resetTemplate(activeTemplateId)}
        title="Reset to defaults"
        className="inline-flex items-center justify-center w-8 h-8 rounded border transition-colors cursor-pointer"
        style={{
          backgroundColor: 'hsl(var(--background-2))',
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--muted-foreground))',
        }}
      >
        <RotateCcw size={13} />
      </button>
    </div>
  )
}
