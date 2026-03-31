import { Hono } from 'hono'
import { runOrchestration, type RunEvent } from '../orchestrator'

export const runRoute = new Hono()

// Simple in-memory rate limiter: 5 runs per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

runRoute.post('/', async (c) => {
  const ip = c.req.header('x-forwarded-for') ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return c.json({ error: 'Rate limit exceeded. Max 5 runs per hour.' }, 429)
  }

  const body = await c.req.json<{ compiledMarkdown?: string }>()
  const { compiledMarkdown } = body

  if (!compiledMarkdown?.trim()) {
    return c.json({ error: 'compiledMarkdown is required' }, 400)
  }

  // Stream SSE back to client
  return new Response(
    new ReadableStream({
      async start(controller) {
        const encode = (event: RunEvent) => {
          const data = `data: ${JSON.stringify(event)}\n\n`
          controller.enqueue(new TextEncoder().encode(data))
        }

        try {
          await runOrchestration(compiledMarkdown, encode)
        } catch (e) {
          encode({ type: 'error', message: e instanceof Error ? e.message : 'Unknown error' })
        } finally {
          controller.close()
        }
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    },
  )
})
