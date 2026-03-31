import type { Template, FieldValues, BudgetEntry } from '@automator/core'
import { section, formatMultiSelect } from '@automator/core'

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
          type: 'text',
          id: 'dates',
          label: 'Travel dates',
          description: 'Start and end dates for the trip',
          placeholder: 'e.g. June 10 – June 18, 2025',
          default: '',
        },
        {
          type: 'text',
          id: 'travelers',
          label: 'Travelers',
          placeholder: 'e.g. 2 adults, 1 child (8yo)',
          default: '',
        },
      ],
    },
    {
      id: 'travel',
      title: 'Getting There',
      description: 'How you want to travel to the destination',
      fields: [
        {
          type: 'multi-select',
          id: 'transport_modes',
          label: 'Preferred transport',
          options: ['Flight', 'Train', 'Bus', 'Car', 'Ferry'],
          default: ['Flight'],
        },
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
        {
          type: 'toggle',
          id: 'rent_car',
          label: 'Rent a car',
          description: 'Include car rental in the plan',
          default: false,
        },
        {
          type: 'toggle',
          id: 'open_jaw',
          label: 'Open-jaw flights OK',
          description: 'Fly into one city and out of another',
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
          type: 'multi-select',
          id: 'accommodation_types',
          label: 'Accommodation types',
          options: ['Hotel', 'Airbnb', 'Hostel', 'Resort', 'Boutique', 'Villa'],
          default: ['Hotel'],
        },
        {
          type: 'slider',
          id: 'accommodation_style',
          label: 'Accommodation style',
          description: 'From budget to luxury',
          min: 1,
          max: 5,
          step: 1,
          default: 3,
          minLabel: 'Budget',
          maxLabel: 'Luxury',
        },
        {
          type: 'toggle',
          id: 'central_location',
          label: 'Central location priority',
          description: 'Prefer hotels close to the city centre even at higher cost',
          default: true,
        },
        {
          type: 'budget-split',
          id: 'hotel_budget',
          label: 'Hotel budget by night group',
          description: 'Set different budgets for different stretches of the trip',
          entries: [],
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
          type: 'toggle',
          id: 'multi_city',
          label: 'Open to multi-city',
          description: 'Willing to visit nearby cities or regions during the trip',
          default: false,
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
      id: 'budget',
      title: 'Budget & Constraints',
      fields: [
        {
          type: 'text',
          id: 'total_budget',
          label: 'Total trip budget',
          placeholder: 'e.g. $3,000 USD',
          default: '',
        },
        {
          type: 'select',
          id: 'budget_priority',
          label: 'Budget priority',
          description: 'Where to spend vs. save',
          options: ['Balanced', 'Spend on flights, save on hotels', 'Save on flights, spend on hotels', 'Spend on experiences', 'Minimize everything'],
          default: 'Balanced',
        },
        {
          type: 'toggle',
          id: 'travel_insurance',
          label: 'Include travel insurance',
          description: 'Factor in travel insurance in the recommendations',
          default: false,
        },
        {
          type: 'textarea',
          id: 'notes',
          label: 'Additional notes',
          placeholder: 'Any dietary needs, accessibility requirements, things to avoid, specific preferences...',
          default: '',
          rows: 4,
        },
      ],
    },
  ],

  render(values: FieldValues): string {
    const v = values as Record<string, unknown>
    const lines: string[] = []

    lines.push(`# Travel Planner Configuration\n`)

    // Objective
    const dest = v['destination'] as string
    const origin = v['origin'] as string
    const dates = v['dates'] as string
    const travelers = v['travelers'] as string

    const objectiveLines: string[] = []
    if (dest) objectiveLines.push(`- **Destination**: ${dest}`)
    if (origin) objectiveLines.push(`- **From**: ${origin}`)
    if (dates) objectiveLines.push(`- **Dates**: ${dates}`)
    if (travelers) objectiveLines.push(`- **Travelers**: ${travelers}`)

    lines.push(section('Objective', objectiveLines.join('\n') || '_Not specified_'))

    // Tools
    lines.push(
      section(
        'Tools',
        [
          '- **Flight search**: Search and compare flights (read-only)',
          '- **Hotel search**: Search and compare accommodations (read-only)',
          '- **Activity search**: Search tours, activities, and experiences (read-only)',
          '- **Maps**: Look up locations, distances, transit options (read-only)',
          '- **Weather**: Check weather forecasts for the destination (read-only)',
          ...(v['rent_car'] ? ['- **Car rental search**: Search and compare car rentals (read-only)'] : []),
        ].join('\n'),
      ),
    )

    // Constraints (sliders + toggles)
    const constraintLines: string[] = []
    const adv = v['adventure'] as number
    const beach = v['beach'] as number
    const culture = v['culture'] as number
    const food = v['food'] as number
    const pace = v['pace'] as number

    constraintLines.push(`- **Adventure level**: ${adv}/10 (${adv <= 3 ? 'relaxed' : adv <= 6 ? 'moderate' : 'adventurous'})`)
    constraintLines.push(`- **Beach time**: ${beach}/10 (${beach <= 3 ? 'minimal' : beach <= 6 ? 'some' : 'lots'})`)
    constraintLines.push(`- **Culture & history**: ${culture}/10 (${culture <= 3 ? 'low priority' : culture <= 6 ? 'moderate' : 'high priority'})`)
    constraintLines.push(`- **Food & dining focus**: ${food}/10 (${food <= 3 ? 'casual' : food <= 6 ? 'moderate' : 'foodie-driven'})`)
    constraintLines.push(`- **Trip pace**: ${pace}/10 (${pace <= 3 ? 'slow and relaxed' : pace <= 6 ? 'moderate' : 'fast-paced, pack in as much as possible'})`)

    if (v['direct_only']) constraintLines.push('- **Flights**: Direct flights only, no layovers')
    if (v['central_location']) constraintLines.push('- **Accommodation**: Prioritise central locations')
    if (v['multi_city']) constraintLines.push('- **Itinerary**: Open to visiting nearby cities or regions')
    if (v['open_jaw']) constraintLines.push('- **Flights**: Open-jaw flights are acceptable')
    if (v['travel_insurance']) constraintLines.push('- Include travel insurance in recommendations')

    lines.push(section('Constraints', constraintLines.join('\n')))

    // Parameters
    const paramLines: string[] = []

    const transport = v['transport_modes'] as string[]
    if (transport?.length) paramLines.push(`- **Transport modes**: ${formatMultiSelect(transport)}`)
    paramLines.push(`- **Flight class**: ${v['flight_class'] as string}`)
    if (v['rent_car']) paramLines.push('- **Car rental**: Yes, include in plan')

    const accTypes = v['accommodation_types'] as string[]
    if (accTypes?.length) paramLines.push(`- **Accommodation types**: ${formatMultiSelect(accTypes)}`)

    const accStyle = v['accommodation_style'] as number
    const accLabels = ['', 'Budget', 'Economy', 'Mid-range', 'Upscale', 'Luxury']
    paramLines.push(`- **Accommodation tier**: ${accLabels[accStyle] ?? accStyle}`)

    const budgetPriority = v['budget_priority'] as string
    if (budgetPriority) paramLines.push(`- **Budget priority**: ${budgetPriority}`)

    const totalBudget = v['total_budget'] as string
    if (totalBudget?.trim()) paramLines.push(`- **Total budget**: ${totalBudget}`)

    const activities = v['activities'] as string[]
    if (activities?.length) paramLines.push(`- **Preferred activities**: ${formatMultiSelect(activities)}`)

    const hotelBudget = v['hotel_budget'] as BudgetEntry[]
    if (hotelBudget?.length) {
      paramLines.push('- **Hotel budget by period**:')
      hotelBudget.forEach((e) => paramLines.push(`  - ${e.label}: $${e.amount.toLocaleString()}/night`))
    }

    lines.push(section('Parameters', paramLines.join('\n')))

    // Instructions
    const notes = v['notes'] as string
    const instructionLines = [
      'Search for real options and present a structured itinerary with clear options at each decision point.',
      'For each major cost (flights, accommodation, activities), provide at least 2-3 alternatives.',
      'Flag any trade-offs explicitly — e.g. a cheaper flight with a long layover, or a better-located hotel at higher cost.',
      'Respect the budget constraints strictly. Do not recommend options that exceed the stated budget without flagging it.',
    ]
    if (notes?.trim()) instructionLines.push(`\n**Additional notes from user**:\n${notes}`)

    lines.push(section('Instructions', instructionLines.join('\n')))

    return lines.join('\n')
  },
}
