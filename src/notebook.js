import axios from "axios";

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
export async function syncPlans(onChange) {
  async function drain() {
    for (const entry of (await allPlans()).reverse()) {
      if (!navigator.onLine || entry.status !== "pending") continue;
      let result;
      try {
        result = (
          await axios.post("/api/advice", entry.input, { timeout: 45000 })
        ).data;
        if (!Array.isArray(result?.steps)) return;
      } catch (err) {
        const status = err.response?.status;
        if (!status || status === 429 || status >= 500) return;
        await save({
          ...entry,
          status: "failed",
          error: err.response?.data?.error || "Invalid request",
          input: undefined,
        });
        await onChange();
        continue;
      }
      // Readers see a complete new state after this single transaction commits.
      await save({ ...entry, input: undefined, status: "complete", result });
      await onChange();
    }
  }
  if (navigator.locks)
    return navigator.locks.request(
      "krishi-notebook-sync",
      { ifAvailable: true },
      (lock) => (lock ? drain() : undefined),
    );
  return drain();
}
