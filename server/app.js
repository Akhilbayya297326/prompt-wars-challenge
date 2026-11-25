import express from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { fileURLToPath } from 'node:url'
import { InvalidInput, validate } from './validate.js'

export function createApp(analyze) {
  const app = express()
  app.disable('x-powered-by')
  app.use(helmet({contentSecurityPolicy:{directives:{'img-src':["'self'","data:","blob:"],'upgrade-insecure-requests':null}}}))
  app.get('/api/health',(_req,res)=>res.json({status:'ok'}))
  app.post('/api/advice', rateLimit({windowMs:60000,limit:25,standardHeaders:'draft-7',legacyHeaders:false,
    message:{error:'Too many requests. Try again in a minute.'}}), express.json({limit:'1500kb'}), async (req,res)=>{
    res.set('Cache-Control','no-store')
    if (!req.is('application/json')) return res.status(415).json({error:'Send JSON.'})
    const result = await analyze(validate(req.body))
    res.json(result)
  })
  app.use(express.static(fileURLToPath(new URL('../dist/',import.meta.url))))
  app.use((err,_req,res,_next)=>{
    if (err instanceof InvalidInput) return res.status(400).json({error:err.message})
    if (err.type === 'entity.too.large') return res.status(413).json({error:'Image exceeds the upload limit.'})
    if (err.status === 400) return res.status(400).json({error:'Invalid JSON.'})
    res.status(503).json({error:'Service temporarily unavailable.'})
  })
  return app
}
