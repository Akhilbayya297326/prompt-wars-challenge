import React, { useEffect, useRef, useState } from "react";
import {
  categories,
  nutrientBands,
  observations,
  qualities,
  waterOptions,
} from "../shared/fields.js";
import { optionLabels, toolText } from "./copy.js";
import { preparePhoto } from "./photo.js";

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
export function FieldForm({ tool, lang, t, onSubmit }) {
  const [form, setForm] = useState(initial);
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
  function field(key, label, attrs = {}) {
    return (
      <label>
        {label}
        <input
          value={form[key]}
          onChange={(e) => change(key, e.target.value)}
          {...attrs}
        />
      </label>
    );
  }
  function select(key, label, items) {
    return (
      <label>
        {label}
        <select value={form[key]} onChange={(e) => change(key, e.target.value)}>
          {items.map((value) => (
            <option key={value} value={value}>
              {optionLabels[value] ? t(...optionLabels[value]) : value}
            </option>
          ))}
        </select>
      </label>
    );
  }
  async function readPhoto(event) {
    const version = ++photoVersion.current;
    const file = event.target.files[0];
    change("photo", null);
    setMessage("");
    setReading(false);
    if (!file) return;
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
        <div>
          <span className="eyebrow">{info.name}</span>
          <h2 id="workflow-title" tabIndex="-1">
            {info.title}
          </h2>
        </div>
        <span aria-hidden="true" className="toolmark">
          {info.icon}
        </span>
      </div>
      <form onSubmit={submit}>
        <div className="grid">
          {["crop", "soil", "harvest"].includes(tool) &&
            field("crop", t("Crop", "फसल", "పంట"), {
              required: true,
              maxLength: 80,
              placeholder: t("e.g. Paddy", "जैसे धान", "ఉదా. వరి"),
            })}
          {tool === "crop" &&
            select(
              "observation",
              t("Main symptom", "मुख्य लक्षण", "ప్రధాన లక్షణం"),
              observations,
            )}
          {tool === "harvest" &&
            select(
              "quality",
              t("Lot condition", "उपज की स्थिति", "లోటు స్థితి"),
              qualities,
            )}
          {tool === "soil" && (
            <>
              {field("ph", t("Soil pH", "मिट्टी का pH", "నేల pH"), {
                type: "number",
                min: 0,
                max: 14,
                step: "any",
                placeholder: "0–14",
              })}
              {["n", "p", "k"].map((key, i) => (
                <React.Fragment key={key}>
                  {select(
                    key,
                    [
                      t("Nitrogen (N)", "नाइट्रोजन (N)", "నత్రజని (N)"),
                      t("Phosphorus (P)", "फास्फोरस (P)", "భాస్వరం (P)"),
                      t("Potassium (K)", "पोटैशियम (K)", "పొటాషియం (K)"),
                    ][i],
                    nutrientBands,
                  )}
                </React.Fragment>
              ))}
              {select(
                "water",
                t("Water supply", "पानी की उपलब्धता", "నీటి లభ్యత"),
                waterOptions,
              )}
              {navigator.geolocation && (
                <div className="wide">
                  <button
                    type="button"
                    className="text-button"
                    disabled={locating}
                    onClick={
                      form.location
                        ? () => change("location", undefined)
                        : locate
                    }
                  >
                    {form.location
                      ? t(
                          "Remove approximate location",
                          "अनुमानित स्थान हटाएँ",
                          "సుమారు స్థానాన్ని తొలగించండి",
                        )
                      : t(
                          "Use my approximate location for today’s rain forecast",
                          "आज के वर्षा पूर्वानुमान के लिए मेरा अनुमानित स्थान लें",
                          "ఈ రోజు వాన అంచనాకు నా సుమారు స్థానం వాడండి",
                        )}
                  </button>
                </div>
              )}
            </>
          )}
          {tool === "schemes" && (
            <>
              {field(
                "state",
                t(
                  "State or union territory",
                  "राज्य या केंद्र शासित प्रदेश",
                  "రాష్ట్రం లేదా కేంద్రపాలిత ప్రాంతం",
                ),
                { required: true, maxLength: 80 },
              )}
              {field(
                "land",
                t("Land area (hectares)", "भूमि क्षेत्र (हेक्टेयर)", "భూమి (హెక్టార్లు)"),
                { type: "number", min: 0, max: 10000, step: "any" },
              )}
              {select(
                "category",
                t("Social category", "सामाजिक वर्ग", "సామాజిక వర్గం"),
                categories,
              )}
            </>
          )}
          {tool === "learn" &&
            field("crop", t("Crop (optional)", "फसल (वैकल्पिक)", "పంట (ఐచ్ఛికం)"), {
              maxLength: 80,
            })}
        </div>
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
          <button className="text-button" type="button" onClick={dictate}>
            {listening
              ? t("Stop dictation", "बोलना बंद करें", "ఆపండి")
              : t("Dictate a note", "बोलकर लिखें", "మాట్లాడి నమోదు చేయండి")}
          </button>
        )}
        {["crop", "soil", "harvest"].includes(tool) && (
          <label className="upload">
            {t(
              "Attach a photo (optional)",
              "तस्वीर जोड़ें (वैकल्पिक)",
              "ఫోటో జోడించండి (ఐచ్ఛికం)",
            )}
            <small>JPEG / PNG / WebP · 12 MB</small>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={readPhoto}
            />
          </label>
        )}
        <p className="privacy">
          {t(
            "Creating a plan sends these details to the server and, when enabled, Gemini. Offline requests are kept on this device until sync.",
            "योजना बनाने पर ये विवरण सर्वर और सक्षम होने पर Gemini को भेजे जाते हैं। ऑफ़लाइन अनुरोध सिंक होने तक डिवाइस पर रहते हैं।",
            "ప్రణాళిక కోసం వివరాలు సర్వర్‌కు, అందుబాటులో ఉంటే Geminiకి వెళ్తాయి. ఆఫ్‌లైన్ అభ్యర్థనలు సింక్ అయ్యేవరకు పరికరంలో ఉంటాయి.",
          )}
        </p>
        <div role="status">{message}</div>
        <button
          type="submit"
          className="primary"
          disabled={busy || reading || locating}
        >
          {t("Create field plan", "खेत की योजना बनाएँ", "పొలం ప్రణాళిక రూపొందించండి")}
        </button>
      </form>
    </section>
  );
}
