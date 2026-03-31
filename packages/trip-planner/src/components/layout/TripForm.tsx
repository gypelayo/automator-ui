import { useTripStore } from '@/store/trip'
import { useRunStore } from '@/store/run'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  Plane, MapPin, Calendar, Users, RefreshCw,
  Sparkles, Leaf, CalendarDays, CalendarRange, Info,
  NotebookPen,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FLIGHT_CLASSES = ['Economy', 'Premium Economy', 'Business', 'First']
const ACC_LABELS = ['', 'Budget', 'Economy', 'Mid-range', 'Upscale', 'Luxury']
const ACTIVITIES = [
  'Hiking', 'Museums', 'Nightlife', 'Shopping',
  'Cooking classes', 'Water sports', 'Wine tasting',
  'Day trips', 'Spas', 'Live music',
]

const FLEXIBLE_EXAMPLES = [
  'Whenever is cheapest in the next 3 months',
  'As many days as possible within $2,000 this summer',
  'Long weekend anytime in April',
  'Any week in June under $1,500 total',
]

// ---------------------------------------------------------------------------
// Small shared primitives
// ---------------------------------------------------------------------------

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
      {children}
    </div>
  )
}

function SectionHeader({
  icon,
  title,
  description,
  accent,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  accent?: string
}) {
  return (
    <div className={cn('flex items-start gap-3 px-5 py-4 border-b border-border', accent)}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

function FieldRow({
  label,
  description,
  children,
  noBorder,
}: {
  label: string
  description?: string
  children: React.ReactNode
  noBorder?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-5 py-3.5',
        !noBorder && 'border-b border-border',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground leading-snug">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function SliderRow({
  label,
  description,
  value,
  min,
  max,
  minLabel,
  maxLabel,
  onChange,
  noBorder,
}: {
  label: string
  description?: string
  value: number
  min: number
  max: number
  minLabel?: string
  maxLabel?: string
  onChange: (v: number) => void
  noBorder?: boolean
}) {
  return (
    <div className={cn('px-5 py-3.5', !noBorder && 'border-b border-border')}>
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <span className="text-sm font-bold text-primary tabular-nums ml-4">{value}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] text-muted-foreground">{minLabel}</span>
          <span className="text-[11px] text-muted-foreground">{maxLabel}</span>
        </div>
      )}
    </div>
  )
}

function PillToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
            value === opt.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export function TripForm() {
  const { config, setField, toggleActivity, reset, isReady } = useTripStore()
  const { startRun, status } = useRunStore()
  const compile = useTripStore((s) => s.compile)

  const running = status === 'running'
  const ready = isReady()

  function handleRun() {
    startRun(compile())
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Where ──────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader
          icon={<MapPin size={15} className="text-primary" />}
          title="Where"
          description="Origin and destination"
        />
        <div className="p-5 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Flying from</label>
            <Input
              placeholder="e.g. New York, JFK"
              value={config.origin}
              onChange={(e) => setField('origin', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Going to</label>
            <Input
              placeholder="e.g. Lisbon, Portugal"
              value={config.destination}
              onChange={(e) => setField('destination', e.target.value)}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── When ──────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader
          icon={<Calendar size={15} className="text-primary" />}
          title="When"
          description="Pick exact dates or describe your flexibility"
        />

        {/* Mode toggle */}
        <div className="px-5 pt-4 pb-3 flex items-center gap-3">
          <PillToggle<'fixed' | 'flexible'>
            options={[
              { label: 'Fixed dates', value: 'fixed' },
              { label: 'Flexible', value: 'flexible' },
            ]}
            value={config.dateMode}
            onChange={(v) => setField('dateMode', v)}
          />
          {config.dateMode === 'flexible' && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Info size={11} /> AI will find the best window
            </span>
          )}
        </div>

        {config.dateMode === 'fixed' ? (
          <div className="px-5 pb-5 grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CalendarDays size={11} /> Departure
              </label>
              <Input
                type="date"
                value={config.departureDate}
                onChange={(e) => setField('departureDate', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CalendarRange size={11} /> Return
              </label>
              <Input
                type="date"
                value={config.returnDate}
                onChange={(e) => setField('returnDate', e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="px-5 pb-5 flex flex-col gap-2">
            <textarea
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              rows={2}
              placeholder={`e.g. "${FLEXIBLE_EXAMPLES[0]}"`}
              value={config.flexibleDates}
              onChange={(e) => setField('flexibleDates', e.target.value)}
            />
            <div className="flex flex-wrap gap-1.5">
              {FLEXIBLE_EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setField('flexibleDates', ex)}
                  className="px-2 py-1 rounded-md text-[11px] border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── Travelers ─────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader
          icon={<Users size={15} className="text-primary" />}
          title="Travelers"
        />
        <div className="px-5 py-4 flex items-center gap-8">
          {(
            [
              { key: 'adults', label: 'Adults', min: 1, max: 9 },
              { key: 'children', label: 'Children', min: 0, max: 9 },
            ] as const
          ).map(({ key, label, min, max }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-16">{label}</span>
              <button
                className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors text-base leading-none"
                onClick={() => setField(key, Math.max(min, (config[key] as number) - 1))}
              >−</button>
              <span className="text-sm font-semibold w-5 text-center tabular-nums">{config[key]}</span>
              <button
                className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors text-base leading-none"
                onClick={() => setField(key, Math.min(max, (config[key] as number) + 1))}
              >+</button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Flights & Stay ────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader
          icon={<Plane size={15} className="text-primary" />}
          title="Flights & Stay"
          description="Class, accommodation tier, and budget"
        />

        {/* Flight class pill selector */}
        <div className="px-5 py-4 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2.5">Flight class</p>
          <div className="flex gap-2 flex-wrap">
            {FLIGHT_CLASSES.map((cls) => (
              <button
                key={cls}
                onClick={() => setField('flightClass', cls)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  config.flightClass === cls
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        <FieldRow label="Direct flights only" description="Avoid layovers even if it costs more">
          <Switch
            checked={config.directOnly}
            onCheckedChange={(v) => setField('directOnly', v)}
          />
        </FieldRow>

        {/* Accommodation slider */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-sm font-medium text-foreground">Accommodation tier</p>
            <span className="text-sm font-bold text-primary">{ACC_LABELS[config.accommodationStyle]}</span>
          </div>
          <Slider
            min={1} max={5} step={1}
            value={[config.accommodationStyle]}
            onValueChange={([v]) => setField('accommodationStyle', v)}
            className="w-full"
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-muted-foreground">Budget</span>
            <span className="text-[11px] text-muted-foreground">Luxury</span>
          </div>
        </div>

        <div className="px-5 py-4">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Max total budget (optional)</label>
          <Input
            placeholder="e.g. $3,000 USD"
            value={config.maxBudget}
            onChange={(e) => setField('maxBudget', e.target.value)}
          />
        </div>
      </SectionCard>

      {/* ── Experience ────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader
          icon={<Sparkles size={15} className="text-primary" />}
          title="Experience"
          description="Shape the vibe of your trip"
        />
        <SliderRow label="Adventure level" value={config.adventure} min={1} max={10} minLabel="Relaxed" maxLabel="Adventurous" onChange={(v) => setField('adventure', v)} />
        <SliderRow label="Beach time" value={config.beach} min={1} max={10} minLabel="None" maxLabel="Every day" onChange={(v) => setField('beach', v)} />
        <SliderRow label="Culture & history" value={config.culture} min={1} max={10} minLabel="Skip it" maxLabel="Priority" onChange={(v) => setField('culture', v)} />
        <SliderRow label="Food & dining" value={config.food} min={1} max={10} minLabel="Casual" maxLabel="Foodie focus" onChange={(v) => setField('food', v)} />
        <SliderRow label="Trip pace" value={config.pace} min={1} max={10} minLabel="Slow & easy" maxLabel="Pack it in" onChange={(v) => setField('pace', v)} noBorder />

        {/* Activities */}
        <div className="px-5 pt-1 pb-5 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mt-4 mb-2.5">Preferred activities</p>
          <div className="flex flex-wrap gap-2">
            {ACTIVITIES.map((a) => (
              <button
                key={a}
                onClick={() => toggleActivity(a)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  config.activities.includes(a)
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                    : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── Sustainability ────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader
          icon={<Leaf size={15} className="text-emerald-600 dark:text-emerald-400" />}
          title="Sustainability"
          description="Carbon footprint and eco travel preferences"
          accent="bg-emerald-50/50 dark:bg-emerald-950/20"
        />
        <FieldRow
          label="Prefer lower-carbon options"
          description="Favour direct flights and flag train alternatives where viable"
        >
          <Switch
            checked={config.prioritiseLowCarbon}
            onCheckedChange={(v) => setField('prioritiseLowCarbon', v)}
          />
        </FieldRow>
        <FieldRow
          label="Show CO₂ estimates"
          description="Include approximate carbon footprint (kg per person) for each flight"
        >
          <Switch
            checked={config.showCarbonEstimate}
            onCheckedChange={(v) => setField('showCarbonEstimate', v)}
          />
        </FieldRow>
        <FieldRow
          label="Include carbon offset cost"
          description="Add estimated offset cost (~$15–20/tonne CO₂) to the total trip price"
        >
          <Switch
            checked={config.offsetCarbon}
            onCheckedChange={(v) => setField('offsetCarbon', v)}
          />
        </FieldRow>
        <FieldRow
          label="Prefer eco-certified hotels"
          description="Prioritise properties with Green Key, EU Ecolabel, or similar certification"
          noBorder
        >
          <Switch
            checked={config.ecoAccommodation}
            onCheckedChange={(v) => setField('ecoAccommodation', v)}
          />
        </FieldRow>
      </SectionCard>

      {/* ── Notes ─────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader
          icon={<NotebookPen size={15} className="text-primary" />}
          title="Notes"
          description="Dietary needs, accessibility, must-sees, things to avoid"
        />
        <div className="p-5">
          <textarea
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            rows={3}
            placeholder="e.g. Vegetarian diet, wheelchair accessible hotels, no beach clubs, must visit Alfama district..."
            value={config.notes}
            onChange={(e) => setField('notes', e.target.value)}
          />
        </div>
      </SectionCard>

      {/* ── Run ───────────────────────────────────────────────── */}
      <div className="flex gap-2 pt-1 pb-8">
        <Button
          className="flex-1 gap-2 h-11 text-sm font-semibold"
          onClick={handleRun}
          disabled={running || !ready}
        >
          {running ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              Searching...
            </>
          ) : (
            <>
              <Plane size={15} />
              Find Flights & Hotels
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={reset}
          title="Reset form"
          className="h-11 w-11 text-muted-foreground shrink-0"
        >
          <RefreshCw size={15} />
        </Button>
      </div>

      {!ready && !running && (
        <p className="text-xs text-muted-foreground text-center -mt-7">
          {!config.origin.trim() || !config.destination.trim()
            ? 'Enter an origin and destination to continue'
            : config.dateMode === 'fixed'
            ? 'Pick a departure date to continue'
            : 'Describe your date flexibility to continue'}
        </p>
      )}
    </div>
  )
}
