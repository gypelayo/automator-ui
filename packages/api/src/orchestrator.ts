import OpenAI from 'openai'
import { searchFlights, searchHotels, lookupIata, type FlightOffer, type HotelOffer } from './tools/amadeus'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// --- Tool definitions for the LLM ---

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_flights',
      description: 'Search for real-time flight offers between two airports. Use IATA codes.',
      parameters: {
        type: 'object',
        properties: {
          originCode: { type: 'string', description: 'Origin airport/city IATA code, e.g. JFK' },
          destinationCode: { type: 'string', description: 'Destination airport/city IATA code, e.g. LIS' },
          departureDate: { type: 'string', description: 'Departure date in YYYY-MM-DD format' },
          adults: { type: 'number', description: 'Number of adult passengers' },
        },
        required: ['originCode', 'destinationCode', 'departureDate', 'adults'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_hotels',
      description: 'Search for real-time hotel offers in a city.',
      parameters: {
        type: 'object',
        properties: {
          cityCode: { type: 'string', description: 'City IATA code, e.g. LIS for Lisbon' },
          checkInDate: { type: 'string', description: 'Check-in date in YYYY-MM-DD format' },
          checkOutDate: { type: 'string', description: 'Check-out date in YYYY-MM-DD format' },
          adults: { type: 'number', description: 'Number of adults' },
        },
        required: ['cityCode', 'checkInDate', 'checkOutDate', 'adults'],
      },
    },
  },
]

// --- SSE event types streamed back to client ---

export type RunEvent =
  | { type: 'status'; message: string }
  | { type: 'flights'; data: FlightOffer[] }
  | { type: 'hotels'; data: HotelOffer[] }
  | { type: 'plan'; content: string }
  | { type: 'error'; message: string }
  | { type: 'done' }

// --- Main orchestration function ---

export async function runOrchestration(
  compiledMarkdown: string,
  emit: (event: RunEvent) => void,
): Promise<void> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: compiledMarkdown,
    },
    {
      role: 'user',
      content: 'Search for the best flights and hotels based on the configuration above. Use the tools to get real prices, then write a concise day-by-day trip plan incorporating the actual options you found.',
    },
  ]

  let flights: FlightOffer[] = []
  let hotels: HotelOffer[] = []

  // Agentic loop — keep going until the LLM stops calling tools
  for (let i = 0; i < 8; i++) {
    emit({ type: 'status', message: i === 0 ? 'Analysing your trip configuration...' : 'Processing results...' })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools,
      tool_choice: 'auto',
    })

    const choice = response.choices[0]
    const msg = choice.message
    messages.push(msg)

    // No tool calls — LLM is done, stream the final plan
    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      emit({ type: 'plan', content: msg.content ?? '' })
      break
    }

    // Execute each tool call
    for (const toolCall of msg.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>

      if (toolCall.function.name === 'search_flights') {
        const { originCode, destinationCode, departureDate, adults } = args as {
          originCode: string; destinationCode: string; departureDate: string; adults: number
        }
        emit({ type: 'status', message: `Searching flights ${originCode} → ${destinationCode} on ${departureDate}...` })

        try {
          const results = await searchFlights({ originCode, destinationCode, departureDate, adults })
          flights = [...flights, ...results]
          emit({ type: 'status', message: `Found ${results.length} flight options` })
          emit({ type: 'flights', data: flights })

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(results),
          })
        } catch (e) {
          const msg2 = e instanceof Error ? e.message : 'Flight search failed'
          emit({ type: 'status', message: `Flight search error: ${msg2}` })
          messages.push({ role: 'tool', tool_call_id: toolCall.id, content: `Error: ${msg2}` })
        }
      }

      if (toolCall.function.name === 'search_hotels') {
        const { cityCode, checkInDate, checkOutDate, adults } = args as {
          cityCode: string; checkInDate: string; checkOutDate: string; adults: number
        }
        emit({ type: 'status', message: `Searching hotels in ${cityCode} (${checkInDate} → ${checkOutDate})...` })

        try {
          const results = await searchHotels({ cityCode, checkInDate, checkOutDate, adults })
          hotels = [...hotels, ...results]
          emit({ type: 'status', message: `Found ${results.length} hotel options` })
          emit({ type: 'hotels', data: hotels })

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(results),
          })
        } catch (e) {
          const msg2 = e instanceof Error ? e.message : 'Hotel search failed'
          emit({ type: 'status', message: `Hotel search error: ${msg2}` })
          messages.push({ role: 'tool', tool_call_id: toolCall.id, content: `Error: ${msg2}` })
        }
      }
    }
  }

  emit({ type: 'done' })
}
