import type { Template, FieldValues } from '@automator/core'
import { section } from '@automator/core'

const ACC_LABELS = ['', 'Budget', 'Economy', 'Mid-range', 'Upscale', 'Luxury']

export const travelTemplate: Template = {
  id: 'travel-planner',
  name: 'Travel Planner',
  description: 'Configure an orchestrator to plan a trip end-to-end',
  icon: '✈️',
  sections: [
    {
      id: 'destination',
      title: 'Destination',
      description: 'Where you are going and when',
      fields: [
        {
          type: 'text',
          id: 'destination',
          label: 'Destination',
          placeholder: 'e.g. Lisbon, Portugal',
          default: '',
        },
        {
          type: 'text',
          id: 'origin',
          label: 'Departing from',
          placeholder: 'e.g. New York, JFK',
          default: '',
        },
        {
          type: 'select',
          id: 'date_mode',
          label: 'Date flexibility',
          description: 'Fixed: you have specific dates. Flexible: you want the AI to find the best window.',
          options: ['Fixed dates', 'Flexible dates'],
          default: 'Fixed dates',
        },
        {
          type: 'text',
          id: 'departure_date',
          label: 'Departure date',
          placeholder: 'e.g. 2025-06-10',
          default: '',
        },
        {
          type: 'text',
          id: 'return_date',
          label: 'Return date',
          placeholder: 'e.g. 2025-06-18',
          default: '',
        },
        {
          type: 'textarea',
          id: 'flexible_dates',
          label: 'Flexible date intent',
          description: 'Only used when Date flexibility is set to "Flexible dates"',
          placeholder: 'e.g. Whenever is cheapest in the next 2 months, ideally 7–10 days',
          default: '',
          rows: 2,
        },
      ],
    },
    {
      id: 'travelers',
      title: 'Travelers',
      description: 'Who is coming on this trip',
      fields: [
        {
          type: 'slider',
          id: 'adults',
          label: 'Adults',
          min: 1,
          max: 10,
          step: 1,
          default: 2,
          minLabel: '1',
          maxLabel: '10',
        },
        {
          type: 'slider',
          id: 'children',
          label: 'Children',
          description: 'Under 18',
          min: 0,
          max: 8,
          step: 1,
          default: 0,
          minLabel: '0',
          maxLabel: '8',
        },
      ],
    },
    {
      id: 'travel',
      title: 'Getting There',
      description: 'How you want to travel to the destination',
      fields: [
        {
          type: 'select',
          id: 'flight_class',
          label: 'Flight class',
          options: ['Economy', 'Premium Economy', 'Business', 'First'],
          default: 'Economy',
        },
        {
          type: 'toggle',
          id: 'direct_only',
          label: 'Direct flights only',
          description: 'Avoid layovers even if it costs more',
          default: false,
        },
      ],
    },
    {
      id: 'accommodation',
      title: 'Accommodation',
      description: 'Where you want to stay',
      fields: [
        {
          type: 'slider',
          id: 'accommodation_style',
          label: 'Accommodation tier',
          description: 'From budget to luxury',
          min: 1,
          max: 5,
          step: 1,
          default: 3,
          minLabel: 'Budget',
          maxLabel: 'Luxury',
        },
      ],
    },
    {
      id: 'budget',
      title: 'Budget',
      fields: [
        {
          type: 'text',
          id: 'max_budget',
          label: 'Max total budget',
          placeholder: 'e.g. $3,000 USD',
          default: '',
        },
      ],
    },
    {
      id: 'experience',
      title: 'Experience',
      description: 'What kind of trip you want',
      fields: [
        {
          type: 'slider',
          id: 'adventure',
          label: 'Adventure level',
          min: 1,
          max: 10,
          step: 1,
          default: 5,
          minLabel: 'Relaxed',
          maxLabel: 'Adventurous',
        },
        {
          type: 'slider',
          id: 'beach',
          label: 'Beach time',
          min: 1,
          max: 10,
          step: 1,
          default: 5,
          minLabel: 'None',
          maxLabel: 'Every day',
        },
        {
          type: 'slider',
          id: 'culture',
          label: 'Culture & history',
          min: 1,
          max: 10,
          step: 1,
          default: 5,
          minLabel: 'Skip it',
          maxLabel: 'Priority',
        },
        {
          type: 'slider',
          id: 'food',
          label: 'Food & dining',
          min: 1,
          max: 10,
          step: 1,
          default: 7,
          minLabel: 'Casual',
          maxLabel: 'Foodie focus',
        },
        {
          type: 'slider',
          id: 'pace',
          label: 'Trip pace',
          min: 1,
          max: 10,
          step: 1,
          default: 5,
          minLabel: 'Slow & easy',
          maxLabel: 'Pack it in',
        },
        {
          type: 'multi-select',
          id: 'activities',
          label: 'Preferred activities',
          options: [
            'Hiking',
            'Museums',
            'Nightlife',
            'Shopping',
            'Cooking classes',
            'Water sports',
            'Wine tasting',
            'Day trips',
            'Spas',
            'Live music',
          ],
          default: [],
        },
      ],
    },
    {
      id: 'sustainability',
      title: 'Sustainability',
      description: 'Carbon and eco preferences',
      fields: [
        {
          type: 'toggle',
          id: 'prioritise_low_carbon',
          label: 'Prefer lower-carbon options',
          description: 'Prefer direct flights, flag train alternatives for short routes',
          default: false,
        },
        {
          type: 'toggle',
          id: 'show_carbon_estimate',
          label: 'Show carbon estimates',
          description: 'Include approximate CO₂ footprint (kg/person) for each flight',
          default: true,
        },
        {
          type: 'toggle',
          id: 'offset_carbon',
          label: 'Include carbon offset cost',
          description: 'Add estimated offset cost (~$15–20/tonne CO₂) to trip total',
          default: false,
        },
        {
          type: 'toggle',
          id: 'eco_accommodation',
          label: 'Prefer eco-certified accommodation',
          description: 'Prioritise hotels with Green Key, EU Ecolabel, or B Corp certification',
          default: false,
        },
      ],
    },
    {
      id: 'notes',
      title: 'Additional Notes',
      fields: [
        {
          type: 'textarea',
          id: 'notes',
          label: 'Notes',
          placeholder: 'Dietary needs, accessibility requirements, things to avoid, specific preferences...',
          default: '',
          rows: 4,
        },
      ],
    },
  ],

  render(values: FieldValues): string {
    const v = values as Record<string, unknown>
    const lines: string[] = []

    lines.push('# Trip Planner Configuration\n')

    // --- Objective ---
    const dest = v['destination'] as string
    const origin = v['origin'] as string
    const dateMode = v['date_mode'] as string
    const departureDate = v['departure_date'] as string
    const returnDate = v['return_date'] as string
    const flexibleDates = v['flexible_dates'] as string
    const adults = (v['adults'] as number) ?? 2
    const children = (v['children'] as number) ?? 0

    const objectiveLines: string[] = []
    if (dest) objectiveLines.push(`- **Destination**: ${dest}`)
    if (origin) objectiveLines.push(`- **Departing from**: ${origin}`)

    if (dateMode === 'Flexible dates') {
      if (flexibleDates?.trim()) {
        objectiveLines.push(`- **Flexible dates**: ${flexibleDates}`)
        objectiveLines.push('  (Find the best date combination that fits this constraint — optimise for lowest price and/or longest stay within budget)')
      }
    } else {
      if (departureDate) objectiveLines.push(`- **Departure date**: ${departureDate}`)
      if (returnDate) objectiveLines.push(`- **Return date**: ${returnDate}`)
    }

    const travelerParts = [
      `${adults} adult${adults !== 1 ? 's' : ''}`,
      children > 0 ? `${children} child${children !== 1 ? 'ren' : ''}` : '',
    ].filter(Boolean)
    objectiveLines.push(`- **Travelers**: ${travelerParts.join(', ')}`)

    lines.push(section('Objective', objectiveLines.join('\n') || '_Not specified_'))

    // --- Travel Preferences ---
    const travelLines: string[] = []
    const flightClass = v['flight_class'] as string
    if (flightClass) travelLines.push(`- **Flight class**: ${flightClass}`)
    if (v['direct_only']) travelLines.push('- **Direct flights only**: Yes — avoid layovers even at higher cost')
    else travelLines.push('- **Direct flights only**: No — layovers acceptable if price is significantly lower')

    const accStyle = (v['accommodation_style'] as number) ?? 3
    travelLines.push(`- **Accommodation tier**: ${ACC_LABELS[accStyle] ?? accStyle}`)

    const maxBudget = v['max_budget'] as string
    if (maxBudget?.trim()) travelLines.push(`- **Max total budget**: ${maxBudget}`)

    lines.push(section('Travel Preferences', travelLines.join('\n')))

    // --- Experience Profile ---
    const adv = (v['adventure'] as number) ?? 5
    const beach = (v['beach'] as number) ?? 5
    const culture = (v['culture'] as number) ?? 5
    const food = (v['food'] as number) ?? 7
    const pace = (v['pace'] as number) ?? 5

    const expLines: string[] = [
      `- **Adventure level**: ${adv}/10 (${adv <= 3 ? 'relaxed' : adv <= 6 ? 'moderate' : 'adventurous'})`,
      `- **Beach time**: ${beach}/10 (${beach <= 3 ? 'minimal' : beach <= 6 ? 'some' : 'lots'})`,
      `- **Culture & history**: ${culture}/10 (${culture <= 3 ? 'low priority' : culture <= 6 ? 'moderate' : 'high priority'})`,
      `- **Food & dining**: ${food}/10 (${food <= 3 ? 'casual' : food <= 6 ? 'moderate' : 'foodie-driven'})`,
      `- **Trip pace**: ${pace}/10 (${pace <= 3 ? 'slow & relaxed' : pace <= 6 ? 'moderate' : 'fast-paced'})`,
    ]
    const activities = v['activities'] as string[]
    if (activities?.length) expLines.push(`- **Preferred activities**: ${activities.join(', ')}`)

    lines.push(section('Experience Profile', expLines.join('\n')))

    // --- Sustainability ---
    const sustainLines: string[] = []
    if (v['prioritise_low_carbon']) sustainLines.push('- **Prefer lower-carbon options**: Where possible, prefer direct flights over connecting ones, and flag train alternatives if the route is under ~6h by rail. Factor carbon impact into recommendations.')
    if (v['show_carbon_estimate']) sustainLines.push('- **Carbon estimates**: Include an approximate CO₂ footprint (kg per person) for each flight option.')
    if (v['offset_carbon']) sustainLines.push('- **Carbon offset**: Include an estimated carbon offset cost (via typical offset schemes ~$15–20/tonne CO₂) in the total trip cost.')
    if (v['eco_accommodation']) sustainLines.push('- **Eco accommodation**: Prefer hotels with recognised sustainability certifications (e.g. Green Key, EU Ecolabel, B Corp). Flag which properties have these.')
    if (sustainLines.length > 0) {
      lines.push(section('Sustainability', sustainLines.join('\n')))
    }

    // --- Instructions ---
    const instructionLines: string[] = []
    if (dateMode === 'Flexible dates') {
      instructionLines.push('The user has flexible dates. Your first priority is to identify the optimal travel window that maximises value — either lowest total cost, longest possible stay, or best combination of both — within the constraints described.')
    }
    instructionLines.push('Search for real-time flight and hotel options using the available tools.')
    instructionLines.push('Present at least 2-3 flight alternatives and at least 3 hotel options across different price points.')
    instructionLines.push('Flag trade-offs explicitly (e.g. cheaper flight with a long layover, better-located hotel at higher cost).')
    if (maxBudget?.trim()) instructionLines.push(`Respect the budget of ${maxBudget}. Clearly flag any option that exceeds it.`)

    const notes = v['notes'] as string
    if (notes?.trim()) {
      instructionLines.push('')
      instructionLines.push(`**Additional notes from traveller**: ${notes}`)
    }

    lines.push(section('Instructions', instructionLines.join('\n')))

    return lines.join('\n')
  },
}
