// Keep external destinations under application control. The model cannot add links.
const catalogue = {
  telangana: {
    title: ["Rythu Bharosa", "रैतु भरोसा", "రైతు భరోసా"],
    url: "https://rythubharosa.telangana.gov.in/",
    reason: [
      "Check Telangana’s investment support and current land-record requirements.",
      "तेलंगाना की खेती सहायता और भूमि रिकॉर्ड की शर्तें देखें।",
      "తెలంగాణ సాగు పెట్టుబడి సాయం, భూమి రికార్డుల నిబంధనలు చూడండి.",
    ],
  },
  andhra: {
    title: ["Annadata Sukhibhava", "अन्नदाता सुखीभव", "అన్నదాత సుఖీభవ"],
    url: "https://tirupati.ap.gov.in/agriculture/",
    reason: [
      "See the Andhra Pradesh district agriculture office’s scheme guidance. Ask your local office which records apply to your holding.",
      "आंध्र प्रदेश के कृषि विभाग की योजना पढ़ें। ज़रूरी कागज़ात अपने स्थानीय कार्यालय से पूछें।",
      "ఆంధ్రప్రదేశ్ వ్యవసాయ శాఖ పథకం వివరాలు చూడండి. మీకు కావాల్సిన పత్రాల గురించి స్థానిక కార్యాలయంలో అడగండి.",
    ],
  },
  pension: {
    title: ["PM Kisan Maan-Dhan", "पीएम किसान मानधन", "పీఎం కిసాన్ మాన్‌ధన్"],
    url: "https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=159959&lang=1&reg=48",
    reason: [
      "Your reported area is within 2 ha. Check the 18–40 entry age, land records, contributions and exclusions for this voluntary pension.",
      "बताया गया रकबा 2 हेक्टेयर तक है। इस स्वैच्छिक पेंशन की प्रवेश आयु (18–40), भूमि रिकॉर्ड, अंशदान और अपात्रता की शर्तें जाँचें।",
      "మీరు తెలిపిన విస్తీర్ణం 2 హెక్టార్ల లోపల లేదా సమానంగా ఉంది. ఈ స్వచ్ఛంద పింఛనుకు వయసు (18–40), భూ రికార్డులు, చందా, ఇతర షరతులు చూడండి.",
    ],
  },
  income: {
    title: ["PM-KISAN", "पीएम-किसान", "పీఎం కిసాన్"],
    url: "https://pmkisan.gov.in/",
    reason: [
      "If your family owns cultivable land, check the recorded owner, exclusions and beneficiary status on the official portal.",
      "यदि परिवार के नाम खेती की ज़मीन है, तो पोर्टल पर भूमि रिकॉर्ड, अपात्रता की शर्तें और लाभार्थी की स्थिति जाँचें।",
      "మీ కుటుంబం పేరిట సాగుభూమి ఉంటే, భూ రికార్డులు, మినహాయింపులు, లబ్ధిదారు స్థితిని పోర్టల్‌లో చూడండి.",
    ],
  },
  directory: {
    title: [
      "Find schemes on myScheme",
      "myScheme पर योजनाएँ खोजें",
      "myScheme లో పథకాలు చూడండి",
    ],
    url: "https://www.myscheme.gov.in/",
    reason: [
      "Use your state and household category to narrow the list. The department confirms eligibility.",
      "राज्य और सामाजिक वर्ग के अनुसार योजनाएँ खोजें। पात्रता संबंधित विभाग तय करता है।",
      "మీ రాష్ట్రం, సామాజిక వర్గం ఆధారంగా పథకాలు వెతకండి. అర్హతను సంబంధిత శాఖ నిర్ధారిస్తుంది.",
    ],
  },
  soil: {
    title: ["Soil Health Card", "मृदा स्वास्थ्य कार्ड", "భూసార ఆరోగ్య కార్డు"],
    url: "https://soilhealth.dac.gov.in/",
    reason: [
      "Use your plot’s laboratory report and crop-specific nutrient advice when planning inputs.",
      "खाद की योजना बनाते समय अपने खेत की जाँच रिपोर्ट और फसल की सिफारिश देखें।",
      "ఎరువుల ప్రణాళికకు మీ పొలం భూసార పరీక్ష నివేదిక, పంటకు సూచించిన మోతాదులు చూడండి.",
    ],
  },
  assay: {
    title: ["e-NAM quality testing", "ई-नाम गुणवत्ता जाँच", "ఈ-నామ్ నాణ్యత పరీక్ష"],
    url: "https://enam.gov.in/commodity/assaying",
    reason: [
      "Ask the mandi assaying lab which tests apply to your lot before negotiating its price.",
      "भाव पर बात करने से पहले मंडी की प्रयोगशाला से पूछें कि आपकी उपज की कौन सी जाँच होती है।",
      "ధర మాట్లాడే ముందు మీ సరుకుకు ఏ పరీక్షలు చేస్తారో మార్కెట్ ప్రయోగశాలలో అడగండి.",
    ],
  },
  advice: {
    title: ["ICAR Farmers Corner", "आईसीएआर किसान कॉर्नर", "ఐసీఏఆర్ రైతు విభాగం"],
    url: "https://icar.gov.in/farmers-corner",
    reason: [
      "Find field advisories and ask your Krishi Vigyan Kendra to review symptoms in your crop.",
      "खेती की सलाह देखें और अपनी फसल के लक्षण नज़दीकी कृषि विज्ञान केंद्र में दिखाएँ।",
      "సాగు సూచనలు చూడండి. మీ పంటలోని లక్షణాలను సమీప కృషి విజ్ఞాన కేంద్రంలో చూపించండి.",
    ],
  },
  videos: {
    title: ["Search ICAR videos", "आईसीएआर के वीडियो खोजें", "ఐసీఏఆర్ వీడియోలు వెతకండి"],
    url: "https://www.youtube.com/c/IndianCouncilofAgriculturalResearchOfficial/search",
    reason: [
      "Search the council’s videos for your crop and learning topic. Languages and available videos vary.",
      "अपनी फसल और विषय पर परिषद के वीडियो खोजें। भाषा और उपलब्ध वीडियो बदल सकते हैं।",
      "మీ పంట, అంశంపై మండలి వీడియోలు వెతకండి. అందుబాటులో ఉన్న వీడియోలు, భాషలు మారవచ్చు.",
    ],
  },
};

const clean = (value) =>
  typeof value === "string" ? value.trim().slice(0, 160) : "";
const normalize = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[\s.\-]+/gu, "");

export function resourcesFor(input = {}) {
  const locale = ["en", "hi", "te"].indexOf(input.lang);
  const index = locale < 0 ? 0 : locale;
  const links = [];
  const add = (key) => {
    const { title, reason, url } = catalogue[key];
    links.push({ title: title[index], url, reason: reason[index] });
  };

  switch (input.tool) {
    case "schemes": {
      const state = normalize(input.state);
      if (["telangana", "తెలంగాణ", "तेलंगाना", "tg", "ts"].includes(state))
        add("telangana");
      if (["andhrapradesh", "ఆంధ్రప్రదేశ్", "आंध्रप्रदेश", "ap"].includes(state))
        add("andhra");
      // The directory can apply detailed category filters without disclosing them to any external site.
      const category = normalize(input.category);
      const categoryFirst = Boolean(
        category &&
        !["general", "unspecified", "prefernottosay"].includes(category),
      );
      if (categoryFirst) add("directory");
      const land = Number(input.land);
      if (land > 0 && land <= 2) add("pension");
      if (Number.isFinite(land) && land > 0) add("income");
      if (!categoryFirst) add("directory");
      break;
    }
    case "learn": {
      add("videos");
      const channel = new URL(links[0].url);
      const topic = [clean(input.crop), clean(input.topic)]
        .filter(Boolean)
        .join(" ");
      channel.searchParams.set(
        "query",
        topic || ["crop management", "फसल प्रबंधन", "పంట నిర్వహణ"][index],
      );
      links[0].url = channel.href;
      add("advice");
      break;
    }
    case "soil":
      add("soil");
      break;
    case "harvest":
      add("assay");
      break;
    case "crop":
      add("advice");
      break;
  }
  return links;
}
