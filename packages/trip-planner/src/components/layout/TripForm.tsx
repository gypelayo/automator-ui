import { useTripStore } from '@/store/trip'
import { useRunStore } from '@/store/run'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { Plane, Hotel, MapPin, Calendar, Users, Play, RefreshCw, Sparkles } from 'lucide-react'

const FLIGHT_CLASSES = ['Economy', 'Premium Economy', 'Business', 'First']
const ACC_LABELS = ['', 'Budget', 'Economy', 'Mid-range', 'Upscale', 'Luxury']
const ACTIVITIES = [
  'Hiking', 'Museums', 'Nightlife', 'Shopping',
  'Cooking classes', 'Water sports', 'Wine tasting',
  'Day trips', 'Spas', 'Live music',
]

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="mt-0.5 text-primary shrink-0">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

function FieldRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground leading-snug">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function SliderField({
  label,
  description,
  value,
  min,
  max,
  minLabel,
  maxLabel,
  onChange,
}: {
  label: string
  description?: string
  value: number
  min: number
  max: number
  minLabel?: string
  maxLabel?: string
  onChange: (v: number) => void
}) {
  return (
    <div className="py-3 border-b border-border last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <span className="text-sm font-semibold text-primary tabular-nums">{value}</span>
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
          {minLabel && <span className="text-[11px] text-muted-foreground">{minLabel}</span>}
          {maxLabel && <span className="text-[11px] text-muted-foreground">{maxLabel}</span>}
        </div>
      )}
    </div>
  )
}

export function TripForm() {
  const { config, setField, toggleActivity, reset } = useTripStore()
  const { startRun, status, compile } = { ...useRunStore(), compile: useTripStore((s) => s.compile) }

  const running = status === 'running'

  function handleRun() {
    const md = compile()
    startRun(md)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Section: Where & When */}
      <div className="rounded-lg border border-border bg-card p-5">
        <SectionHeader
          icon={<MapPin size={16} />}
          title="Where & When"
          description="Your destination and travel dates"
        />
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Destination</label>
              <Input
                placeholder="e.g. Lisbon, Portugal"
                value={config.destination}
                onChange={(e) => setField('destination', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Departing from</label>
              <Input
                placeholder="e.g. New York, JFK"
                value={config.origin}
                onChange={(e) => setField('origin', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar size={12} /> Departure date
              </label>
              <Input
                type="date"
                value={config.departureDate}
                onChange={(e) => setField('departureDate', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar size={12} /> Return date
              </label>
              <Input
                type="date"
                value={config.returnDate}
                onChange={(e) => setField('returnDate', e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Users size={12} /> Adults
            </label>
            <div className="flex items-center gap-3">
              <button
                className="w-8 h-8 rounded-md border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors text-sm"
                onClick={() => setField('adults', Math.max(1, config.adults - 1))}
              >−</button>
              <span className="text-sm font-semibold w-6 text-center tabular-nums">{config.adults}</span>
              <button
                className="w-8 h-8 rounded-md border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors text-sm"
                onClick={() => setField('adults', Math.min(9, config.adults + 1))}
              >+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Flights & Stay */}
      <div className="rounded-lg border border-border bg-card p-5">
        <SectionHeader
          icon={<Plane size={16} />}
          title="Flights & Stay"
          description="Travel class, accommodation tier, and budget"
        />
        <div>
          <FieldRow label="Flight class">
            <div className="flex gap-1.5 flex-wrap justify-end">
              {FLIGHT_CLASSES.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setField('flightClass', cls)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
                    config.flightClass === cls
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  {cls}
                </button>
              ))}
            </div>
          </FieldRow>
          <FieldRow label="Direct flights only" description="Avoid layovers even if it costs more">
            <Switch
              checked={config.directOnly}
              onCheckedChange={(v) => setField('directOnly', v)}
            />
          </FieldRow>
          <div className="py-3 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-foreground">Accommodation tier</p>
              </div>
              <span className="text-sm font-semibold text-primary">{ACC_LABELS[config.accommodationStyle]}</span>
            </div>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[config.accommodationStyle]}
              onValueChange={([v]) => setField('accommodationStyle', v)}
              className="w-full"
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[11px] text-muted-foreground">Budget</span>
              <span className="text-[11px] text-muted-foreground">Luxury</span>
            </div>
          </div>
          <div className="py-3">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
              Max total budget (optional)
            </label>
            <Input
              placeholder="e.g. $3,000 USD"
              value={config.maxBudget}
              onChange={(e) => setField('maxBudget', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Section: Experience */}
      <div className="rounded-lg border border-border bg-card p-5">
        <SectionHeader
          icon={<Sparkles size={16} />}
          title="Experience"
          description="Shape your ideal trip"
        />
        <div>
          <SliderField
            label="Adventure level"
            value={config.adventure}
            min={1} max={10}
            minLabel="Relaxed"
            maxLabel="Adventurous"
            onChange={(v) => setField('adventure', v)}
          />
          <SliderField
            label="Beach time"
            value={config.beach}
            min={1} max={10}
            minLabel="None"
            maxLabel="Every day"
            onChange={(v) => setField('beach', v)}
          />
          <SliderField
            label="Culture & history"
            value={config.culture}
            min={1} max={10}
            minLabel="Skip it"
            maxLabel="Priority"
            onChange={(v) => setField('culture', v)}
          />
          <SliderField
            label="Food & dining"
            value={config.food}
            min={1} max={10}
            minLabel="Casual"
            maxLabel="Foodie focus"
            onChange={(v) => setField('food', v)}
          />
          <SliderField
            label="Trip pace"
            value={config.pace}
            min={1} max={10}
            minLabel="Slow & easy"
            maxLabel="Pack it in"
            onChange={(v) => setField('pace', v)}
          />

          {/* Activities */}
          <div className="pt-3">
            <p className="text-sm font-medium text-foreground mb-2">Preferred activities</p>
            <div className="flex flex-wrap gap-2">
              {ACTIVITIES.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleActivity(a)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                    config.activities.includes(a)
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section: Notes */}
      <div className="rounded-lg border border-border bg-card p-5">
        <SectionHeader
          icon={<Hotel size={16} />}
          title="Notes"
          description="Dietary needs, accessibility, things to avoid..."
        />
        <textarea
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          rows={3}
          placeholder="Any dietary restrictions, accessibility needs, must-see places, or things to avoid..."
          value={config.notes}
          onChange={(e) => setField('notes', e.target.value)}
        />
      </div>

      {/* Run + Reset actions */}
      <div className="flex gap-3">
        <Button
          className="flex-1 gap-2"
          onClick={handleRun}
          disabled={running || !config.destination.trim() || !config.origin.trim() || !config.departureDate}
        >
          {running ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              Running...
            </>
          ) : (
            <>
              <Play size={14} />
              Find Flights & Hotels
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          title="Reset form"
          className="text-muted-foreground"
        >
          <RefreshCw size={15} />
        </Button>
      </div>

      {/* Hint about required fields */}
      {(!config.destination.trim() || !config.origin.trim() || !config.departureDate) && (
        <p className="text-xs text-muted-foreground text-center -mt-3">
          Fill in destination, origin, and departure date to run
        </p>
      )}
    </div>
  )
}
