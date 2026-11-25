import React from "react";
import { NotebookPen } from "lucide-react";
import { Plan } from "./Plan.jsx";

export function NotebookView({
  entries,
  online,
  syncing,
  onSync,
  onRemove,
  onOpenDesk,
  t,
}) {
  const pending = entries.filter((entry) => entry.status === "pending").length;
  return (
    <section className="notebook">
      <div className="heading">
        <div>
          <h1 tabIndex="-1">{t("Field notebook", "खेत नोटबुक", "పొలం నోట్‌బుక్")}</h1>
        </div>
        {pending > 0 && (
          <button
            className="secondary"
            disabled={!online || syncing}
            onClick={onSync}
          >
            {t(
              "Sync pending plans",
              "लंबित योजनाएँ सिंक करें",
              "పెండింగ్ ప్రణాళికలు సింక్ చేయండి",
            )}{" "}
            ({pending})
          </button>
        )}
      </div>
      {!entries.length && (
        <div className="empty">
          <NotebookPen aria-hidden="true" />
          <h2>
            {t(
              "Your notebook is empty",
              "आपकी नोटबुक खाली है",
              "మీ నోట్‌బుక్ ఖాళీగా ఉంది",
            )}
          </h2>
          <button className="primary" onClick={onOpenDesk}>
            {t("Open field desk", "खेत डेस्क खोलें", "పొలం డెస్క్ తెరవండి")}
          </button>
        </div>
      )}
      <div aria-live="polite">
        {entries.map((entry, index) => (
          <Plan
            key={entry.id}
            entry={entry}
            latest={index === 0}
            onRemove={entry.status === "pending" ? undefined : onRemove}
          />
        ))}
      </div>
    </section>
  );
}
