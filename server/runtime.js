import { MongoClient } from "mongodb";
import { createApp } from "./app.js";
import { createService } from "./service.js";
import { createModel } from "./providers.js";

// One connection pool and request cache per warm process.
export async function initializeRuntime() {
  let client, collection;
  try {
    if (process.env.MONGODB_URI) {
      client = new MongoClient(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      await client.connect();
      collection = client.db("krishi_chakra").collection("field_plans");
      await collection.createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 86400 },
      );
    }
    const model = createModel(
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_MODEL || "gemini-2.5-flash",
    );
    return {
      app: createApp(createService({ model, collection })),
      close: () => client?.close(),
    };
  } catch (err) {
    await client?.close();
    throw err;
  }
}
