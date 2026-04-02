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
    a.download = 'prompt.md'
    a.click()
    URL.revokeObjectURL(url)
  }, [markdown])

  if (!activeTemplateId) return null

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={copy}
        className="inline-flex items-center gap-1.5 px-3 h-7 rounded-md text-[12px] font-medium transition-all cursor-pointer"
        style={
          copied
            ? {
                backgroundColor: 'hsl(var(--primary) / 0.12)',
                border: '1px solid hsl(var(--primary) / 0.3)',
                color: 'hsl(var(--primary))',
              }
            : {
                backgroundColor: 'hsl(var(--primary))',
                border: '1px solid hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
              }
        }
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied' : 'Copy prompt'}
      </button>

      <button
        onClick={download}
        title="Download as .md"
        className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors cursor-pointer"
        style={{
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--muted-foreground))',
          backgroundColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'hsl(var(--foreground))'
          e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <Download size={12} />
      </button>

      <button
        onClick={() => resetTemplate(activeTemplateId)}
        title="Reset to defaults"
        className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors cursor-pointer"
        style={{
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--muted-foreground))',
          backgroundColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'hsl(var(--foreground))'
          e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <RotateCcw size={12} />
      </button>
    </div>
  )
}
