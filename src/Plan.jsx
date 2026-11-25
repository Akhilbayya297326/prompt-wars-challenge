import React from "react";
import { toolText } from "./copy.js";
import { local } from "../shared/fields.js";
export function Plan({ entry, onRemove }) {
  const { result, lang, tool } = entry;
  const t = (...words) => local(lang, ...words);
  return (
    <article className="plan" lang={lang}>
      <div className="kicker">
        {toolText(tool, lang).name} ·{" "}
        {new Date(entry.time).toLocaleDateString(lang + "-IN")}
      </div>
      <h3>{result?.title || entry.label}</h3>
      {entry.status === "pending" && (
        <p>
          {t(
            "Saved on this device. It will sync while the app is open and online.",
            "डिवाइस पर सहेजा गया। ऐप खुला और ऑनलाइन होने पर सिंक होगा।",
            "ఈ పరికరంలో భద్రపరిచాం. యాప్ తెరిచి ఆన్‌లైన్‌లో ఉంటే సింక్ అవుతుంది.",
          )}
        </p>
      )}
      {entry.status === "failed" && (
        <p>
          {t(
            "Request needs correction. Open the tool to create a new plan.",
            "अनुरोध में सुधार चाहिए। नई योजना बनाएँ।",
            "వివరాలు సరిచేసి కొత్త ప్రణాళిక రూపొందించండి.",
          )}{" "}
          {entry.error}
        </p>
      )}
      {result && (
        <>
          <span className="source">
            {result.source === "gemini"
              ? "Gemini"
              : t(
                  "Built-in field guide",
                  "अंतर्निहित खेत मार्गदर्शिका",
                  "అంతర్నిర్మిత సాగు మార్గదర్శిని",
                )}
          </span>
          {result.modelUnavailable && (
            <p>
              {t(
                "AI is temporarily unavailable.",
                "AI अभी उपलब्ध नहीं है।",
                "AI తాత్కాలికంగా అందుబాటులో లేదు.",
              )}
            </p>
          )}
          {entry.hadPhoto && (
            <p>
              {result.photoReviewed
                ? t(
                    "Photo reviewed by AI.",
                    "AI ने तस्वीर देखी।",
                    "AI ఫోటోను పరిశీలించింది.",
                  )
                : t(
                    "Photo was not analyzed. This plan uses your form entries.",
                    "तस्वीर का विश्लेषण नहीं हुआ। योजना आपके दर्ज विवरण पर आधारित है।",
                    "ఫోటో విశ్లేషించలేదు. ఈ ప్రణాళిక మీరు ఇచ్చిన వివరాల ఆధారంగా రూపొందింది.",
                  )}
            </p>
          )}
          <p>{result.summary}</p>
          <ol>
            {result.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          {result.weather && (
            <p>
              {t("Forecast rain probability", "वर्षा की संभावना", "వర్ష సూచన")} ·{" "}
              {result.weather.rain}% · {result.weather.date} ·{" "}
              <a href={result.weather.url}>Open-Meteo</a>
            </p>
          )}
          {result.weatherUnavailable && (
            <p>
              {t(
                "Forecast unavailable.",
                "पूर्वानुमान उपलब्ध नहीं है।",
                "వాతావరణ అంచనా అందుబాటులో లేదు.",
              )}
            </p>
          )}
          <ul className="refs">
            {result.refs.map((ref) => (
              <li key={ref.url}>
                <a href={ref.url} target="_blank" rel="noreferrer">
                  {ref.title}
                </a>
                <small>{ref.reason}</small>
              </li>
            ))}
          </ul>
          {"speechSynthesis" in window && (
            <button
              className="text-button"
              onClick={() => {
                speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(
                  [result.title, result.summary, ...result.steps].join(". "),
                );
                utterance.lang = lang + "-IN";
                speechSynthesis.speak(utterance);
              }}
            >
              {t("Read aloud", "पढ़कर सुनाएँ", "చదివి వినిపించండి")}
            </button>
          )}
        </>
      )}
      {onRemove && (
        <button
          className="text-button remove"
          onClick={() => onRemove(entry.id)}
        >
          {t("Remove from device", "डिवाइस से हटाएँ", "పరికరం నుండి తొలగించండి")}
        </button>
      )}
    </article>
  );
}
