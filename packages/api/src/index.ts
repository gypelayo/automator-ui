import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { runRoute } from './routes/run'
import { templatesRoute } from './routes/templates'

const app = new Hono()

app.use('*', cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://gypelayo.github.io',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

app.get('/health', (c) => c.json({ ok: true }))
app.route('/run', runRoute)
app.route('/templates', templatesRoute)

const port = parseInt(process.env.PORT ?? '3000')
console.log(`API running on port ${port}`)

export default {
  port,
  fetch: app.fetch,
}
