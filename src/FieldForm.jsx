import React, { useEffect, useRef, useState } from "react";
import { WorkflowFields } from "./WorkflowFields.jsx";
import { toolText } from "./copy.js";
import { preparePhoto } from "./photo.js";
import { Camera, CloudOff, Mic, NotebookPen, Trash2 } from "lucide-react";
import { ToolIcon } from "./ToolIcon.jsx";

const initial = {
  crop: "",
  state: "",
  land: "",
  category: "general",
  topic: "",
  ph: "",
  n: "",
  p: "",
  k: "",
  water: "unknown",
  quality: "unsure",
  observation: "unsure",
  photo: null,
};
export function FieldForm({
  tool,
  lang,
  t,
  onSubmit,
  online,
  drafts,
  setDrafts,
}) {
  const form = drafts[tool] ?? initial;
  const setForm = (update) =>
    setDrafts((previous) => ({
      ...previous,
      [tool]: update(previous[tool] ?? initial),
    }));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [listening, setListening] = useState(false);
  const speech = useRef();
  const photoVersion = useRef(0);
  const fileRef = useRef();
  const info = toolText(tool, lang);
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
  useEffect(
    () => () => {
      speech.current?.abort();
      photoVersion.current++;
    },
    [],
  );
  const change = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  async function readPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    const version = ++photoVersion.current;
    setMessage("");
    setReading(true);
    try {
      const photo = await preparePhoto(file);
      if (version === photoVersion.current) change("photo", photo);
    } catch {
      if (version === photoVersion.current) {
        fileRef.current.value = "";
        setMessage(
          t(
            "Choose a readable JPEG, PNG or WebP up to 12 MB.",
            "12 MB तक की स्पष्ट JPEG, PNG या WebP चुनें।",
            "12 MB లోపు JPEG, PNG లేదా WebP ఎంచుకోండి.",
          ),
        );
      }
    } finally {
      if (version === photoVersion.current) setReading(false);
    }
  }
  function dictate() {
    if (listening) {
      speech.current?.stop();
      return;
    }
    const voice = new Speech();
    speech.current = voice;
    voice.lang = { en: "en-IN", hi: "hi-IN", te: "te-IN" }[lang];
    voice.onresult = (event) =>
      setForm((prev) => ({
        ...prev,
        topic: (prev.topic + " " + event.results[0][0].transcript)
          .trim()
          .slice(0, 600),
      }));
    voice.onend = () => setListening(false);
    voice.onerror = () => {
      setListening(false);
      setMessage(
        t(
          "Microphone unavailable. You can type below.",
          "माइक्रोफ़ोन उपलब्ध नहीं है। नीचे लिखें।",
          "మైక్రోఫోన్ అందుబాటులో లేదు. కింద టైప్ చేయండి.",
        ),
      );
    };
    try {
      voice.start();
      setListening(true);
    } catch {
      voice.onerror();
    }
  }
  function locate() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        change("location", {
          lat: Number(pos.coords.latitude.toFixed(2)),
          lon: Number(pos.coords.longitude.toFixed(2)),
        });
        setLocating(false);
        setMessage("");
      },
      () => {
        setLocating(false);
        setMessage(
          t(
            "Location unavailable. Continue with your soil readings.",
            "स्थान उपलब्ध नहीं है। मिट्टी के आँकड़ों से जारी रखें।",
            "స్థానం అందుబాటులో లేదు. నేల వివరాలతో కొనసాగండి.",
          ),
        );
      },
      { timeout: 8000 },
    );
  }
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await onSubmit({ ...form, tool, lang, id: crypto.randomUUID() });
    } catch {
      setMessage(
        t(
          "Could not save on this device. Check available storage and try again.",
          "डिवाइस पर सहेजना विफल रहा। खाली जगह जाँचें।",
          "ఈ పరికరంలో భద్రపరచడం విఫలమైంది. ఖాళీ స్థలం చూడండి.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="sheet" id="field-form" aria-labelledby="workflow-title">
      <div className="sheet-head">
        <ToolIcon tool={tool} />
        <div>
          <span className="eyebrow">{info.name}</span>
          <h2 id="workflow-title" tabIndex="-1">
            {info.title}
          </h2>
        </div>
      </div>
      <form onSubmit={submit}>
        <WorkflowFields
          tool={tool}
          form={form}
          t={t}
          change={change}
          locate={locate}
          locating={locating}
        />
        <label>
          {tool === "learn"
            ? t(
                "What would you like to learn?",
                "आप क्या सीखना चाहते हैं?",
                "ఏమి నేర్చుకోవాలనుకుంటున్నారు?",
              )
            : t(
                "Field notes (optional)",
                "खेत के नोट (वैकल्पिक)",
                "పొలం వివరాలు (ఐచ్ఛికం)",
              )}
          <textarea
            rows="3"
            maxLength="600"
            required={tool === "learn"}
            value={form.topic}
            onChange={(e) => change("topic", e.target.value)}
          />
        </label>
        {Speech && (
          <button
            className="text-button dictate"
            type="button"
            onClick={dictate}
          >
            <Mic aria-hidden="true" />
            {listening
              ? t("Stop dictation", "बोलना बंद करें", "ఆపండి")
              : t("Dictate a note", "बोलकर लिखें", "మాట్లాడి నమోదు చేయండి")}
          </button>
        )}
        {["crop", "soil", "harvest"].includes(tool) && (
          <div className="attachment">
            <label className="upload">
              {form.photo ? (
                <img src={form.photo} alt="" />
              ) : (
                <span className="upload-icon">
                  <Camera aria-hidden="true" />
                </span>
              )}
              <span>
                <strong>
                  {form.photo
                    ? t("Change photo", "तस्वीर बदलें", "ఫోటో మార్చండి")
                    : t(
                        "Attach a photo (optional)",
                        "तस्वीर जोड़ें (वैकल्पिक)",
                        "ఫోటో జోడించండి (ఐచ్ఛికం)",
                      )}
                </strong>
                <small>
                  {reading
                    ? t(
                        "Preparing photo…",
                        "तस्वीर तैयार हो रही है…",
                        "ఫోటో సిద్ధమవుతోంది…",
                      )
                    : form.photo
                      ? t("Photo attached", "तस्वीर जुड़ गई", "ఫోటో జోడించబడింది")
                      : "JPEG / PNG / WebP · 12 MB"}
                </small>
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={readPhoto}
              />
            </label>
            {form.photo && (
              <button
                type="button"
                className="photo-remove"
                onClick={() => {
                  photoVersion.current++;
                  fileRef.current.value = "";
                  change("photo", null);
                  setReading(false);
                }}
                aria-label={t("Remove photo", "तस्वीर हटाएँ", "ఫోటో తొలగించండి")}
              >
                <Trash2 aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <p className="privacy">
          {t(
            "Creating a plan sends these details to the server and, when enabled, Gemini. Offline requests are kept on this device until sync.",
            "योजना बनाने पर ये विवरण सर्वर और सक्षम होने पर Gemini को भेजे जाते हैं। ऑफ़लाइन अनुरोध सिंक होने तक डिवाइस पर रहते हैं।",
            "ప్రణాళిక కోసం వివరాలు సర్వర్‌కు, అందుబాటులో ఉంటే Geminiకి వెళ్తాయి. ఆఫ్‌లైన్ అభ్యర్థనలు సింక్ అయ్యేవరకు పరికరంలో ఉంటాయి.",
          )}
        </p>
        <output>{message}</output>
        <button
          type="submit"
          className="primary"
          disabled={busy || reading || locating}
        >
          {online ? (
            <NotebookPen aria-hidden="true" />
          ) : (
            <CloudOff aria-hidden="true" />
          )}
          {busy
            ? t("Saving…", "सहेजा जा रहा है…", "భద్రపరుస్తోంది…")
            : online
              ? t(
                  "Create field plan",
                  "खेत की योजना बनाएँ",
                  "పొలం ప్రణాళిక రూపొందించండి",
                )
              : t("Save offline", "ऑफ़लाइन सहेजें", "ఆఫ్‌లైన్‌లో భద్రపరచండి")}
        </button>
      </form>
    </section>
  );
}
