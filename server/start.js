import { initializeRuntime } from "./runtime.js";

const { app, close } = await initializeRuntime();
const port = Number(process.env.PORT || 8080);
const server = app.listen(port, "0.0.0.0", () =>
  console.log("Krishi Chakra listening on port " + port),
);
process.on("SIGTERM", () => server.close(close));
