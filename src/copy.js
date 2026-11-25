import { local } from "../shared/fields.js";
export const definitions = {
  crop: [
    "Dr. Akhil",
    "Crop health",
    "फसल स्वास्थ्य",
    "పంట ఆరోగ్యం",
    "Read the signs in your crop.",
    "फसल के लक्षण समझें।",
    "పంట లక్షణాలు తెలుసుకోండి.",
  ],
  soil: [
    "Smart AgriCore",
    "Soil & water",
    "मिट्टी और पानी",
    "నేల, నీరు",
    "Plan from your soil card.",
    "मिट्टी कार्ड से योजना बनाएँ।",
    "నేల కార్డుతో ప్రణాళిక సిద్ధం చేయండి.",
  ],
  harvest: [
    "Harvest Grader",
    "Harvest quality",
    "उपज की गुणवत्ता",
    "పంట నాణ్యత",
    "Inspect a lot before sale.",
    "बिक्री से पहले उपज जाँचें।",
    "అమ్మకానికి ముందే పంటను పరిశీలించండి.",
  ],
  schemes: [
    "Yojana Setu",
    "Scheme finder",
    "योजना खोज",
    "పథకాల శోధన",
    "Find schemes for your farm.",
    "अपने खेत के लिए योजनाएँ खोजें।",
    "మీ పొలానికి పథకాలు కనుగొనండి.",
  ],
  learn: [
    "Vidya Vani",
    "Learning library",
    "ज्ञान केंद्र",
    "విజ్ఞాన కేంద్రం",
    "Explore a farming question.",
    "खेती से जुड़ा सवाल पूछें।",
    "సాగు గురించి ప్రశ్న అడగండి.",
  ],
};
export function toolText(key, lang) {
  const [name, en, hi, te, de, dh, dt] = definitions[key];
  return {
    name,
    title: local(lang, en, hi, te),
    desc: local(lang, de, dh, dt),
  };
}
export const optionLabels = {
  unsure: ["Unsure", "पता नहीं", "తెలియదు"],
  spots: ["Leaf spots", "पत्तों पर धब्बे", "ఆకులపై మచ్చలు"],
  wilting: ["Wilting", "मुरझाना", "వాడిపోవడం"],
  damage: ["Visible damage", "दिखने वाली क्षति", "కనిపించే నష్టం"],
  uniform: ["Uniform lot", "एक समान उपज", "ఒకే రకమైన లోటు"],
  mixed: ["Mixed colour or damage", "मिश्रित रंग या क्षति", "రంగు మార్పు లేదా నష్టం"],
  debris: ["Foreign matter", "बाहरी पदार्थ", "చెత్త / ఇతర పదార్థాలు"],
  unknown: ["Unknown", "अज्ञात", "తెలియదు"],
  limited: ["Limited water", "सीमित पानी", "పరిమిత నీరు"],
  assured: ["Assured irrigation", "सुनिश्चित सिंचाई", "నమ్మకమైన నీటిపారుదల"],
  "": ["Unrecorded", "दर्ज नहीं", "నమోదు కాలేదు"],
  low: ["Low", "कम", "తక్కువ"],
  medium: ["Medium", "मध्यम", "మధ్యస్థం"],
  high: ["High", "उच्च", "అధికం"],
  general: ["General / unspecified", "सामान्य / अनिर्दिष्ट", "సాధారణ / పేర్కొనలేదు"],
};
