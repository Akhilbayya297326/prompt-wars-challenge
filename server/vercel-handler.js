import { initializeRuntime } from "./runtime.js";

let runtime;
export default async function handler(req, res) {
  runtime ??= initializeRuntime().catch((error) => {
    runtime = undefined;
    throw error;
  });
  try {
    const { app } = await runtime;
    app(req, res);
  } catch {
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Service temporarily unavailable." }));
  }
}
