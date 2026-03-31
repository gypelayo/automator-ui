import { useState, useCallback } from 'react'
import { useConfigStore } from '@/store/config'
import { Button } from '@/components/ui/button'
import { Copy, Download, Check, RefreshCw } from 'lucide-react'

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

  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      <div className="flex gap-2">
        <Button variant="outline" onClick={copy} className="gap-2 flex-1">
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button variant="outline" onClick={download} className="gap-2 flex-1">
          <Download size={14} />
          Download
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => resetTemplate(activeTemplateId)}
        className="gap-2 text-muted-foreground w-full"
      >
        <RefreshCw size={13} />
        Reset to defaults
      </Button>
    </div>
  )
}
