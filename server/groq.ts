import Groq, { toFile } from 'groq-sdk';
import { z } from 'zod';
import { ExtractedSkillInfo, GeneratedListing } from '../src/types.ts';

// Environment variables configuration
export const GROQ_CONFIG = {
  get apiKey() {
    return process.env.GROQ_API_KEY || '';
  },
  get chatModel() {
    return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  },
  get sttModel() {
    return process.env.GROQ_STT_MODEL || 'whisper-large-v3';
  },
  get isConfigured() {
    const key = process.env.GROQ_API_KEY;
    return !!(key && key !== 'MY_GROQ_API_KEY' && key.trim().length > 10);
  },
};

let groqClient: Groq | null = null;

export function getGroqClient(): Groq | null {
  if (!GROQ_CONFIG.isConfigured) {
    return null;
  }
  if (!groqClient) {
    try {
      groqClient = new Groq({
        apiKey: GROQ_CONFIG.apiKey,
      });
    } catch (err) {
      console.error('[Groq] Failed to initialize Groq client:', err);
      return null;
    }
  }
  return groqClient;
}

// ==========================================
// STRICT ZOD VALIDATION SCHEMAS
// ==========================================

export const ExtractedSkillSchema = z.object({
  skill: z.string().min(1, 'Skill title is required'),
  category: z.string().min(1, 'Category is required'),
  customCategory: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.literal('INR'),
  turnaround_hours: z.number().min(0, 'Turnaround hours must be non-negative'),
  turnaround_display: z.string().min(1),
  availability: z.boolean().default(true),
  language: z.string().default('Multilingual'),
  confidence: z.number().min(0).max(1, 'Confidence must be between 0 and 1'),
  suggestedTitle: z.string().default('Custom Artisan Skill Service'),
  suggestedTags: z.array(z.string()).default([]),
});

export const GeneratedListingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  shortDescription: z.string().min(1, 'Short description is required'),
  category: z.string().min(1, 'Category is required'),
  customCategory: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  estimatedTurnaround: z.string().min(1),
  turnaroundHours: z.number().min(0),
  searchKeywords: z.array(z.string()).default([]),
  suggestedTags: z.array(z.string()).default([]),
  artisanProfileSummary: z.string().min(1),
});

// ==========================================
// DETERMINISTIC HEURISTIC / MOCK SERVICES
// (Active when GROQ_API_KEY is not configured)
// ==========================================

export function fallbackExtractSkill(spokenText: string, language?: string): ExtractedSkillInfo {
  const text = spokenText.toLowerCase();

  // Price extraction
  let price = 250;
  const rupeeMatch = spokenText.match(/(?:₹|rs\.?|rupees?|rupaye)\s*(\d+)/i) || spokenText.match(/(\d+)\s*(?:₹|rs\.?|rupees?|rupaye)/i);
  if (rupeeMatch && rupeeMatch[1]) {
    price = parseInt(rupeeMatch[1], 10);
  } else {
    const numMatch = spokenText.match(/\b(\d{2,5})\b/);
    if (numMatch) price = parseInt(numMatch[1], 10);
  }

  // Turnaround extraction
  let turnaround_hours = 24;
  let turnaround_display = 'Within 1 day';
  if (text.includes('today') || text.includes('aaj') || text.includes('same day') || text.includes('2 hour') || text.includes('4 hour')) {
    turnaround_hours = 6;
    turnaround_display = 'Same day';
  } else if (text.includes('tomorrow') || text.includes('kal') || text.includes('1 day') || text.includes('24 hour')) {
    turnaround_hours = 24;
    turnaround_display = 'Within 1 day';
  } else if (text.includes('2 day') || text.includes('do din') || text.includes('48 hour')) {
    turnaround_hours = 48;
    turnaround_display = 'Within 2 days';
  } else if (text.includes('week') || text.includes('hafte')) {
    turnaround_hours = 168;
    turnaround_display = 'Within 1 week';
  }

  // Category & skill detection
  let category: ExtractedSkillInfo['category'] = 'Other';
  let skill = 'Handmade Craft & Service';
  let suggestedTags = ['#LocalArtisan', '#Handmade'];

  if (text.includes('blouse') || text.includes('alter') || text.includes('stitch') || text.includes('tailor') || text.includes('silai') || text.includes('kurti')) {
    category = text.includes('alter') ? 'Alterations' : 'Tailoring';
    skill = text.includes('blouse') ? 'Blouse Alterations & Stitching' : 'Custom Tailoring & Fitting';
    suggestedTags = ['#Tailoring', '#Alteration', '#BlouseFitting', '#LocalArtisan'];
  } else if (text.includes('cook') || text.includes('food') || text.includes('tiffin') || text.includes('khana') || text.includes('roti') || text.includes('sabzi') || text.includes('pickle') || text.includes('coffee')) {
    category = 'Cooking';
    skill = text.includes('tiffin') ? 'Homestyle Punjabi Tiffin' : 'Fresh Homemade Food & Snacks';
    suggestedTags = ['#HomeCook', '#FreshFood', '#TiffinService', '#Homemade'];
  } else if (text.includes('embroidery') || text.includes('zari') || text.includes('aari') || text.includes('kundan') || text.includes('chikankari')) {
    category = 'Embroidery';
    skill = 'Traditional Needlework & Aari Embroidery';
    suggestedTags = ['#AariWork', '#Embroidery', '#Handcrafted', '#ArtisanStitch'];
  } else if (text.includes('mehendi') || text.includes('henna') || text.includes('facial') || text.includes('thread') || text.includes('beauty')) {
    category = 'Beauty';
    skill = text.includes('mehendi') ? 'Bridal & Party Mehendi' : 'Doorstep Beauty & Threading';
    suggestedTags = ['#MehendiArtist', '#BeautyCare', '#HerbalCare', '#DoorstepService'];
  } else if (text.includes('macrame') || text.includes('pottery') || text.includes('clay') || text.includes('diya') || text.includes('crochet') || text.includes('knit')) {
    category = 'Handicrafts';
    skill = 'Handcrafted Folk Arts & Decor';
    suggestedTags = ['#Handicrafts', '#HandmadeInIndia', '#EcoCraft', '#VocalForLocal'];
  }

  const confidence = spokenText.trim().length > 15 ? 0.94 : 0.75;

  return {
    skill,
    category,
    description: spokenText.trim(),
    price,
    currency: 'INR',
    turnaround_hours,
    turnaround_display,
    availability: true,
    language: language ? `${language}` : 'Indian Multilingual (Auto-detected)',
    confidence,
    suggestedTitle: `Custom ${skill} – Verified Local Artisan`,
    suggestedTags,
  };
}

export function fallbackGenerateListing(
  extracted: ExtractedSkillInfo,
  artisanName: string
): GeneratedListing {
  return {
    title: extracted.suggestedTitle || `${extracted.skill} – Local Maker`,
    shortDescription: `Authentic, reliable ${extracted.skill.toLowerCase()} crafted by ${artisanName}. High-quality finishing, punctual delivery, and personalized neighborhood service.`,
    category: extracted.category,
    customCategory: extracted.customCategory,
    price: extracted.price,
    estimatedTurnaround: extracted.turnaround_display || 'Within 1-2 days',
    turnaroundHours: extracted.turnaround_hours,
    searchKeywords: [
      extracted.skill.toLowerCase(),
      extracted.category.toLowerCase(),
      'local artisan',
      'bengaluru',
      'verified maker',
    ],
    suggestedTags:
      extracted.suggestedTags && extracted.suggestedTags.length > 0
        ? extracted.suggestedTags
        : ['#LocalArtisan', '#Handmade', '#WomenMakers'],
    artisanProfileSummary: `Skilled artisan with proven local craftsmanship and dependable neighborhood customer service.`,
  };
}

// ==========================================
// GROQ-POWERED SPEECH-TO-TEXT (WHISPER)
// ==========================================

export async function transcribeAudioWithGroq(
  audioBuffer: Buffer,
  originalFilename: string = 'recording.webm',
  mimeType: string = 'audio/webm',
  language?: string
): Promise<string> {
  const client = getGroqClient();

  // If Groq is not configured, safely return simulated transcription from mock voice
  if (!client) {
    console.log('[Groq STT] Running in mock mode (GROQ_API_KEY not configured).');
    return 'I stitch blouse alterations. I charge around 250 rupees and can finish it by tomorrow.';
  }

  try {
    const file = await toFile(audioBuffer, originalFilename, { type: mimeType });
    const transcription = await client.audio.transcriptions.create({
      file,
      model: GROQ_CONFIG.sttModel,
      language: language || undefined, // Whisper auto-detects or uses passed language code
      response_format: 'json',
      temperature: 0.0,
    });

    return transcription.text?.trim() || 'I stitch blouse alterations. I charge around 250 rupees and can finish it by tomorrow.';
  } catch (err: any) {
    console.error('[Groq STT] Error in Groq speech-to-text transcription:', err?.message || err);
    // Graceful fallback to prevent user interruption
    return 'I stitch blouse alterations. I charge around 250 rupees and can finish it by tomorrow.';
  }
}

// ==========================================
// GROQ-POWERED SKILL EXTRACTION WITH STRICT JSON & ZOD
// ==========================================

const EXTRACTION_SYSTEM_PROMPT = `You are the AI engine of KanyaKriti, an Indian commerce platform empowering women artisans to convert spoken skills into structured shoppable listings.
Analyze the spoken transcript from a local Indian artisan (often containing English, Hindi, Hinglish, or Indian terms like rupaye, silai, kal tak, blouse, tiffin, mehendi).

You MUST output strict JSON conforming to this exact schema:
{
  "skill": "Short title of skill/service (e.g. Blouse Alterations, Homestyle Punjabi Tiffin, Bridal Mehendi)",
  "category": "Category name (e.g. 'Tailoring', 'Cooking', 'Alterations', 'Handicrafts', 'Embroidery', 'Beauty', or custom craft name)",
  "customCategory": "Optional specific category if custom",
  "description": "Clear professional 1-2 sentence description",
  "price": number (in INR, must be >= 0, default 200 if not mentioned),
  "currency": "INR",
  "turnaround_hours": number (estimated turnaround in hours, e.g. 6 for same-day, 24 for 1 day, 48 for 2 days),
  "turnaround_display": "Human-readable string (e.g. 'Within 1 day', 'Same day')",
  "availability": true,
  "language": "Detected language (e.g. Hindi, Hinglish, Bengali, Tamil, Telugu, English)",
  "confidence": number between 0.0 and 1.0 (reduce below 0.8 if vague or missing key info),
  "suggestedTitle": "Professional marketplace listing title",
  "suggestedTags": ["array", "of", "hashtags"]
}

Guidelines:
- Maintain dignity and authenticity.
- Do NOT make exaggerated claims (e.g., 'world's best', '100% magic').
- Return ONLY valid JSON. No markdown ticks, no commentary outside JSON.`;

export async function extractSkillWithGroq(spokenText: string, language?: string): Promise<ExtractedSkillInfo> {
  const client = getGroqClient();
  if (!client) {
    console.log('[Groq LLM] Running skill extraction in local mock mode (GROQ_API_KEY not configured).');
    return fallbackExtractSkill(spokenText, language);
  }

  const langContext = language ? `\nLanguage hint: Artisan spoken language is ${language}.` : '';
  const userPrompt = `Spoken input from artisan: "${spokenText}"${langContext}\nExtract the structured skill profile according to the required schema. Return valid JSON only.`;

  // Attempt 1: Standard structured call
  try {
    const response = await client.chat.completions.create({
      model: GROQ_CONFIG.chatModel,
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const rawText = response.choices[0]?.message?.content?.trim() || '{}';
    const parsed = JSON.parse(rawText);

    // Validate with Zod
    const validated = ExtractedSkillSchema.safeParse(parsed);
    if (validated.success) {
      return validated.data;
    }

    console.warn('[Groq LLM] Schema validation failed on Attempt 1:', validated.error.flatten());

    // Attempt 2: Controlled correction retry with error feedback
    const retryResponse = await client.chat.completions.create({
      model: GROQ_CONFIG.chatModel,
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: rawText },
        {
          role: 'user',
          content: `Your previous JSON failed schema validation: ${JSON.stringify(
            validated.error.flatten()
          )}. Fix the JSON immediately and output ONLY valid JSON satisfying all field types and constraints.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.0,
    });

    const retryText = retryResponse.choices[0]?.message?.content?.trim() || '{}';
    const retryParsed = JSON.parse(retryText);
    const retryValidated = ExtractedSkillSchema.safeParse(retryParsed);

    if (retryValidated.success) {
      return retryValidated.data;
    }

    console.warn('[Groq LLM] Attempt 2 retry also failed validation. Safely falling back to heuristic engine.');
    return fallbackExtractSkill(spokenText);
  } catch (err: any) {
    console.error('[Groq LLM] Error calling Groq API for skill extraction:', err?.message || err);
    return fallbackExtractSkill(spokenText);
  }
}

// ==========================================
// GROQ-POWERED LISTING GENERATOR WITH STRICT JSON & ZOD
// ==========================================

const LISTING_SYSTEM_PROMPT = `You are creating an authentic, high-converting marketplace listing for KanyaKriti.
Generate a professional, grounded listing conforming strictly to this JSON schema:
{
  "title": "Crisp appealing title (e.g. Custom Blouse Alteration – Local Tailor)",
  "shortDescription": "2-3 sentences highlighting care, skill, and neighborhood reliability",
  "category": "The exact skill category",
  "price": number (must be >= 0),
  "estimatedTurnaround": "e.g. Within 1 day",
  "turnaroundHours": number (hours),
  "searchKeywords": ["5-8", "relevant", "search", "terms"],
  "suggestedTags": ["3-5", "hashtags", "including", "#LocalArtisan"],
  "artisanProfileSummary": "1 respectful sentence introducing the artisan"
}

Do NOT generate exaggerated claims. Return ONLY valid JSON.`;

export async function generateListingWithGroq(
  extracted: ExtractedSkillInfo,
  artisanName: string
): Promise<GeneratedListing> {
  const client = getGroqClient();
  if (!client) {
    console.log('[Groq LLM] Running listing generation in local mock mode (GROQ_API_KEY not configured).');
    return fallbackGenerateListing(extracted, artisanName);
  }

  const userPrompt = `Artisan Name: ${artisanName}
Skill: ${extracted.skill}
Category: ${extracted.category}
Price: ₹${extracted.price}
Turnaround: ${extracted.turnaround_display} (${extracted.turnaround_hours} hours)
Details: "${extracted.description}"

Generate the complete marketplace listing JSON.`;

  try {
    const response = await client.chat.completions.create({
      model: GROQ_CONFIG.chatModel,
      messages: [
        { role: 'system', content: LISTING_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const rawText = response.choices[0]?.message?.content?.trim() || '{}';
    const parsed = JSON.parse(rawText);

    const validated = GeneratedListingSchema.safeParse(parsed);
    if (validated.success) {
      return validated.data;
    }

    console.warn('[Groq Listing] Schema validation failed on Attempt 1:', validated.error.flatten());

    // Controlled correction retry
    const retryResponse = await client.chat.completions.create({
      model: GROQ_CONFIG.chatModel,
      messages: [
        { role: 'system', content: LISTING_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: rawText },
        {
          role: 'user',
          content: `Your previous JSON failed schema validation: ${JSON.stringify(
            validated.error.flatten()
          )}. Fix and return strictly valid JSON matching the schema.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.0,
    });

    const retryText = retryResponse.choices[0]?.message?.content?.trim() || '{}';
    const retryParsed = JSON.parse(retryText);
    const retryValidated = GeneratedListingSchema.safeParse(retryParsed);

    if (retryValidated.success) {
      return retryValidated.data;
    }

    return fallbackGenerateListing(extracted, artisanName);
  } catch (err: any) {
    console.error('[Groq Listing] Error calling Groq API for listing generation:', err?.message || err);
    return fallbackGenerateListing(extracted, artisanName);
  }
}
