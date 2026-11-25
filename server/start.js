import { MongoClient } from 'mongodb'
import { createApp } from './app.js'
import { createService } from './service.js'
import { createModel } from './providers.js'

let client, collection
if (process.env.MONGODB_URI) {
  client = new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:5000})
  await client.connect()
  collection = client.db('krishi_chakra').collection('field_plans')
  await collection.createIndex({createdAt:1},{expireAfterSeconds:86400})
}
const model = createModel(process.env.GEMINI_API_KEY,process.env.GEMINI_MODEL || 'gemini-2.5-flash')
const port = Number(process.env.PORT || 8080)
const server = createApp(createService({model,collection})).listen(port,'0.0.0.0',()=>console.log('Krishi Chakra listening on port ' + port))
process.on('SIGTERM',()=>server.close(async()=>{await client?.close()}))

