import axios from "axios";
import { isFieldPlan } from "./plan-response.js";

let connection;
function openNotebook() {
  if (!connection)
    connection = new Promise((resolve, reject) => {
      const req = indexedDB.open("krishi-chakra-notebook", 1);
      req.onupgradeneeded = () =>
        req.result.createObjectStore("plans", { keyPath: "id" });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        connection = null;
        reject(req.error);
      };
    });
  return connection;
}
async function transaction(mode, operation) {
  const db = await openNotebook();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("plans", mode);
    const req = operation(tx.objectStore("plans"));
    tx.oncomplete = () => resolve(req.result);
    tx.onabort = () => reject(tx.error || Error("Storage unavailable"));
  });
}
export const allPlans = async () =>
  (await transaction("readonly", (s) => s.getAll())).sort(
    (a, b) => b.time - a.time,
  );
const save = (entry) => transaction("readwrite", (s) => s.put(entry));
export const remove = (id) => transaction("readwrite", (s) => s.delete(id));
export function enqueue(input) {
  return save({
    id: input.id,
    time: Date.now(),
    tool: input.tool,
    label: input.crop || input.state || input.topic,
    lang: input.lang,
    hadPhoto: Boolean(input.photo),
    status: "pending",
    input,
  });
}
async function submitObservation(input) {
  try {
    const { data } = await axios.post("/api/advice", input, { timeout: 45000 });
    return isFieldPlan(data) ? { status: "complete", result: data } : null;
  } catch (err) {
    // Only discard an input if the API definitively rejected the observation.
    // Timeouts, rate limits, gateway failures and unexpected replies can be retried.
    if (![400, 413, 415, 422].includes(err.response?.status)) return null;
    const message = err.response.data?.error;
    return {
      status: "failed",
      error: typeof message === "string" ? message : "Invalid request",
    };
  }
}

async function drain(onChange) {
  if (!navigator.onLine) return;
  const oldestFirst = (await allPlans()).reverse();
  for (const entry of oldestFirst) {
    if (entry.status !== "pending") continue;
    const outcome = await submitObservation(entry.input);
    if (!outcome) return;
    await save({ ...entry, ...outcome, input: undefined });
    await onChange();
  }
}

export async function syncPlans(onChange) {
  if (navigator.locks)
    return navigator.locks.request(
      "krishi-notebook-sync",
      { ifAvailable: true },
      (lock) => (lock ? drain(onChange) : undefined),
    );
  return drain(onChange);
}
