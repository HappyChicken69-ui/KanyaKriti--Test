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
