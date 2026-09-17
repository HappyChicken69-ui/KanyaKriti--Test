export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कश्मीरी' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mni', name: 'Manipuri (Meitei)', nativeName: 'মৈতৈলোন / ꯃꯤꯇꯩ ꯂꯣꯟ' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'sd', name: 'Sindhi', nativeName: 'सिन्धी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
];

export interface ArtisanVoiceQuote {
  text: string;
  translation: string;
  author: string;
}

export const ARTISAN_VOICE_QUOTES: Record<string, ArtisanVoiceQuote> = {
  en: {
    text: '“I make customized macrame wall hangings and eco-friendly home decor right from my living room...”',
    translation: '"Crafting artisanal macrame and zero-waste home decor right from home..."',
    author: 'Rekha Sharma — Fiber Artist',
  },
  as: {
    text: '“মোৰ নাম জয়ন্তী। মই ঘৰতে মুগা ৰেচম আৰু মেখেলা চাদৰৰ হস্ততাঁতৰ সূক্ষ্ম বোৱা কাম কৰোঁ...”',
    translation: '"My name is Jayanti. I hand-weave authentic Muga silk and Mekhela Chador traditional wear at home..."',
    author: 'Jayanti Saikia — Muga Handloom Weaver',
  },
  bn: {
    text: '“আমার নাম শিপ্রা। আমি কাঁথাস্টীচ ও হস্তশিল্পের নকশা তৈরি করি, যাতে ঘরোয়া মহিলারা নিজেদের পায়ে দাঁড়াতে পারে...”',
    translation: '"My name is Shipra. I design authentic Kantha stitch embroidery and traditional crafts from home..."',
    author: 'Shipra Banerjee — Kantha Stitch Artisan',
  },
  brx: {
    text: '“आंनि मुङा अन्जली। आं नखरनिफ्रायनो दखना आरो आरनाय गांदो गांदो दानानै खालामो...”',
    translation: '"My name is Anjali. I weave traditional Bodo Dokhona and handloom textiles right from home..."',
    author: 'Anjali Basumatary — Traditional Textile Weaver',
  },
  doi: {
    text: '“मेरा नां वीना डोगरा ऐ। मैं घरे च कसीदाकारी ते डोगरी लोक-शिल्प दा कम्म करदी आं...”',
    translation: '"My name is Veena Dogra. I craft authentic Dogri embroidery and needlework items right from home..."',
    author: 'Veena Dogra — Traditional Needlework Artisan',
  },
  gu: {
    text: '“મારું નામ ગીતાબેન છે. હું ઘરેથી બાંધણી અને કચ્છી ભરતકામનાં કુર્તા અને સાડીઓ તૈયાર કરું છું...”',
    translation: '"My name is Gitaben. I specialize in traditional Kutchi mirror work and Bandhani craft at home..."',
    author: 'Gitaben Patel — Bandhani & Mirror Work Artisan',
  },
  hi: {
    text: '“मेरा नाम सुनीता देवी है। मैं 10 साल से ब्लाउज फिटिंग, फॉल-पीको और कस्टमाइज्ड ड्रेस मेकिंग करती हूँ...”',
    translation: '"My name is Sunita Devi. I have done blouse alterations, custom tailoring, and fall-piko for 10 years..."',
    author: 'Sunita Devi — Tailor & Alteration Specialist',
  },
  kn: {
    text: '“ನನ್ನ ಹೆಸರು ಮೀನಾಕ್ಷಿ. ಮನೆ ತಿಂಡಿ ಮತ್ತು ಬಿಸಿ ರಾಗಿ ಮುದ್ದೆ ಊಟ ಮಾಡ್ತೀನಿ, ತಾಜಾ ಶುದ್ಧ ಸಾಮಗ್ರಿಗಳೊಂದಿಗೆ...”',
    translation: '"My name is Meenakshi. I prepare homestyle fresh tiffins and ragi mudde meals with pure ingredients..."',
    author: 'Meenakshi Sundaram — Homestyle Kitchen Maker',
  },
  ks: {
    text: '“म्योन नाव छु शमीमा। बु छुस गरुमंज कश्मीरी सोज़नी कशीदाकारी त पश्मीना शालन प्यठ काम करान...”',
    translation: '"My name is Shamima. I hand-embroider authentic Kashmiri Sozni needlework and Pashmina shawls from home..."',
    author: 'Shamima Akhtar — Sozni Embroidery Artisan',
  },
  kok: {
    text: '“म्हाजें नांव सुजाता। हांव घरांतसून गोंयचे पारंपारिक खावचे पदार्थ आनी सुक्या मसल्यांचे पॅकेट तयार करतां...”',
    translation: '"My name is Sujata. I prepare traditional Goan festive delicacies and authentic ground spice blends..."',
    author: 'Sujata Kamat — Traditional Culinary Maker',
  },
  mai: {
    text: '“हमर नाम पूनम कुमारी अछि। हम मिथिला चित्रकला (मधुबनी पेंटिंग) हाथ सं साड़ी आ कैनवास पर बनबैत छी...”',
    translation: '"My name is Poonam Kumari. I paint authentic Mithila / Madhubani art on fabrics, sarees, and handmade paper..."',
    author: 'Poonam Kumari — Madhubani Painting Artist',
  },
  ml: {
    text: '“എന്റെ പേര് രാധിക. ഞാൻ വീട്ടിലിരുന്ന് കസവു സാരി ഡിസൈനിംഗും പരമ്പരാഗത തുന്നൽവേലകളും ചെയ്യുന്നു...”',
    translation: '"My name is Radhika. I specialize in traditional Kasavu saree designing, embroidery, and custom tailoring..."',
    author: 'Radhika Nair — Traditional Kasavu Designer',
  },
  mni: {
    text: '“ঐহাক্কী মিং লাইশ্রম ইবেমা কৌই। ঐহাক য়ুমদা লৈদুনা ইনাক্কা ফী অমসুং খোইরাম্পাক ফী শাবা হোৎনৈ...”',
    translation: '"My name is Laishram Ibema. I hand-weave indigenous Manipuri handloom shawls and traditional patterns..."',
    author: 'Laishram Ibema — Indigenous Handloom Weaver',
  },
  mr: {
    text: '“माझं नाव वंदना मोरे. मी घरगुती अस्सल मालवणी मसाले आणि हातमागावर शिवलेली नऊवारी कापडी पिशव्या तयार करते...”',
    translation: '"My name is Vandana More. I create authentic homemade Maharashtrian spices and handmade fabric goods..."',
    author: 'Vandana More — Culinary & Fabric Artisan',
  },
  ne: {
    text: '“मेरो नाम माया तामाङ हो। म घरैमा बसेर परम्परागत ढाका बुनाई र हस्तकलाका कपडाहरू तयार गर्छु...”',
    translation: '"My name is Maya Tamang. I create traditional handwoven Dhaka textiles and handcrafted apparel from home..."',
    author: 'Maya Tamang — Handloom Dhaka Weaver',
  },
  or: {
    text: '“ମୋ ନାମ କବିତା ସାହୁ। ମୁଁ ପିପିଲି ଚାନ୍ଦୁଆ ଶିଳ୍ପ (ଆପ୍ଲିକ କାର୍ଯ୍ୟ) ଓ ଝୋଟ ବ୍ୟାଗ ହାତରେ ତିଆରି କରେ...”',
    translation: '"My name is Kabita Sahu. I craft authentic Pipli Chandua applique heritage art and eco-friendly jute goods..."',
    author: 'Kabita Sahu — Pipli Applique Artisan',
  },
  pa: {
    text: '“ਮੇਰਾ ਨਾਮ ਕੁਲਵਿੰਦਰ ਕੌਰ ਹੈ। ਮੈਂ ਪੰਜਾਬੀ ਫੁਲਕਾਰੀ ਅਤੇ ਰਵਾਇਤੀ ਕਢਾਈ ਵਾਲੇ ਦੁਪੱਟੇ ਹੱਥੀਂ ਤਿਆਰ ਕਰਦੀ ਹਾਂ...”',
    translation: '"My name is Kulwinder Kaur. I hand-embroider authentic Punjabi Phulkari dupattas and bridal suits..."',
    author: 'Kulwinder Kaur — Phulkari Heritage Artisan',
  },
  sa: {
    text: '“मम नाम गायत्री अस्ति। अहं गृहादेव पारम्परिक-हस्तशिल्पं मङ्गल-वस्तूनि च सज्जीकरोमि...”',
    translation: '"My name is Gayatri. I handcraft traditional heritage items, sacred puja decor, and natural festive crafts..."',
    author: 'Gayatri Joshi — Heritage Crafts Maker',
  },
  sat: {
    text: '“ᱤᱧᱟᱜ ᱧᱩᱛᱩᱢ ᱫᱚ ᱢᱟᱞᱚᱛᱤ ᱢᱩᱨᱢᱩ। ᱤᱧ ᱚᱲᱟᱜ ᱠᱷᱚᱱ ᱜᱮ ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮᱧ ᱞᱩᱜᱽᱲᱤ ᱟᱨ ᱦᱟᱥᱟ ᱨᱮᱭᱟᱜ ᱵᱟᱦᱟ ᱴᱩᱠᱩᱪ ᱵᱮᱱᱟᱣ ᱮᱫᱟ...”',
    translation: '"My name is Maloti Murmu. I handcraft indigenous Santali textiles, terracotta planters, and home crafts..."',
    author: 'Maloti Murmu — Indigenous Craft Maker',
  },
  sd: {
    text: '“منهنجو نالو ڪوشليا آهي. مان گهر ويٺي سنڌي ڀرت، اجرڪ ۽ هٿ جا ٺهيل ڪپڙا تيار ڪندي آهيان...”',
    translation: '"My name is Kaushalya. I craft intricate traditional Sindhi embroidery, mirror crafts, and handwoven textiles..."',
    author: 'Kaushalya Advani — Sindhi Needlework Artisan',
  },
  ta: {
    text: '“என் பெயர் லக்ஷ்மி. நான் ஆரி எம்பிராய்டரி மற்றும் பட்டுப் புடவை பிளவுஸ் டிசைன்கள் சொந்தமாக செய்கிறேன்...”',
    translation: '"My name is Lakshmi. I craft fine Aari hand-embroidery and bridal silk saree blouse designs from home..."',
    author: 'Lakshmi V. — Aari & Zari Artisan',
  },
  te: {
    text: '“నా పేరు పద్మావతి. నేను మగ్గంపై కలంకారీ, ఎంబ్రాయిడరీ మరియు ఇంట్లోనే శుద్ధమైన ఆంధ్రా పిండివంటలు తయారు చేస్తాను...”',
    translation: '"My name is Padmavathi. I craft authentic Kalamkari embroidery and traditional homestyle Andhra savories..."',
    author: 'Padmavathi R. — Kalamkari & Food Artisan',
  },
  ur: {
    text: '“میرا نام رخصانہ بانو ہے۔ میں گھر بیٹھے زردوزی کا نفیس کام اور ہاتھ سے بنی دستکاریاں تیار کرتی ہوں...”',
    translation: '"My name is Rukhsana Bano. I handcraft fine Zardozi embroidery, intricate needlework, and customized apparel..."',
    author: 'Rukhsana Bano — Zardozi & Needlecraft Artisan',
  },
};

export const LANGUAGE_SPEECH_CODES: Record<string, string> = {
  en: 'en-IN',
  as: 'as-IN',
  bn: 'bn-IN',
  brx: 'brx-IN',
  doi: 'doi-IN',
  gu: 'gu-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  ks: 'ks-IN',
  kok: 'kok-IN',
  mai: 'mai-IN',
  ml: 'ml-IN',
  mni: 'mni-IN',
  mr: 'mr-IN',
  ne: 'ne-NP',
  or: 'or-IN',
  pa: 'pa-IN',
  sa: 'sa-IN',
  sat: 'sat-IN',
  sd: 'sd-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  ur: 'ur-IN',
};

export function getSpeechLanguageCode(langCode: string): string {
  return LANGUAGE_SPEECH_CODES[langCode] || 'en-IN';
}

export interface VoiceSamplePrompt {
  label: string;
  category: string;
  text: string;
}

export const ARTISAN_VOICE_SAMPLE_PROMPTS: Record<string, VoiceSamplePrompt[]> = {
  en: [
    {
      label: 'Blouse Alteration',
      category: 'Tailoring',
      text: 'I do blouse alterations and fitting. I charge 250 rupees and can deliver it by tomorrow evening.',
    },
    {
      label: 'Home Tiffin Service',
      category: 'Cooking',
      text: 'I prepare fresh home-cooked thali with roti, dal, sabzi, and rice. 140 rupees per meal, ready in 45 minutes.',
    },
    {
      label: 'Handmade Toran & Crafts',
      category: 'Handicrafts',
      text: 'I handcraft traditional festive torans and pearl door hangings. Price is 350 rupees each, available in 1 day.',
    },
  ],
  hi: [
    {
      label: 'ब्लाउज सिलाई व फिटिंग',
      category: 'Tailoring',
      text: 'मैं ब्लाउज की सिलाई और फिटिंग करती हूँ। ₹250 लेती हूँ और कल शाम तक तैयार कर दूंगी।',
    },
    {
      label: 'घर का शुद्ध टिफिन',
      category: 'Cooking',
      text: 'मैं घर का शुद्ध शाकाहारी खाना बनाती हूँ। 4 रोटी, दाल, मौसमी सब्जी और चावल ₹140 में। 45 मिनट में तैयार।',
    },
    {
      label: 'हाथ से बना तोरण',
      category: 'Handicrafts',
      text: 'मैं हाथ से मोतियों और गोटे का सुंदर तोरण बनाती हूँ। ₹350 प्रति पीस और 1 दिन में तैयार कर दूंगी।',
    },
  ],
  bn: [
    {
      label: 'ব্লাউজ ফিটিং ও সেলাই',
      category: 'Tailoring',
      text: 'আমি ব্লাউজ ফিটিং এবং সেলাইয়ের কাজ করি। ২৫০ টাকা নেব এবং কাল সন্ধ্যার মধ্যে তৈরি করে দেব।',
    },
    {
      label: 'ঘরের তৈরি খাবার',
      category: 'Cooking',
      text: 'আমি বাড়িতে তৈরি টাটকা বাঙালি নিরামিষ থালি তৈরি করি। ভাত, ডাল ও তরকারি ১৪০ টাকায় ৪৫ মিনিটে তৈরি।',
    },
    {
      label: 'হাতের তৈরি কাঁথা নকশা',
      category: 'Handicrafts',
      text: 'আমি সুতির কাপড়ে কাঁথাস্টীচের অপূর্ব নকশার ব্যাগ ও শাল বানাই। প্রতিটির দাম ৩৫০ টাকা।',
    },
  ],
  te: [
    {
      label: 'బ్లౌజ్ కుట్లు & ఆల్టరేషన్',
      category: 'Tailoring',
      text: 'నేను బ్లౌజ్ కుట్లు మరియు పర్ఫెక్ట్ ఫిట్టింగ్ ఆల్టరేషన్ చేస్తాను. ₹250 ఛార్జ్ చేస్తాను, రేపటికల్లా ఇస్తాను.',
    },
    {
      label: 'ఇంటి భోజనం & టిఫిన్',
      category: 'Cooking',
      text: 'నేను ఇంట్లోనే శుద్ధమైన ఆంధ్రా భోజనం తయారు చేస్తాను. అన్నం, పప్పు, కూర ₹140కి 45 నిమిషాల్లో సిద్ధం.',
    },
    {
      label: 'కలంకారీ చేతిపనులు',
      category: 'Handicrafts',
      text: 'నేను అందమైన కలంకారీ బ్యాగులు మరియు గృహ అలంకరణ వస్తువులు తయారు చేస్తాను. ఒక్కొక్కటి ₹350.',
    },
  ],
  ta: [
    {
      label: 'பிளவுஸ் தையல் & பிட்டிங்',
      category: 'Tailoring',
      text: 'நான் பிளவுஸ் தையல் மற்றும் அளவுகள் சரிசெய்து தருகிறேன். ₹250 கட்டணம், நாளைக்குள் முடித்துக் கொடுப்பேன்.',
    },
    {
      label: 'வீட்டு சமையல் & டிபன்',
      category: 'Cooking',
      text: 'நான் சுத்தமான வீட்டு முறை மதிய உணவு தயார் செய்கிறேன். சாம்பார், சாதம், பொரியல் ₹140. 45 நிமிடங்களில் தயார்.',
    },
    {
      label: 'ஆரி எம்பிராய்டரி',
      category: 'Handicrafts',
      text: 'நான் புடவைகளுக்கு கைவேலைப்பாடு ஆரி எம்பிராய்டரி செய்கிறேன். ஒரு வேலைக்கு ₹350, ஒரு நாளில் தயார்.',
    },
  ],
  kn: [
    {
      label: 'ಬ್ಲೌಸ್ ಹೊಲಿಗೆ & ಫಿಟ್ಟಿಂಗ್',
      category: 'Tailoring',
      text: 'ನಾನು ಬ್ಲೌಸ್ ಹೊಲಿಗೆ ಮತ್ತು ಅಲ್ಟರೇಷನ್ ಮಾಡ್ತೀನಿ. ₹250 ತಗೊಳ್ತೀನಿ ಮತ್ತು ನಾಳೆ ಸಂಜೆಗೆ ರೆಡಿ ಮಾಡಿಕೊಡ್ತೀನಿ.',
    },
    {
      label: 'ಮನೆ ಊಟ ಮತ್ತು ತಿಂಡಿ',
      category: 'Cooking',
      text: 'ನಾನು ಶುದ್ಧ ಮತ್ತು ರುಚಿಕರವಾದ ಮನೆ ಊಟ ಸಿದ್ಧಪಡಿಸುತ್ತೇನೆ. ರೊಟ್ಟಿ, ಪಲ್ಯ, ಅನ್ನ ಸಾಂಬಾರ್ ₹140. 45 ನಿಮಿಷಗಳಲ್ಲಿ ಸಿದ್ಧ.',
    },
    {
      label: 'ಹಸ್ತಕಲೆ ಮತ್ತು ತೋರಣ',
      category: 'Handicrafts',
      text: 'ನಾನು ಕೈಯಿಂದ ಸುಂದರವಾದ ಮುತ್ತಿನ ತೋರಣ ಮತ್ತು ಬಾಗಿಲು ಅಲಂಕಾರಗಳನ್ನು ಮಾಡುತ್ತೇನೆ. ಒಂದಕ್ಕೆ ₹350.',
    },
  ],
  mr: [
    {
      label: 'ब्लाउज शिलाई व फिटिंग',
      category: 'Tailoring',
      text: 'मी ब्लाउज शिलाई आणि अचूक फिटिंगचे काम करते. ₹२५० आकारते आणि उद्या संध्याकाळपर्यंत तयार करून देईन.',
    },
    {
      label: 'घरगुती रुचकर डबा',
      category: 'Cooking',
      text: 'मी अस्सल घरगुती पद्धतीचे जेवण बनवते. चपाती, भाजी, डाळ, भात ₹१४० मध्ये. ४५ मिनिटांत तयार.',
    },
    {
      label: 'हस्तनिर्मित तोरण व वस्तू',
      category: 'Handicrafts',
      text: 'मी हाताने बनवलेले मोत्यांचे पारंपरिक तोरण तयार करते. एका तोरणाची किंमत ₹३५० आहे.',
    },
  ],
  gu: [
    {
      label: 'બ્લાઉઝ સિલાઈ અને અલ્ટરેશન',
      category: 'Tailoring',
      text: 'હું બ્લાઉઝ સિલાઈ અને ફિટિંગનું કામ કરું છું. ₹250 ચાર્જ કરું છું અને કાલ સાંજ સુધીમાં તૈયાર કરી આપીશ.',
    },
    {
      label: 'ઘરનું શુદ્ધ ભોજન',
      category: 'Cooking',
      text: 'હું ઘેરથી બનાવેલું શુદ્ધ ગુજરાતી ભોજન આપું છું. રોટલી, શાક, દાળ, ભાત ₹140. 45 મિનિટમાં તૈયાર.',
    },
    {
      label: 'બાંધણી અને ભરતકામ',
      category: 'Handicrafts',
      text: 'હું હાથથી કચ્છી ભરતકામના તોરણ અને થેલીઓ બનાવું છું. એક પીસ ₹350 અને 1 દિવસમાં મળી જશે.',
    },
  ],
  ml: [
    {
      label: 'ബ്ലൗസ് തയ്യൽ & ഫിറ്റിംഗ്',
      category: 'Tailoring',
      text: 'ഞാൻ ബ്ലൗസ് തയ്യലും ആൾട്ടറേഷനും ചെയ്യുന്നു. ₹250 ഈടാക്കും, നാളെ വൈകുന്നേരത്തേക്ക് പൂർത്തിയാക്കി നൽകും.',
    },
    {
      label: 'വീട്ടുഭക്ഷണം',
      category: 'Cooking',
      text: 'ഞാൻ നല്ല നാടൻ ഊണ് വീട്ടിൽ തയ്യാറാക്കുന്നു. ചോറ്, സാമ്പാർ, തോരൻ ₹140. 45 മിനിറ്റിൽ റെഡി.',
    },
    {
      label: 'കരകൗശല ഉൽപ്പന്നങ്ങൾ',
      category: 'Handicrafts',
      text: 'ഞാൻ കൈകൊണ്ട് തുന്നിയ പരമ്പരാഗത അലങ്കാര വസ്തുക്കൾ നിർമ്മിക്കുന്നു. ഒന്നിന് ₹350.',
    },
  ],
  pa: [
    {
      label: 'ਬਲਾਊਜ਼ ਸਿਲਾਈ ਅਤੇ ਫਿਟਿੰਗ',
      category: 'Tailoring',
      text: 'ਮੈਂ ਬਲਾਊਜ਼ ਸਿਲਾਈ ਅਤੇ ਅਲਟਰੇਸ਼ਨ ਦਾ ਕੰਮ ਕਰਦੀ ਹਾਂ। ₹250 ਲੈਂਦੀ ਹਾਂ ਅਤੇ ਕੱਲ੍ਹ ਸ਼ਾਮ ਤੱਕ ਤਿਆਰ ਕਰ ਦੇਵਾਂਗੀ।',
    },
    {
      label: 'ਘਰ ਦਾ ਸ਼ੁੱਧ ਖਾਣਾ',
      category: 'Cooking',
      text: 'ਮੈਂ ਘਰ ਦਾ ਬਣਿਆ ਤਾਜ਼ਾ ਸ਼ਾਕਾਹਾਰੀ ਖਾਣਾ ਬਣਾਉਂਦੀ ਹਾਂ। ਰੋਟੀ, ਦਾਲ, ਸਬਜ਼ੀ ₹140. 45 ਮਿੰਟ ਵਿੱਚ ਤਿਆਰ।',
    },
    {
      label: 'ਫੁਲਕਾਰੀ ਦੁਪੱਟੇ',
      category: 'Handicrafts',
      text: 'ਮੈਂ ਹੱਥੀਂ ਕਢਾਈ ਵਾਲੀ ਫੁਲਕਾਰੀ ਅਤੇ ਸੂਟ ਤਿਆਰ ਕਰਦੀ ਹਾਂ। ਕੀਮਤ ₹350 ਹੈ।',
    },
  ],
  or: [
    {
      label: 'ବ୍ଲାଉଜ୍ ସିଲାଇ ଓ ଫିଟିଙ୍ଗ୍',
      category: 'Tailoring',
      text: 'ମୁଁ ବ୍ଲାଉଜ୍ ସିଲାଇ ଏବଂ ଅଲ୍ଟରେସନ୍ କରେ। ₹୨୫୦ ନେବି ଏବଂ କାଲି ସନ୍ଧ୍ୟା ସୁଦ୍ଧା ତିଆରି କରିଦେବି।',
    },
    {
      label: 'ଘରୋଇ ଖାଦ୍ୟ ଥାଳି',
      category: 'Cooking',
      text: 'ମୁଁ ଘରେ ପ୍ରସ୍ତୁତ ଶୁଦ୍ଧ ଓଡ଼ିଆ ଭୋଜନ ଦିଏ। ଭାତ, ଡାଲି, ତରକାରୀ ₹୧୪୦ ରେ। ୪୫ ମିନିଟରେ ପ୍ରସ୍ତୁତ।',
    },
    {
      label: 'ପିପିଲି ଚାନ୍ଦୁଆ ଶିଳ୍ପ',
      category: 'Handicrafts',
      text: 'ମୁଁ ହାତରେ ସୁନ୍ଦର ଆପ୍ଲିକ ୱାର୍କ ଚାନ୍ଦୁଆ ଏବଂ ବ୍ୟାଗ୍ ତିଆରି କରେ। ମୂଲ୍ୟ ₹୩୫୦।',
    },
  ],
  as: [
    {
      label: 'ব্লাউজ চিলাই আৰু জোখ-মাখ',
      category: 'Tailoring',
      text: 'মই ব্লাউজ চিলাই আৰু অল্টাৰেচনৰ কাম কৰোঁ। ₹২৫০ লওঁ আৰু কাইলৈৰ ভিতৰত সম্পূৰ্ণ কৰিম।',
    },
    {
      label: 'ঘৰুৱা খাদ্য',
      category: 'Cooking',
      text: 'মই ঘৰতে পৰম্পৰাগত অসমীয়া আহাৰ বনাওঁ। ভাত, দাইল আৰু তৰকাৰী ₹১৪০। ৪৫ মিনিটত প্ৰস্তুত।',
    },
    {
      label: 'মুগা বস্ত্ৰ হস্তশিল্প',
      category: 'Handicrafts',
      text: 'মই হাতৰ তাঁতশালত ফুলাম গামোচা আৰু মোনা তৈয়াৰ কৰোঁ। মূল্য ₹৩৫০।',
    },
  ],
  ur: [
    {
      label: 'بلاؤز سلائی و فٹنگ',
      category: 'Tailoring',
      text: 'میں بلاؤز سلائی اور فٹنگ کا کام کرتی ہوں۔ ₹250 چارج کرتی ہوں اور کل شام تک تیار کر دوں گی۔',
    },
    {
      label: 'گھر کا بنا لذیذ کھانا',
      category: 'Cooking',
      text: 'میں گھر کا صاف ستھرا لذیذ کھانا بناتی ہوں۔ روٹی، دال، سبزی ₹140 میں 45 منٹ میں تیار۔',
    },
    {
      label: 'زردوزی دستکاری',
      category: 'Handicrafts',
      text: 'میں ہاتھ سے زردوزی کڑھائی کے خوبصورت دوپٹے تیار کرتی ہوں۔ قیمت ₹350 ہے۔',
    },
  ],
  sa: [
    {
      label: 'चोलक-सीवनम् (ब्लाउज)',
      category: 'Tailoring',
      text: 'अहं चोलकस्य सीवनं संशोधनं च करोमि। ₹२५० शुल्कं स्वीकरोमि श्वः सन्ध्यायावत् सज्जीकरिष्यामि।',
    },
    {
      label: 'शुद्ध-गृहभोजनम्',
      category: 'Cooking',
      text: 'अहं गृहे सात्त्विकं शुद्धं भोजनं सज्जीकरोमि। रोटिका, सूपः, शाकं च ₹१४० मध्ये। ४५ निमेषेषु सिद्धम्।',
    },
    {
      label: 'पारम्परिक-तोरणम्',
      category: 'Handicrafts',
      text: 'अहं हस्तनिर्मितानि मङ्गल-तोरणानि सज्जीकरोमि। एकस्य मूल्यं ₹३५० अस्ति।',
    },
  ],
  ne: [
    {
      label: 'ब्लाउज सिलाई तथा फिटिङ',
      category: 'Tailoring',
      text: 'म ब्लाउज सिलाई र फिटिङको काम गर्छु। ₹२५० लिन्छु र भोलि साँझसम्म तयार गरिदिन्छु।',
    },
    {
      label: 'घरको शुद्ध खाना',
      category: 'Cooking',
      text: 'म घरमै बनाएको ताजा दाल-भात-तरकारी उपलब्ध गराउँछु। ₹१४० मा ४५ मिनेटमा तयार।',
    },
    {
      label: 'ढाका कपडा हस्तकला',
      category: 'Handicrafts',
      text: 'म हातले बुनेको परम्परागत ढाका थैली र टोपी बनाउँछु। मूल्य ₹३५०।',
    },
  ],
  mai: [
    {
      label: 'ब्लाउज सिलाई आ फिटिंग',
      category: 'Tailoring',
      text: 'हम ब्लाउज सिलाई आ फिटिंग करैत छी। ₹२५० लियैत छी आ काइल साँझ धरि तैयार कय देब।',
    },
    {
      label: 'घरक शुद्ध भोजन',
      category: 'Cooking',
      text: 'हम घरक शुद्ध मिथिला भोजन तैयार करैत छी। रोटी, दालि, तरकारी ₹१४० मे ४५ मिनट मे तैयार।',
    },
    {
      label: 'मधुबनी चित्रकला क्राफ्ट',
      category: 'Handicrafts',
      text: 'हम हाथ सं मधुबनी पेंटिंग सं सजल झोरा आ तोरण बनबैत छी। दाम ₹३५० प्रति पीस।',
    },
  ],
  kok: [
    {
      label: 'ब्लाउज शिवप आनी दुरुस्ती',
      category: 'Tailoring',
      text: 'हांव ब्लाउज शिवपाक आनी दुरुस्त करपाक काम करतां। ₹250 घेतां आनी फाल्या सांज मेरेन तयार करतां।',
    },
    {
      label: 'घरचें जेवण',
      category: 'Cooking',
      text: 'हांव घरचें चवदार जेवण तयार करतां। जेवणाचो डबो ₹140, 45 मिण्टांनी तयार।',
    },
    {
      label: 'हस्तकला वस्तू',
      category: 'Handicrafts',
      text: 'हांव हातांनी गोंयच्यो पारंपारिक सोबाय वस्तू आनी तोरणां करतां। मोल ₹350.',
    },
  ],
  ks: [
    {
      label: 'ब्लाउज सिलाई त फिटिंग',
      category: 'Tailoring',
      text: 'बु छुस ब्लाउज सिलाई त फिटिंग करान। ₹250 फीस छु त पगाहस शामस तामुख तय्यार करित्थ दिम।',
    },
    {
      label: 'गरुक तय्यार ख्योन',
      category: 'Cooking',
      text: 'बु छुस गरुक सादा त साफ ख्योन तय्यार करान। ₹140 फी थाल, 45 मिनटन मंज तय्यार।',
    },
    {
      label: 'सोज़नी कशीदाकारी',
      category: 'Handicrafts',
      text: 'बु छुस दस्तकारी सोज़नी कशीदाकारी काम करान। अख पीस छु ₹350।',
    },
  ],
  doi: [
    {
      label: 'ब्लाउज सिलाई ते फिटिंग',
      category: 'Tailoring',
      text: 'मैं ब्लाउज सिलाई ते फिटिंग दा कम्म करदी आं। ₹250 लैन्दी आं ते कल संझा तगर तैय्यार करी देग।',
    },
    {
      label: 'घरे दा शुद्ध खाना',
      category: 'Cooking',
      text: 'मैं घरे दा ताजा खाना त्यार करदी आं। फुल्का, दाल, सब्जी ₹140 च 45 मिनट च त्यार।',
    },
    {
      label: 'डोगरी कसीदाकारी',
      category: 'Handicrafts',
      text: 'मैं हत्थे कन्नै डोगरी कसीदाकारी दे मेजपोश ते तोरण बनौंदी आं। मुल्ल ₹350।',
    },
  ],
  sd: [
    {
      label: 'بﻼﺋﻮز ﺳﻼﺋﻲ ۽ ﻓٽﻨﮓ',
      category: 'Tailoring',
      text: 'مان بﻼﺋﻮز ﺳﻼﺋﻲ ۽ ﻓٽﻨﮓ ﺟﻮ ڪﻢ ڪﻨﺪي آھﯿﺎن. ₹250 وﭠﻨﺪي آھﯿﺎن ۽ ﺳڀﺎﮢﻲ ﺷﺎم ﺗﺎﺋﯿﻦ ﺗﯿﺎر ڪﺮي ڏﯾﻨﺪي آھﯿﺎن.',
    },
    {
      label: 'ﮔﮭﺮ ﺟﻮ ٺﮭﯿﻞ ﮐﺎڌو',
      category: 'Cooking',
      text: 'مان ﮔﮭﺮ ﺟﻮ ﺗﺎزو ۽ ﺻﺎف ﮐﺎڌو ﺗﯿﺎر ڪﻨﺪي آھﯿﺎن. ماني، دال، ڀاڄي ₹140 ۾ 45 منٽن ۾ تيار.',
    },
    {
      label: 'سنڌي رلي ۽ ڀرت',
      category: 'Handicrafts',
      text: 'مان هٿ جي سنڌي ڀرت وارا ٿيلها ۽ چادرون ٺاهيندي آهيان. قيمت ₹350 آهي.',
    },
  ],
  sat: [
    {
      label: 'ᱵᱞᱟᱣᱩᱡᱽ ᱛᱮᱧ ᱟᱨ ᱥᱟᱯᱲᱟᱣ',
      category: 'Tailoring',
      text: 'ᱤᱧ ᱵᱞᱟᱣᱩᱡᱽ ᱛᱮᱧ ᱟᱨ ᱯᱷᱤᱴᱤᱝ ᱤᱧ ᱠᱚᱨᱟᱣᱟ। ₹᱒᱕᱐ ᱦᱟᱛᱟᱣᱟ ᱟᱨ ᱜᱟᱯᱟ ᱟᱹᱭᱩᱵ ᱫᱷᱟᱹᱵᱤᱡ ᱛᱮᱭᱟᱨᱟ।',
    },
    {
      label: 'ᱚᱲᱟᱜ ᱨᱮᱭᱟᱜ ᱡᱚᱢᱟᱜ',
      category: 'Cooking',
      text: 'ᱤᱧ ᱚᱲᱟᱜ ᱨᱮᱭᱟᱜ ᱥᱤᱵᱤᱞ ᱫᱟᱠᱟ-ᱩᱛᱩ ᱤᱧ ᱵᱮᱱᱟᱣᱟ। ₹᱑᱔᱐ ᱛᱮ ᱔᱕ ᱴᱤᱲᱤᱡ ᱨᱮ ᱥᱟᱯᱲᱟᱣ।',
    },
    {
      label: 'ᱥᱟᱱᱛᱟᱲᱤ ᱦᱟᱥᱟ ᱠᱟᱹᱢᱤ',
      category: 'Handicrafts',
      text: 'ᱤᱧ ᱛᱤ ᱛᱮ ᱦᱟᱥᱟ ᱨᱮᱭᱟᱜ ᱥᱟᱡᱟᱣ ᱴᱩᱠᱩᱪ ᱟᱨ ᱡᱷᱚᱞᱟ ᱤᱧ ᱵᱮᱱᱟᱣᱟ। ᱫᱟᱢ ₹᱓᱕᱐।',
    },
  ],
  mni: [
    {
      label: 'ব্লাউজ শাবা অমসুং শুৎপা',
      category: 'Tailoring',
      text: 'ঐহাক ব্লাউজ শাবা অমসুং ফিটিং তৌই। ₹২৫০ লৌই অমসুং হয়াং নুমিদাংগী মনুংদা শাদুনা পীরগনি।',
    },
    {
      label: 'য়ুমগী চাক-ইশৈ',
      category: 'Cooking',
      text: 'ঐহাক য়ুমদা শাবা শেংলবা মৈতেই চাকলুক শেম্মী। ₹১৪০ দা মিনিট ৪৫ গী মনুংদা শেমগনি।',
    },
    {
      label: 'মৈতৈ ফী শাবা',
      category: 'Handicrafts',
      text: 'ঐহাক খুৎনা শাবা ইনাক্কা ফী অমসুং মোনা শেম্মী। মমল ₹৩৫০।',
    },
  ],
  brx: [
    {
      label: 'ब्लाउज दानाय आरो सुबायनाय',
      category: 'Tailoring',
      text: 'आं ब्लाउज दानाय आरो फिटिं खामानि मावो। ₹250 लायो आरो गाबोन बेलासिसिम थियारि खालामना हरगोन।',
    },
    {
      label: 'नख’रनि संनाय-एवनाय',
      category: 'Cooking',
      text: 'आं नख’रनि गथाव ओंखाम-ओंख्रै संना होयो। ₹140 आव मिनिट 45 नि गेजेराव थियारि।',
    },
    {
      label: 'बड़ो आरनाय हस्तशिल्प',
      category: 'Handicrafts',
      text: 'आं आखायजों दानाय आरनाय आरो दखना थियारि खालामो। बेसेन ₹350।',
    },
  ],
};

export function getVoicePromptsForLanguage(langCode: string): VoiceSamplePrompt[] {
  return ARTISAN_VOICE_SAMPLE_PROMPTS[langCode] || ARTISAN_VOICE_SAMPLE_PROMPTS['en'];
}


