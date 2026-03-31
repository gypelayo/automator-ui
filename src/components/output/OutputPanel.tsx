import { useState, useCallback } from 'react'
import { useConfigStore } from '@/store/config'
import { Button } from '@/components/ui/button'
import { Copy, Download, FolderOpen, Check, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

type Tab = 'preview' | 'raw'

export function OutputPanel() {
  const [tab, setTab] = useState<Tab>('preview')
  const [copied, setCopied] = useState(false)
  const [filePath, setFilePath] = useState('')
  const [writeStatus, setWriteStatus] = useState<'idle' | 'success' | 'error'>('idle')

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

  const writeToFile = useCallback(async () => {
    if (!filePath.trim()) return
    try {
      // Use the File System Access API
      const handle = await (window as Window & typeof globalThis & {
        showSaveFilePicker?: (opts: object) => Promise<FileSystemFileHandle>
      }).showSaveFilePicker?.({
        suggestedName: filePath.split('/').pop() ?? 'context.md',
        types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }],
      })
      if (!handle) return
      const writable = await handle.createWritable()
      await writable.write(markdown)
      await writable.close()
      setWriteStatus('success')
      setTimeout(() => setWriteStatus('idle'), 2000)
    } catch {
      // User cancelled or API not supported — fall back to download
      download()
    }
  }, [markdown, filePath, download])

  if (!activeTemplateId) return null

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-border">
        {(['preview', 'raw'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t === 'preview' ? 'Preview' : 'Raw'}
          </button>
        ))}
        <div className="ml-auto mb-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => activeTemplateId && resetTemplate(activeTemplateId)}
            className="h-7 text-xs text-muted-foreground gap-1.5"
          >
            <RefreshCw size={12} />
            Reset
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'preview' ? (
          <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none px-5 py-4">
            <ReactMarkdown>{markdown || '_Nothing to preview yet. Configure a template._'}</ReactMarkdown>
          </div>
        ) : (
          <pre className="px-5 py-4 text-xs font-mono text-foreground whitespace-pre-wrap break-words leading-relaxed">
            {markdown || '# No content yet'}
          </pre>
        )}
      </div>

      {/* Export bar */}
      <div className="border-t border-border px-4 py-3 space-y-3 bg-muted/20">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={copy} className="gap-1.5">
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button size="sm" variant="outline" onClick={download} className="gap-1.5">
            <Download size={13} />
            Download
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          <input
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="File path hint (optional)"
            className={cn(
              'flex-1 h-8 rounded-md border border-input bg-background px-3 text-xs',
              'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            )}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={writeToFile}
            className={cn(
              'gap-1.5 shrink-0',
              writeStatus === 'success' && 'text-green-500 border-green-500/30',
              writeStatus === 'error' && 'text-destructive border-destructive/30',
            )}
          >
            {writeStatus === 'success'
              ? <Check size={13} />
              : <FolderOpen size={13} />}
            {writeStatus === 'success' ? 'Saved' : 'Save to file'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          "Save to file" uses the browser File System API to write directly to disk.
        </p>
      </div>
    </div>
  )
}
