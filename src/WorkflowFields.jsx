import React from "react";
import {
  categories,
  nutrientBands,
  observations,
  qualities,
  waterOptions,
} from "../shared/fields.js";
import { optionLabels } from "./copy.js";
export function WorkflowFields({ tool, form, t, change, locate, locating }) {
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
  return (
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
                  form.location ? () => change("location", undefined) : locate
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
  );
}
