import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { languages, local, tools } from "../shared/fields.js";
import { toolText } from "./copy.js";
import { FieldForm } from "./FieldForm.jsx";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  Languages,
  LayoutGrid,
  Mic,
  Sprout,
} from "lucide-react";
import { ToolIcon } from "./ToolIcon.jsx";
import { NotebookView } from "./NotebookView.jsx";
import { useNotebook } from "./useNotebook.js";
import "./style.css";

function App() {
  const [lang, setLang] = useState(() => {
    try {
      return languages.includes(localStorage.krishiLanguage)
        ? localStorage.krishiLanguage
        : "en";
    } catch {
      return "en";
    }
  });
  const [view, setView] = useState("desk");
  const [tool, setTool] = useState("crop");
  const [drafts, setDrafts] = useState({});
  const { online, entries, storageError, syncing, sync, savePlan, removePlan } =
    useNotebook();
  const [voiceMessage, setVoiceMessage] = useState("");
  const voiceRef = useRef();
  const t = (...words) => local(lang, ...words);
  useEffect(() => () => voiceRef.current?.abort(), []);
  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.krishiLanguage = lang;
    } catch {}
  }, [lang]);
  function selectTool(key, focus = false) {
    setView("desk");
    setTool(key);
    if (focus)
      requestAnimationFrame(() => {
        document.querySelector("#workflow-title")?.focus();
      });
  }
  function navigateVoice() {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    voiceRef.current?.abort();
    const rec = new Speech();
    voiceRef.current = rec;
    rec.lang = lang + "-IN";
    const help = t(
      "Say a tool name, such as Crop health.",
      "एक टूल का नाम बोलें, जैसे फसल स्वास्थ्य।",
      "ఒక సాధనం పేరు చెప్పండి, ఉదాహరణకు పంట ఆరోగ్యం.",
    );
    setVoiceMessage(help);
    rec.onresult = (e) => {
      const heard = e.results[0][0].transcript.trim().toLowerCase();
      const key = tools.find((k) =>
        [
          k,
          toolText(k, lang).name,
          ...languages.map((l) => toolText(k, l).title),
        ].some((s) => heard.includes(s.toLowerCase())),
      );
      if (key) {
        selectTool(key, true);
        setVoiceMessage("");
      } else if (
        ["notebook", "नोटबुक", "నోట్‌బుక్"].some((s) => heard.includes(s))
      ) {
        setView("notes");
        setVoiceMessage("");
      } else setVoiceMessage(help);
    };
    rec.onerror = () =>
      setVoiceMessage(
        t(
          "Voice input unavailable. Select a tool below.",
          "आवाज़ उपलब्ध नहीं है। नीचे टूल चुनें।",
          "వాయిస్ అందుబాటులో లేదు. కింద సాధనం ఎంచుకోండి.",
        ),
      );
    try {
      rec.start();
    } catch {
      rec.onerror();
    }
  }
  async function submit(input) {
    await savePlan(input);
    setDrafts((previous) => {
      const next = { ...previous };
      delete next[input.tool];
      return next;
    });
    openView("notes");
  }
  function openView(next) {
    setView(next);
    requestAnimationFrame(() => {
      const heading = document.querySelector("main h1");
      heading?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    });
  }
  const navigation = (
    <nav
      className="workspace-nav"
      aria-label={t("Workspace", "कार्य क्षेत्र", "కార్యస్థలం")}
    >
      <button
        aria-current={view === "desk" ? "page" : undefined}
        onClick={() => openView("desk")}
      >
        <LayoutGrid />
        {t("Field desk", "खेत डेस्क", "పొలం డెస్క్")}
      </button>
      <button
        aria-current={view === "notes" ? "page" : undefined}
        onClick={() => openView("notes")}
      >
        <BookOpen />
        {t("Field notebook", "खेत नोटबुक", "పొలం నోట్‌బుక్")}{" "}
        <span className="count">{entries.length}</span>
      </button>
    </nav>
  );
  return (
    <>
      <a className="skip" href="#main">
        {t("Skip to content", "सामग्री पर जाएँ", "విషయానికి వెళ్లండి")}
      </a>
      <header>
        <div className="bar">
          <a className="brand" href="#main" onClick={() => openView("desk")}>
            <b className="brand-mark" aria-hidden="true">
              <Sprout />
            </b>
            Krishi Chakra
          </a>
          {navigation}
          <div className="header-right">
            <span className={"network " + (online ? "on" : "off")}>
              {online
                ? t("Online", "ऑनलाइन", "ఆన్‌లైన్")
                : t("Offline", "ऑफ़लाइन", "ఆఫ్‌లైన్")}
            </span>
            <div className="language">
              <Languages aria-hidden="true" />
              <select
                aria-label="Language / भाषा / భాష"
                value={lang}
                onChange={(e) => {
                  voiceRef.current?.abort();
                  setVoiceMessage("");
                  setLang(e.target.value);
                }}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="te">తెలుగు</option>
              </select>
              <ChevronDown aria-hidden="true" />
            </div>
          </div>
        </div>
      </header>
      <main id="main">
        {storageError && (
          <p role="alert">
            {t(
              "Device storage unavailable. Allow site storage to save plans.",
              "डिवाइस स्टोरेज की अनुमति दें।",
              "పరికర నిల్వ అనుమతించండి.",
            )}
          </p>
        )}
        {view === "desk" ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow">
                  <CalendarDays aria-hidden="true" />
                  {new Intl.DateTimeFormat(lang + "-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                  }).format(new Date())}
                </span>
                <h1 tabIndex="-1">
                  {t("Your field desk", "आपका खेत डेस्क", "మీ పొలం డెస్క్")}
                </h1>
                <p>
                  {t(
                    "Turn crop observations, soil readings and harvest checks into a plan for your farm.",
                    "फसल के लक्षण, मिट्टी की जाँच और उपज की जानकारी से अपने खेत की योजना बनाएँ।",
                    "పంట లక్షణాలు, నేల వివరాలు, నాణ్యత ఆధారంగా మీ పొలానికి ప్రణాళిక రూపొందించండి.",
                  )}
                </p>
              </div>
              <div className="field-image" aria-hidden="true" />
            </section>
            <div className="workbench">
              <aside>
                <h2 className="rail-title">
                  {t("Field tools", "खेती के टूल", "సాగు సాధనాలు")}
                </h2>
                <label className="mobile-picker">
                  <LayoutGrid aria-hidden="true" />
                  <span>{t("Field tools", "खेती के टूल", "సాగు సాధనాలు")}</span>
                  <strong aria-hidden="true">
                    {toolText(tool, lang).title}
                  </strong>
                  <select
                    aria-label={t("Field tools", "खेती के टूल", "సాగు సాధనాలు")}
                    value={tool}
                    onChange={(e) => selectTool(e.target.value)}
                  >
                    {tools.map((key) => (
                      <option key={key} value={key}>
                        {toolText(key, lang).title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown aria-hidden="true" />
                </label>
                <div className="tool-list">
                  {tools.map((key) => {
                    const info = toolText(key, lang);
                    return (
                      <button
                        key={key}
                        className={"tool " + (key === tool ? "active" : "")}
                        aria-pressed={key === tool}
                        onClick={() => selectTool(key, true)}
                      >
                        <ToolIcon tool={key} />
                        <span>
                          <strong>{info.title}</strong>
                          <small>{info.desc}</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {(window.SpeechRecognition ||
                  window.webkitSpeechRecognition) && (
                  <button
                    className="text-button voice-nav"
                    onClick={navigateVoice}
                  >
                    <Mic aria-hidden="true" />
                    <span>
                      {t(
                        "Open a tool by voice",
                        "बोलकर टूल खोलें",
                        "మాటతో సాధనం తెరవండి",
                      )}
                    </span>
                  </button>
                )}
                <p role="status">{voiceMessage}</p>
              </aside>
              <FieldForm
                drafts={drafts}
                setDrafts={setDrafts}
                online={online}
                key={tool}
                tool={tool}
                lang={lang}
                t={t}
                onSubmit={submit}
              />
            </div>
          </>
        ) : (
          <NotebookView
            entries={entries}
            online={online}
            syncing={syncing}
            onSync={sync}
            onRemove={removePlan}
            onOpenDesk={() => openView("desk")}
            t={t}
          />
        )}
      </main>
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
if ("serviceWorker" in navigator && import.meta.env.PROD)
  navigator.serviceWorker.register("/sw.js").catch(() => {});
