import { useRef } from 'react'
import { getAllTemplates as getCoreTemplates, createTemplateRender } from '@automator/core'
import { useConfigStore } from '@/store/config'
import { useTemplateStore } from '@/store/templates'
import { useThemeStore, THEMES } from '@/store/theme'
import { ArrowRight, Plus, Upload, Palette } from 'lucide-react'
import type { Template } from '@automator/core'

export function LandingPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coreTemplates = getCoreTemplates()
  const { templates: customTemplates, addTemplate } = useTemplateStore()
  void customTemplates
  const allTemplates = [...coreTemplates, ...useTemplateStore.getState().getAllTemplates()]
  const { setActiveTemplate, setEditMode } = useConfigStore()
  const { theme, setTheme } = useThemeStore()
  const activeTheme = THEMES.find((t) => t.id === theme) ?? THEMES[0]

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string
        const def = JSON.parse(raw) as Omit<Template, 'render'>
        if (!def.id || !def.name || !Array.isArray(def.sections)) {
          alert('Invalid template file: missing id, name, or sections.')
          return
        }
        const template: Template = { ...def, render: createTemplateRender(def as Template) }
        addTemplate(template)
        setActiveTemplate(template.id)
      } catch {
        alert('Could not parse JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top nav */}
      <nav
        className="flex items-center justify-between px-8 h-14 shrink-0 border-b"
        style={{ borderColor: 'hsl(var(--border) / 0.5)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
            }}
          >
            A
          </div>
          <span className="text-sm font-semibold tracking-tight">Automator</span>
        </div>

        {/* Theme picker */}
        <div className="flex items-center gap-1">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              title={t.name}
              className="w-4 h-4 rounded-full transition-all"
              style={{
                background: t.swatches[1],
                outline: theme === t.id ? `2px solid hsl(var(--primary))` : '2px solid transparent',
                outlineOffset: '1px',
              }}
            />
          ))}
          <Palette size={13} className="ml-2 text-muted-foreground" />
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-16">
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium mb-8 border"
          style={{
            backgroundColor: 'hsl(var(--primary) / 0.08)',
            borderColor: 'hsl(var(--primary) / 0.25)',
            color: 'hsl(var(--primary))',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }} />
          Prompt compiler for AI orchestrators
        </div>

        <h1
          className="text-5xl font-bold tracking-tight leading-[1.1] max-w-xl mb-5"
          style={{ letterSpacing: '-0.03em' }}
        >
          Build better
          <br />
          AI prompts, faster.
        </h1>

        <p className="text-base text-muted-foreground max-w-md leading-relaxed mb-10">
          Pick a template, fill in the fields, get a structured markdown prompt ready to paste into any AI orchestrator.
        </p>

        <div className="flex items-center gap-3">
          {allTemplates[0] && (
            <button
              onClick={() => setActiveTemplate(allTemplates[0].id)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
              }}
            >
              Get started
              <ArrowRight size={15} />
            </button>
          )}
          <button
            onClick={() => setEditMode(true, null)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all border text-muted-foreground hover:text-foreground"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <Plus size={14} />
            New template
          </button>
        </div>
      </section>

      {/* Template grid */}
      <section className="flex-1 px-8 pb-20 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
            Templates
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            <Upload size={11} />
            Import JSON
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTemplate(t.id)}
              className="group text-left rounded-xl p-5 border transition-all duration-150 hover:border-primary/40"
              style={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border) / 0.7)',
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-2xl leading-none">{t.icon ?? '📄'}</span>
                <ArrowRight
                  size={14}
                  className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1 shrink-0"
                />
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug mb-1">{t.name}</p>
              {t.description && (
                <p className="text-[12px] text-muted-foreground leading-snug line-clamp-2">
                  {t.description}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground/40 mt-3">
                {t.sections.length} {t.sections.length === 1 ? 'section' : 'sections'}
              </p>
            </button>
          ))}

          {/* New template card */}
          <button
            onClick={() => setEditMode(true, null)}
            className="text-left rounded-xl p-5 border border-dashed transition-all duration-150 hover:border-primary/40 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 min-h-[140px]"
            style={{ borderColor: 'hsl(var(--border) / 0.5)' }}
          >
            <Plus size={18} className="text-muted-foreground/40" />
            <span className="text-[12px] text-muted-foreground/50 font-medium">New template</span>
          </button>
        </div>
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Footer */}
      <footer
        className="border-t px-8 py-4 flex items-center justify-between"
        style={{ borderColor: 'hsl(var(--border) / 0.4)' }}
      >
        <span className="text-[11px] text-muted-foreground/40">
          Automator — structured prompts for AI orchestrators
        </span>
        <span className="text-[11px] text-muted-foreground/30 flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: activeTheme.swatches[1] }}
          />
          {activeTheme.name}
        </span>
      </footer>
    </div>
  )
}
