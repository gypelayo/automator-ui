import { create } from 'zustand'

export interface TripConfig {
  // Basics
  destination: string
  origin: string
  departureDate: string
  returnDate: string
  adults: number
  // Preferences
  adventure: number       // 1-10
  beach: number           // 1-10
  culture: number         // 1-10
  food: number            // 1-10
  pace: number            // 1-10
  // Filters
  directOnly: boolean
  maxBudget: string
  flightClass: string
  accommodationStyle: number // 1-5
  activities: string[]
  notes: string
}

const defaults: TripConfig = {
  destination: '',
  origin: '',
  departureDate: '',
  returnDate: '',
  adults: 2,
  adventure: 5,
  beach: 5,
  culture: 5,
  food: 7,
  pace: 5,
  directOnly: false,
  maxBudget: '',
  flightClass: 'Economy',
  accommodationStyle: 3,
  activities: [],
  notes: '',
}

interface TripStore {
  config: TripConfig
  setField: <K extends keyof TripConfig>(key: K, value: TripConfig[K]) => void
  toggleActivity: (activity: string) => void
  reset: () => void
  compile: () => string
}

export const useTripStore = create<TripStore>((set, get) => ({
  config: { ...defaults },

  setField: (key, value) =>
    set((s) => ({ config: { ...s.config, [key]: value } })),

  toggleActivity: (activity) =>
    set((s) => {
      const current = s.config.activities
      const next = current.includes(activity)
        ? current.filter((a) => a !== activity)
        : [...current, activity]
      return { config: { ...s.config, activities: next } }
    }),

  reset: () => set({ config: { ...defaults } }),

  compile: () => {
    const c = get().config
    const lines: string[] = []

    lines.push('# Trip Planner Configuration\n')

    // Objective
    lines.push('## Objective\n')
    if (c.destination) lines.push(`- **Destination**: ${c.destination}`)
    if (c.origin) lines.push(`- **Departing from**: ${c.origin}`)
    if (c.departureDate) lines.push(`- **Departure date**: ${c.departureDate}`)
    if (c.returnDate) lines.push(`- **Return date**: ${c.returnDate}`)
    lines.push(`- **Travelers**: ${c.adults} adult${c.adults !== 1 ? 's' : ''}`)
    lines.push('')

    // Travel preferences
    lines.push('## Travel Preferences\n')
    lines.push(`- **Flight class**: ${c.flightClass}`)
    lines.push(`- **Direct flights only**: ${c.directOnly ? 'Yes' : 'No'}`)
    const accLabels = ['', 'Budget', 'Economy', 'Mid-range', 'Upscale', 'Luxury']
    lines.push(`- **Accommodation tier**: ${accLabels[c.accommodationStyle] ?? c.accommodationStyle}`)
    if (c.maxBudget?.trim()) lines.push(`- **Max total budget**: ${c.maxBudget}`)
    lines.push('')

    // Experience sliders
    lines.push('## Experience Profile\n')
    lines.push(`- **Adventure level**: ${c.adventure}/10 (${c.adventure <= 3 ? 'relaxed' : c.adventure <= 6 ? 'moderate' : 'adventurous'})`)
    lines.push(`- **Beach time**: ${c.beach}/10 (${c.beach <= 3 ? 'minimal' : c.beach <= 6 ? 'some' : 'lots'})`)
    lines.push(`- **Culture & history**: ${c.culture}/10 (${c.culture <= 3 ? 'low priority' : c.culture <= 6 ? 'moderate' : 'high priority'})`)
    lines.push(`- **Food & dining**: ${c.food}/10 (${c.food <= 3 ? 'casual' : c.food <= 6 ? 'moderate' : 'foodie-driven'})`)
    lines.push(`- **Trip pace**: ${c.pace}/10 (${c.pace <= 3 ? 'slow & relaxed' : c.pace <= 6 ? 'moderate' : 'fast-paced'})`)
    if (c.activities.length > 0) lines.push(`- **Preferred activities**: ${c.activities.join(', ')}`)
    lines.push('')

    // Instructions
    lines.push('## Instructions\n')
    lines.push('Search for real-time flight and hotel options. Use the search_flights and search_hotels tools to get actual prices and availability.')
    lines.push('Then produce a concise day-by-day itinerary that incorporates the real options you found.')
    lines.push('For flights, show at least 2-3 alternatives with prices. For hotels, show at least 3 options across different price points.')
    lines.push('Flag any trade-offs (e.g. cheaper flight with a layover, better-located hotel at higher cost).')
    if (c.maxBudget?.trim()) lines.push(`Respect the stated budget of ${c.maxBudget}. Clearly flag if any option exceeds it.`)
    if (c.notes?.trim()) {
      lines.push('')
      lines.push(`**Additional notes**: ${c.notes}`)
    }

    return lines.join('\n')
  },
}))
