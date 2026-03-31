import { create } from 'zustand'

// ---------------------------------------------------------------------------
// Date mode: fixed (specific dates) vs flexible (free-text intent)
// ---------------------------------------------------------------------------
export type DateMode = 'fixed' | 'flexible'

export interface TripConfig {
  // Basics
  destination: string
  origin: string
  // Date mode
  dateMode: DateMode
  // Fixed dates
  departureDate: string
  returnDate: string
  // Flexible dates (free-text: "whenever is cheapest in the next month")
  flexibleDates: string
  // Travelers
  adults: number
  children: number
  // Flight
  flightClass: string
  directOnly: boolean
  // Accommodation
  accommodationStyle: number // 1-5
  // Budget
  maxBudget: string
  // Experience sliders 1-10
  adventure: number
  beach: number
  culture: number
  food: number
  pace: number
  // Activities
  activities: string[]
  // Sustainability
  prioritiseLowCarbon: boolean   // prefer trains/direct flights to reduce emissions
  showCarbonEstimate: boolean    // ask the AI to estimate CO₂ per option
  offsetCarbon: boolean          // include carbon offset cost in budget
  ecoAccommodation: boolean      // prefer eco-certified hotels
  // Notes
  notes: string
}

const defaults: TripConfig = {
  destination: '',
  origin: '',
  dateMode: 'fixed',
  departureDate: '',
  returnDate: '',
  flexibleDates: '',
  adults: 2,
  children: 0,
  flightClass: 'Economy',
  directOnly: false,
  accommodationStyle: 3,
  maxBudget: '',
  adventure: 5,
  beach: 5,
  culture: 5,
  food: 7,
  pace: 5,
  activities: [],
  prioritiseLowCarbon: false,
  showCarbonEstimate: true,
  offsetCarbon: false,
  ecoAccommodation: false,
  notes: '',
}

interface TripStore {
  config: TripConfig
  setField: <K extends keyof TripConfig>(key: K, value: TripConfig[K]) => void
  toggleActivity: (activity: string) => void
  reset: () => void
  compile: () => string
  isReady: () => boolean
}

const ACC_LABELS = ['', 'Budget', 'Economy', 'Mid-range', 'Upscale', 'Luxury']

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

  isReady: () => {
    const c = get().config
    if (!c.destination.trim() || !c.origin.trim()) return false
    if (c.dateMode === 'fixed') return !!c.departureDate
    return !!c.flexibleDates.trim()
  },

  compile: () => {
    const c = get().config
    const lines: string[] = []

    lines.push('# Trip Planner Configuration\n')

    // --- Objective ---
    lines.push('## Objective\n')
    lines.push(`- **Destination**: ${c.destination}`)
    lines.push(`- **Departing from**: ${c.origin}`)

    if (c.dateMode === 'fixed') {
      if (c.departureDate) lines.push(`- **Departure date**: ${c.departureDate}`)
      if (c.returnDate) lines.push(`- **Return date**: ${c.returnDate}`)
    } else {
      lines.push(`- **Flexible dates**: ${c.flexibleDates}`)
      lines.push('  (Find the best date combination that fits this constraint — optimise for lowest price and/or longest stay within budget)')
    }

    const travelers = [
      `${c.adults} adult${c.adults !== 1 ? 's' : ''}`,
      c.children > 0 ? `${c.children} child${c.children !== 1 ? 'ren' : ''}` : '',
    ].filter(Boolean).join(', ')
    lines.push(`- **Travelers**: ${travelers}`)
    lines.push('')

    // --- Travel Preferences ---
    lines.push('## Travel Preferences\n')
    lines.push(`- **Flight class**: ${c.flightClass}`)
    lines.push(`- **Direct flights only**: ${c.directOnly ? 'Yes — avoid layovers even at higher cost' : 'No — layovers acceptable if price is significantly lower'}`)
    lines.push(`- **Accommodation tier**: ${ACC_LABELS[c.accommodationStyle] ?? c.accommodationStyle}`)
    if (c.maxBudget?.trim()) lines.push(`- **Max total budget**: ${c.maxBudget}`)
    lines.push('')

    // --- Experience Profile ---
    lines.push('## Experience Profile\n')
    lines.push(`- **Adventure level**: ${c.adventure}/10 (${c.adventure <= 3 ? 'relaxed' : c.adventure <= 6 ? 'moderate' : 'adventurous'})`)
    lines.push(`- **Beach time**: ${c.beach}/10 (${c.beach <= 3 ? 'minimal' : c.beach <= 6 ? 'some' : 'lots'})`)
    lines.push(`- **Culture & history**: ${c.culture}/10 (${c.culture <= 3 ? 'low priority' : c.culture <= 6 ? 'moderate' : 'high priority'})`)
    lines.push(`- **Food & dining**: ${c.food}/10 (${c.food <= 3 ? 'casual' : c.food <= 6 ? 'moderate' : 'foodie-driven'})`)
    lines.push(`- **Trip pace**: ${c.pace}/10 (${c.pace <= 3 ? 'slow & relaxed' : c.pace <= 6 ? 'moderate' : 'fast-paced'})`)
    if (c.activities.length > 0) lines.push(`- **Preferred activities**: ${c.activities.join(', ')}`)
    lines.push('')

    // --- Sustainability ---
    const sustainLines: string[] = []
    if (c.prioritiseLowCarbon) sustainLines.push('- **Prefer lower-carbon options**: Where possible, prefer direct flights over connecting ones, and flag train alternatives if the route is under ~6h by rail. Factor carbon impact into recommendations.')
    if (c.showCarbonEstimate) sustainLines.push('- **Carbon estimates**: Include an approximate CO₂ footprint (kg per person) for each flight option.')
    if (c.offsetCarbon) sustainLines.push('- **Carbon offset**: Include an estimated carbon offset cost (via typical offset schemes ~$15–20/tonne CO₂) in the total trip cost.')
    if (c.ecoAccommodation) sustainLines.push('- **Eco accommodation**: Prefer hotels with recognised sustainability certifications (e.g. Green Key, EU Ecolabel, B Corp). Flag which properties have these.')
    if (sustainLines.length > 0) {
      lines.push('## Sustainability\n')
      lines.push(sustainLines.join('\n'))
      lines.push('')
    }

    // --- Instructions ---
    lines.push('## Instructions\n')
    if (c.dateMode === 'flexible') {
      lines.push('The user has flexible dates. Your first priority is to identify the optimal travel window that maximises value — either lowest total cost, longest possible stay, or best combination of both — within the constraints described.')
    }
    lines.push('Search for real-time flight and hotel options using the available tools.')
    lines.push('Present at least 2-3 flight alternatives and at least 3 hotel options across different price points.')
    lines.push('Flag trade-offs explicitly (e.g. cheaper flight with a long layover, better-located hotel at higher cost).')
    if (c.maxBudget?.trim()) lines.push(`Respect the budget of ${c.maxBudget}. Clearly flag any option that exceeds it.`)
    if (c.notes?.trim()) {
      lines.push('')
      lines.push(`**Additional notes from traveller**: ${c.notes}`)
    }

    return lines.join('\n')
  },
}))
