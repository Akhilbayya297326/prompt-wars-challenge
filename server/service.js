import { createHash } from 'node:crypto'
import { fieldGuide } from './guidance.js'
import { forecast } from './providers.js'

export function createService({model=null, collection=null, weatherProvider=forecast}={}) {
  const memory = new Map()
  const pending = new Map()
  async function generate(input) {
    let weather = null
    if (input.location) {
      try { weather = await weatherProvider(input.location) } catch { /* The field plan works without telemetry. */ }
    }
    const guide = fieldGuide(input)
    let plan = guide
    let source = 'field-guide'
    if (model) {
      try { plan = await model(input,guide,weather); source = 'gemini' } catch { /* Keep the source label accurate during upstream failures. */ }
    }
    return {...plan, source, photoReviewed:Boolean(input.photo && source === 'gemini'), weather,
      weatherUnavailable:Boolean(input.location && !weather), modelUnavailable:Boolean(model && source !== 'gemini')}
  }
  async function run(input, key) {
    if (collection) {
      const prior = await collection.findOne({_id:key})
      if (prior) return prior.result
    }
    const result = await generate(input)
    if (collection) {
      try {
        await collection.updateOne({_id:key},{$setOnInsert:{result,createdAt:new Date()}},{upsert:true})
      } catch (err) { if (err.code !== 11000) throw err }
      return (await collection.findOne({_id:key})).result
    }
    if (memory.size >= 128) memory.delete(memory.keys().next().value)
    memory.set(key,result)
    return result
  }
  return async input => {
    const key = createHash('sha256').update(JSON.stringify(input)).digest('hex')
    if (memory.has(key)) return memory.get(key)
    if (!pending.has(key)) pending.set(key,run(input,key).finally(() => pending.delete(key)))
    return pending.get(key)
  }
}
