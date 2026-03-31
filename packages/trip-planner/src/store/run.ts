import { create } from 'zustand'

export interface FlightOffer {
  id: string
  airline: string
  departure: string
  arrival: string
  origin: string
  destination: string
  duration: string
  stops: number
  price: number
  currency: string
}

export interface HotelOffer {
  hotelId: string
  name: string
  cityCode: string
  checkIn: string
  checkOut: string
  pricePerNight: number
  totalPrice: number
  currency: string
  stars: number | null
}

export type RunStatus = 'idle' | 'running' | 'done' | 'error'

interface RunStore {
  status: RunStatus
  statusMessages: string[]
  flights: FlightOffer[]
  hotels: HotelOffer[]
  plan: string
  error: string | null
  panelOpen: boolean

  startRun: (compiledMarkdown: string) => void
  closePanel: () => void
  reset: () => void
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const useRunStore = create<RunStore>((set, get) => ({
  status: 'idle',
  statusMessages: [],
  flights: [],
  hotels: [],
  plan: '',
  error: null,
  panelOpen: false,

  startRun: async (compiledMarkdown: string) => {
    set({
      status: 'running',
      statusMessages: [],
      flights: [],
      hotels: [],
      plan: '',
      error: null,
      panelOpen: true,
    })

    try {
      const res = await fetch(`${API_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compiledMarkdown }),
      })

      if (!res.ok) {
        const err = await res.json() as { error?: string }
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6)) as {
              type: string
              message?: string
              data?: unknown
              content?: string
            }

            if (event.type === 'status' && event.message) {
              set((s) => ({ statusMessages: [...s.statusMessages, event.message!] }))
            } else if (event.type === 'flights') {
              set({ flights: event.data as FlightOffer[] })
            } else if (event.type === 'hotels') {
              set({ hotels: event.data as HotelOffer[] })
            } else if (event.type === 'plan') {
              set({ plan: event.content ?? '' })
            } else if (event.type === 'error') {
              set({ status: 'error', error: event.message ?? 'Unknown error' })
            } else if (event.type === 'done') {
              set({ status: 'done' })
            }
          } catch {
            // malformed SSE line, skip
          }
        }
      }

      // Ensure status is done if stream ended without explicit done event
      if (get().status === 'running') set({ status: 'done' })
    } catch (e) {
      set({ status: 'error', error: e instanceof Error ? e.message : 'Request failed' })
    }
  },

  closePanel: () => set({ panelOpen: false }),
  reset: () => set({ status: 'idle', statusMessages: [], flights: [], hotels: [], plan: '', error: null, panelOpen: false }),
}))
