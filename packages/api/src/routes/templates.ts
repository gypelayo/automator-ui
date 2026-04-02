import { Hono } from 'hono'

export const templatesRoute = new Hono()

// ---------------------------------------------------------------------------
// In-memory store — survives as long as the API process runs.
// An agent (OpenCode, Claude, any LLM) POSTs here; the UI polls GET /templates
// and merges the results into its own localStorage-backed store.
// ---------------------------------------------------------------------------

export type TemplateDefinition = {
  id: string
  name: string
  description: string
  icon?: string
  sections: unknown[]  // SectionSchema[] — validated loosely so the API stays dependency-free
}

const store = new Map<string, TemplateDefinition>()

// GET /templates — return all templates the agent has pushed
templatesRoute.get('/', (c) => {
  return c.json(Array.from(store.values()))
})

// GET /templates/:id
templatesRoute.get('/:id', (c) => {
  const def = store.get(c.req.param('id'))
  if (!def) return c.json({ error: 'Not found' }, 404)
  return c.json(def)
})

// POST /templates — create or overwrite a template
templatesRoute.post('/', async (c) => {
  const body = await c.req.json<TemplateDefinition>()
  if (!body.id || !body.name || !Array.isArray(body.sections)) {
    return c.json({ error: 'id, name, and sections are required' }, 400)
  }
  store.set(body.id, body)
  return c.json(body, 201)
})

// PUT /templates/:id — update an existing template
templatesRoute.put('/:id', async (c) => {
  const id = c.req.param('id')
  const existing = store.get(id)
  if (!existing) return c.json({ error: 'Not found' }, 404)
  const body = await c.req.json<Partial<TemplateDefinition>>()
  const updated = { ...existing, ...body, id } // id is immutable
  store.set(id, updated)
  return c.json(updated)
})

// DELETE /templates/:id
templatesRoute.delete('/:id', (c) => {
  const id = c.req.param('id')
  if (!store.has(id)) return c.json({ error: 'Not found' }, 404)
  store.delete(id)
  return c.json({ deleted: id })
})
