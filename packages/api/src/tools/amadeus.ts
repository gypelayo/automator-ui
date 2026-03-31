// Amadeus API client
// Docs: https://developers.amadeus.com/self-service/category/flights

const AMADEUS_BASE = 'https://test.api.amadeus.com'

let cachedToken: string | null = null
let tokenExpiry = 0

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const res = await fetch(`${AMADEUS_BASE}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_CLIENT_ID!,
      client_secret: process.env.AMADEUS_CLIENT_SECRET!,
    }),
  })

  if (!res.ok) throw new Error(`Amadeus auth failed: ${res.status}`)
  const data = await res.json() as { access_token: string; expires_in: number }
  cachedToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return cachedToken
}

async function amadeusGet(path: string, params: Record<string, string>): Promise<unknown> {
  const token = await getToken()
  const url = new URL(`${AMADEUS_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Amadeus ${path} failed (${res.status}): ${err}`)
  }
  return res.json()
}

// --- City/Airport IATA lookup ---

export async function lookupIata(keyword: string): Promise<string | null> {
  try {
    const data = await amadeusGet('/v1/reference-data/locations', {
      keyword,
      subType: 'CITY,AIRPORT',
      page_limit: '1',
    }) as { data?: Array<{ iataCode: string }> }
    return data.data?.[0]?.iataCode ?? null
  } catch {
    return null
  }
}

// --- Flight search ---

export interface FlightOffer {
  id: string
  airline: string
  departure: string   // ISO datetime
  arrival: string
  origin: string      // IATA
  destination: string
  duration: string    // PT8H30M format
  stops: number
  price: number
  currency: string
}

export async function searchFlights(params: {
  originCode: string
  destinationCode: string
  departureDate: string  // YYYY-MM-DD
  adults: number
  max?: number
}): Promise<FlightOffer[]> {
  const data = await amadeusGet('/v2/shopping/flight-offers', {
    originLocationCode: params.originCode,
    destinationLocationCode: params.destinationCode,
    departureDate: params.departureDate,
    adults: String(params.adults),
    max: String(params.max ?? 5),
    currencyCode: 'USD',
  }) as {
    data?: Array<{
      id: string
      itineraries: Array<{
        duration: string
        segments: Array<{
          departure: { iataCode: string; at: string }
          arrival: { iataCode: string; at: string }
          carrierCode: string
          numberOfStops: number
        }>
      }>
      price: { grandTotal: string; currency: string }
    }>
  }

  return (data.data ?? []).map((offer) => {
    const itinerary = offer.itineraries[0]
    const first = itinerary.segments[0]
    const last = itinerary.segments[itinerary.segments.length - 1]
    return {
      id: offer.id,
      airline: first.carrierCode,
      departure: first.departure.at,
      arrival: last.arrival.at,
      origin: first.departure.iataCode,
      destination: last.arrival.iataCode,
      duration: itinerary.duration,
      stops: itinerary.segments.length - 1,
      price: parseFloat(offer.price.grandTotal),
      currency: offer.price.currency,
    }
  })
}

// --- Hotel search ---

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

export async function searchHotels(params: {
  cityCode: string
  checkInDate: string   // YYYY-MM-DD
  checkOutDate: string
  adults: number
  max?: number
}): Promise<HotelOffer[]> {
  // Step 1: get hotel IDs for city
  const hotelsData = await amadeusGet('/v1/reference-data/locations/hotels/by-city', {
    cityCode: params.cityCode,
    radius: '5',
    radiusUnit: 'KM',
    hotelSource: 'ALL',
  }) as { data?: Array<{ hotelId: string; name: string; iataCode: string; rating?: string }> }

  const hotelIds = (hotelsData.data ?? []).slice(0, params.max ?? 5).map((h) => h.hotelId)
  if (hotelIds.length === 0) return []

  const hotelMeta = new Map(
    (hotelsData.data ?? []).map((h) => [h.hotelId, h])
  )

  // Step 2: get offers for those hotel IDs
  const offersData = await amadeusGet('/v3/shopping/hotel-offers', {
    hotelIds: hotelIds.join(','),
    checkInDate: params.checkInDate,
    checkOutDate: params.checkOutDate,
    adults: String(params.adults),
    currencyCode: 'USD',
    bestRateOnly: 'true',
  }) as {
    data?: Array<{
      hotel: { hotelId: string; name: string; cityCode: string }
      offers: Array<{
        checkInDate: string
        checkOutDate: string
        price: { total: string; currency: string; variations?: { average?: { base: string } } }
      }>
    }>
  }

  const nights = Math.max(1,
    (new Date(params.checkOutDate).getTime() - new Date(params.checkInDate).getTime())
    / (1000 * 60 * 60 * 24)
  )

  return (offersData.data ?? []).map((item) => {
    const offer = item.offers[0]
    const total = parseFloat(offer.price.total)
    const meta = hotelMeta.get(item.hotel.hotelId)
    const stars = meta?.rating ? parseInt(meta.rating) : null
    return {
      hotelId: item.hotel.hotelId,
      name: item.hotel.name,
      cityCode: item.hotel.cityCode,
      checkIn: offer.checkInDate,
      checkOut: offer.checkOutDate,
      pricePerNight: Math.round(total / nights),
      totalPrice: total,
      currency: offer.price.currency,
      stars,
    }
  })
}
