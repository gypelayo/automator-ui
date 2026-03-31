import { useRunStore, type FlightOffer, type HotelOffer } from '@/store/run'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Plane, Hotel, CheckCircle2, XCircle,
  Loader2, X, ChevronRight, Star, Clock, StopCircle,
} from 'lucide-react'

// ---- Status feed -----------------------------------------------------------

function StatusFeed({ messages, status }: { messages: string[]; status: string }) {
  return (
    <div className="space-y-1.5">
      {messages.map((msg, i) => {
        const isLast = i === messages.length - 1
        const isDone = status === 'done' || status === 'error'
        return (
          <div key={i} className="flex items-start gap-2.5 text-sm">
            {isLast && !isDone ? (
              <Loader2 size={14} className="mt-0.5 shrink-0 text-primary animate-spin" />
            ) : (
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" />
            )}
            <span className={cn('text-muted-foreground leading-snug', isLast && !isDone && 'text-foreground')}>{msg}</span>
          </div>
        )
      })}
      {status === 'running' && messages.length === 0 && (
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <Loader2 size={14} className="shrink-0 animate-spin text-primary" />
          <span>Connecting to API...</span>
        </div>
      )}
    </div>
  )
}

// ---- Flight card -----------------------------------------------------------

function FlightCard({ flight }: { flight: FlightOffer }) {
  const stops = flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Plane size={14} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{flight.airline}</p>
            <Badge variant="secondary" className="text-[10px] mt-0.5">{stops}</Badge>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-bold text-foreground">
            {flight.currency} {flight.price.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground">per person</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-center shrink-0">
          <p className="text-sm font-bold text-foreground">{flight.departure}</p>
          <p className="text-[11px] text-muted-foreground">{flight.origin}</p>
        </div>
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1 w-full">
            <div className="h-px flex-1 bg-border" />
            <ChevronRight size={12} className="text-muted-foreground shrink-0" />
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock size={10} />
            {flight.duration}
          </div>
        </div>
        <div className="text-center shrink-0">
          <p className="text-sm font-bold text-foreground">{flight.arrival}</p>
          <p className="text-[11px] text-muted-foreground">{flight.destination}</p>
        </div>
      </div>
    </div>
  )
}

// ---- Hotel card ------------------------------------------------------------

function HotelCard({ hotel }: { hotel: HotelOffer }) {
  const nights =
    hotel.checkIn && hotel.checkOut
      ? Math.round(
          (new Date(hotel.checkOut).getTime() - new Date(hotel.checkIn).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Hotel size={14} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug">{hotel.name}</p>
            {hotel.stars != null && (
              <div className="flex items-center gap-0.5 mt-0.5">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                ))}
                {Array.from({ length: Math.max(0, 5 - hotel.stars) }).map((_, i) => (
                  <Star key={i} size={10} className="text-muted-foreground/40" />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-bold text-foreground">
            {hotel.currency} {hotel.pricePerNight.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground">/night</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {hotel.checkIn} → {hotel.checkOut}
          {nights ? ` (${nights} night${nights !== 1 ? 's' : ''})` : ''}
        </span>
        {hotel.totalPrice > 0 && (
          <span className="font-medium text-foreground">
            {hotel.currency} {hotel.totalPrice.toLocaleString()} total
          </span>
        )}
      </div>
    </div>
  )
}

// ---- Day plan (markdown rendered simply) -----------------------------------

function DayPlan({ content }: { content: string }) {
  // Simple markdown-like rendering without a dependency
  const lines = content.split('\n')
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-base font-bold mt-4 mb-1 text-foreground">{line.slice(3)}</h2>
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-sm font-semibold mt-3 mb-0.5 text-foreground">{line.slice(4)}</h3>
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="text-sm font-semibold text-foreground">{line.slice(2, -2)}</p>
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
              <span>{line.slice(2)}</span>
            </div>
          )
        }
        if (line.trim() === '') return <div key={i} className="h-1" />
        return <p key={i} className="text-sm text-muted-foreground leading-relaxed">{line}</p>
      })}
    </div>
  )
}

// ---- Main ResultsPanel -----------------------------------------------------

export function ResultsPanel() {
  const { status, statusMessages, flights, hotels, plan, error, panelOpen, closePanel, reset } =
    useRunStore()

  if (!panelOpen) return null

  const isRunning = status === 'running'
  const isDone = status === 'done'
  const isError = status === 'error'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-30 backdrop-blur-sm"
        onClick={closePanel}
      />

      {/* Slide-in panel */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-xl bg-background border-l border-border z-40 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {isRunning && <Loader2 size={16} className="text-primary animate-spin" />}
            {isDone && <CheckCircle2 size={16} className="text-green-500" />}
            {isError && <XCircle size={16} className="text-destructive" />}
            <h2 className="text-sm font-semibold text-foreground">
              {isRunning ? 'Searching...' : isDone ? 'Results' : isError ? 'Error' : 'Results'}
            </h2>
          </div>
          <button
            onClick={closePanel}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Error state */}
          {isError && error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <div className="flex items-start gap-2">
                <XCircle size={16} className="text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-destructive">Something went wrong</p>
                  <p className="text-xs text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Status feed */}
          {statusMessages.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Progress
              </h3>
              <StatusFeed messages={statusMessages} status={status} />
            </div>
          )}

          {/* Running with no messages yet */}
          {isRunning && statusMessages.length === 0 && (
            <StatusFeed messages={[]} status="running" />
          )}

          {/* Flights */}
          {flights.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Plane size={12} />
                Flights ({flights.length})
              </h3>
              <div className="space-y-3">
                {flights.map((f) => (
                  <FlightCard key={f.id} flight={f} />
                ))}
              </div>
            </div>
          )}

          {/* Hotels */}
          {hotels.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Hotel size={12} />
                Hotels ({hotels.length})
              </h3>
              <div className="space-y-3">
                {hotels.map((h) => (
                  <HotelCard key={h.hotelId} hotel={h} />
                ))}
              </div>
            </div>
          )}

          {/* Day plan */}
          {plan && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Day-by-day plan
              </h3>
              <div className="rounded-lg border border-border bg-card p-4">
                <DayPlan content={plan} />
              </div>
            </div>
          )}

          {/* Empty running state */}
          {isRunning && flights.length === 0 && hotels.length === 0 && statusMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm">Fetching real-time data...</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {(isDone || isError) && (
          <div className="px-5 py-4 border-t border-border shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-muted-foreground"
              onClick={() => { reset() }}
            >
              <StopCircle size={14} />
              Clear & start over
            </Button>
          </div>
        )}
      </aside>
    </>
  )
}
