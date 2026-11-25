import { local } from "../shared/fields.js";
import { resourcesFor } from "../shared/resources.js";

export function fieldGuide(input) {
  const t = (...words) => local(input.lang, ...words);
  const { tool, crop, observation, quality, water, ph } = input;
  const refs = resourcesFor(input);
  let title, summary, steps;
  if (tool === "crop") {
    title = crop + " · " + t("Field check", "खेत की जाँच", "పొలం పరిశీలన");
    summary = t(
      "These checks use your selected symptom. A cause needs confirmation.",
      "ये जाँचें आपके चुने लक्षण पर आधारित हैं। कारण की पुष्टि ज़रूरी है।",
      "మీరు ఎంచుకున్న లక్షణం ఆధారంగా ఈ సూచనలు. కారణాన్ని నిర్ధారించాలి.",
    );
    const first = {
      spots: t(
        "Photograph both sides of one spotted leaf and a healthy leaf nearby.",
        "धब्बे वाली पत्ती के दोनों ओर और पास की स्वस्थ पत्ती की तस्वीर लें।",
        "మచ్చలున్న ఆకు రెండు వైపులా, పక్కన ఆరోగ్యమైన ఆకును చిత్రీకరించండి.",
      ),
      wilting: t(
        "Check soil moisture beside a wilted plant and a healthy neighbour.",
        "मुरझाए और स्वस्थ पौधे के पास मिट्टी की नमी जाँचें।",
        "వాడిన మొక్క, ఆరోగ్యమైన మొక్క పక్కన నేల తేమ చూడండి.",
      ),
      damage: t(
        "Look under damaged leaves for visible feeding marks or insects.",
        "क्षतिग्रस्त पत्तों के नीचे कीट या खाने के निशान देखें।",
        "దెబ్బతిన్న ఆకుల కింద పురుగులు లేదా కొరికిన గుర్తులు చూడండి.",
      ),
      unsure: t(
        "Compare the newest leaves with older leaves. Note where symptoms start.",
        "नई और पुरानी पत्तियाँ देखकर लिखें कि लक्षण कहाँ शुरू हुए।",
        "కొత్త, పాత ఆకులను పోల్చి లక్షణాలు ఎక్కడ మొదలయ్యాయో రాయండి.",
      ),
    };
    steps = [
      first[observation],
      t(
        "Mark the affected patch and check its edges again tomorrow.",
        "प्रभावित हिस्से को चिह्नित करें और कल उसके किनारे फिर देखें।",
        "ప్రభావిత భాగాన్ని గుర్తించి రేపు దాని అంచులు చూడండి.",
      ),
      t(
        "Show your notes to the local KVK before choosing a treatment.",
        "उपचार चुनने से पहले स्थानीय कृषि विज्ञान केंद्र को अपने नोट दिखाएँ।",
        "చికిత్స ఎంచుకునే ముందు స్థానిక కృషి విజ్ఞాన కేంద్రానికి వివరాలు చూపండి.",
      ),
    ];
  } else if (tool === "soil") {
    title = crop + " · " + t("Soil plan", "मिट्टी की योजना", "నేల ప్రణాళిక");
    summary =
      ph == null
        ? t(
            "Add the pH and nutrient ratings printed on your soil card.",
            "कार्ड पर छपे पीएच और पोषक तत्वों के स्तर जोड़ें।",
            "కార్డుపై ఉన్న పీహెచ్, పోషక స్థాయులు నమోదు చేయండి.",
          )
        : "pH " +
          ph +
          " · " +
          (ph < 7
            ? t("acidic", "अम्लीय", "ఆమ్ల నేల")
            : ph > 7
              ? t("alkaline", "क्षारीय", "క్షార నేల")
              : t("neutral", "उदासीन", "తటస్థం"));
    const lows = ["n", "p", "k"]
      .filter((k) => input[k] === "low")
      .join(", ")
      .toUpperCase();
    steps = [
      lows
        ? lows +
          " · " +
          t(
            "Ask the soil lab for a crop-specific recommendation for these low ratings.",
            "इन कम स्तरों के लिए प्रयोगशाला से फसल-विशेष सलाह लें।",
            "ఈ తక్కువ స్థాయులకు పంటకు తగిన సలహా ల్యాబ్‌ను అడగండి.",
          )
        : t(
            "Use the lab recommendation and its units before planning inputs.",
            "खाद की योजना से पहले लैब की सिफारिश और इकाइयाँ देखें।",
            "ఎరువులు వేసే ముందు ల్యాబ్ సిఫార్సు, ప్రమాణాలు చూడండి.",
          ),
      water === "limited"
        ? t(
            "Compare locally suitable millets or pulses against the water available this season.",
            "उपलब्ध पानी के अनुसार स्थानीय बाजरा या दलहन के विकल्प जाँचें।",
            "అందుబాటులో ఉన్న నీటికి తగిన చిరుధాన్యాలు లేదా పప్పులను పోల్చండి.",
          )
        : t(
            "Check the irrigation schedule and local variety advice with your extension office.",
            "सिंचाई कार्यक्रम और किस्म के बारे में कृषि कार्यालय से पूछें।",
            "నీటి షెడ్యూలు, స్థానిక రకాల గురించి వ్యవసాయ కార్యాలయంలో అడగండి.",
          ),
      t(
        "Compare current local mandi arrivals and prices before deciding what to sow.",
        "बुआई से पहले स्थानीय मंडी की आवक और भाव जाँचें।",
        "విత్తే ముందు స్థానిక మార్కెట్ రాకలు, ధరలు పోల్చండి.",
      ),
    ];
  } else if (tool === "harvest") {
    title = crop + " · " + t("Lot inspection", "उपज की जाँच", "పంట నాణ్యత పరిశీలన");
    summary = t(
      "Indicative visual inspection. Official grading requires representative sampling and commodity-specific tests.",
      "यह शुरुआती दृश्य जाँच है। आधिकारिक ग्रेड के लिए प्रतिनिधि नमूना और उपज-विशेष परीक्षण चाहिए।",
      "ఇది ప్రాథమిక దృశ్య అంచనా. అధికారిక గ్రేడ్‌కు ప్రాతినిధ్య నమూనా, పంటకు తగిన పరీక్షలు అవసరం.",
    );
    steps = [
      quality === "debris"
        ? t(
            "Separate visible foreign matter and recheck a representative sample.",
            "दिखने वाले बाहरी पदार्थ हटाकर प्रतिनिधि नमूना फिर देखें।",
            "కనిపించే చెత్తను తొలగించి ప్రాతినిధ్య నమూనా మళ్లీ చూడండి.",
          )
        : quality === "mixed"
          ? t(
              "Separate visibly damaged or discoloured produce before sampling.",
              "नमूना लेने से पहले क्षतिग्रस्त या बदरंग उपज अलग करें।",
              "నమూనా తీసేముందు దెబ్బతిన్న లేదా రంగు మారిన ఉత్పత్తిని వేరు చేయండి.",
            )
          : t(
              "Take samples from several parts of the lot.",
              "ढेर के कई हिस्सों से नमूने लें।",
              "లోటులో పలు చోట్ల నుంచి నమూనాలు తీసుకోండి.",
            ),
      t(
        "Record damage, foreign matter, colour variation and visible spoilage separately.",
        "टूट-फूट, बाहरी पदार्थ, रंग में अंतर और दिखने वाली खराबी अलग दर्ज करें।",
        "దెబ్బలు, చెత్త, రంగు మార్పు, కనిపించే కుళ్లు విడిగా నమోదు చేయండి.",
      ),
      t(
        "Ask the buyer: “What is your rate per quintal, and which measured deduction applies to this lot?”",
        "खरीदार से पूछें: “प्रति क्विंटल भाव क्या है और किस माप के आधार पर कटौती होगी?”",
        "వ్యాపారిని అడగండి: “క్వింటాలు ధర ఎంత? ఏ కొలత ఆధారంగా కోత విధిస్తారు?”",
      ),
    ];
  } else {
    title = tool === "learn" ? input.topic : input.state;
    summary =
      tool === "learn"
        ? t(
            "Use these learning resources for your topic.",
            "अपने विषय के लिए ये शिक्षण संसाधन देखें।",
            "మీ అంశానికి ఈ అభ్యాస వనరులను చూడండి.",
          )
        : t(
            "These are leads based on your profile. The scheme authority confirms eligibility.",
            "ये विकल्प आपकी जानकारी पर आधारित हैं। पात्रता की पुष्टि योजना विभाग करेगा।",
            "మీ వివరాల ఆధారంగా ఈ పథకాలు చూడండి. అర్హతను శాఖ నిర్ధారిస్తుంది.",
          );
    steps = refs.slice(0, 3).map((ref) => ref.reason);
  }
  return { title, summary, steps, refs };
}
