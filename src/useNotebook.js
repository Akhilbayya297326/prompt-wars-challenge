import { useCallback, useEffect, useRef, useState } from "react";
import { allPlans, enqueue, remove, syncPlans } from "./notebook.js";

export function useNotebook() {
  const [online, setOnline] = useState(navigator.onLine);
  const [entries, setEntries] = useState([]);
  const [storageError, setStorageError] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const activeSync = useRef(null);
  const refresh = useCallback(async () => {
    setEntries(await allPlans());
    setStorageError(false);
  }, []);

  const sync = useCallback(() => {
    if (activeSync.current) return activeSync.current;
    setSyncing(true);
    activeSync.current = syncPlans(refresh)
      .then(refresh)
      .catch(() => setStorageError(true))
      .finally(() => {
        activeSync.current = null;
        setSyncing(false);
      });
    return activeSync.current;
  }, [refresh]);

  useEffect(() => {
    const onNetworkChange = () => {
      setOnline(navigator.onLine);
      void sync();
    };
    // Show cached plans immediately even when the first online request is slow.
    refresh()
      .then(sync)
      .catch(() => setStorageError(true));
    const timer = setInterval(() => {
      if (!document.hidden && navigator.onLine) void sync();
    }, 45000);
    const events = ["online", "offline", "focus"];
    for (const event of events) window.addEventListener(event, onNetworkChange);
    return () => {
      clearInterval(timer);
      for (const event of events)
        window.removeEventListener(event, onNetworkChange);
    };
  }, [refresh, sync]);

  async function savePlan(input) {
    await enqueue(input);
    await refresh();
    // A running sync may have already read its list before this enqueue.
    const previous = activeSync.current;
    if (previous) void previous.then(sync);
    else void sync();
  }

  async function removePlan(id) {
    try {
      await remove(id);
      await refresh();
    } catch {
      setStorageError(true);
    }
  }
  return { online, entries, storageError, syncing, sync, savePlan, removePlan };
}
