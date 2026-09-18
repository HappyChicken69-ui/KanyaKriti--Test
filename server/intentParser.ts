export interface ParsedBuyerIntent {
  rawQuery: string;
  cleanedQuery: string;
  category?: string;
  maxBudget?: number;
  maxTurnaroundHours?: number;
  wantsProximity: boolean;
  intentSummary: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Alterations: [
    'alter',
    'alteration',
    'alterations',
    'fitting',
    'shorten',
    'tighten',
    'loosen',
    'blouse alteration',
    'sleeve alteration',
    'neck alteration',
    'dress alteration',
  ],
  Tailoring: [
    'tailor',
    'tailoring',
    'stitch',
    'stitching',
    'silai',
    'blouse',
    'kurti',
    'salwar',
    'saree fall',
    'piko',
    'petticoat',
    'sewing',
  ],
  Cooking: [
    'tiffin',
    'food',
    'cook',
    'cooking',
    'lunch',
    'dinner',
    'breakfast',
    'thali',
    'roti',
    'sabzi',
    'subzi',
    'paratha',
    'meal',
    'meals',
    'dabba',
    'khana',
    'snacks',
    'filter coffee',
    'murukku',
    'sambar podi',
    'pickle',
    'homemade food',
  ],
  Embroidery: [
    'embroidery',
    'aari',
    'zari',
    'zardozi',
    'chikankari',
    'kundan',
    'needlework',
    'threadwork',
    'border work',
    'dupatta work',
  ],
  Beauty: [
    'mehendi',
    'henna',
    'threading',
    'eyebrow',
    'eyebrows',
    'facial',
    'wax',
    'waxing',
    'beauty',
    'salon',
    'fruit clean-up',
    'cleanup',
    'head massage',
    'champissage',
  ],
  Handicrafts: [
    'macrame',
    'crochet',
    'pottery',
    'clay',
    'diya',
    'diyas',
    'planter',
    'planters',
    'woolen',
    'woolens',
    'sweater',
    'handicraft',
    'handicrafts',
    'toran',
    'tote bag',
    'wall hanging',
    'coaster',
  ],
};

export function parseBuyerIntent(
  rawQuery: string,
  explicitCategory?: string,
  explicitBudget?: number
): ParsedBuyerIntent {
  const query = (rawQuery || '').trim();
  const lower = query.toLowerCase();

  // 1. Budget extraction
  let detectedBudget: number | undefined = explicitBudget;
  if (!detectedBudget) {
    // Matches "under ₹500", "under 500", "below 300", "less than rs 400", "budget 250", "under rs. 500"
    const budgetRegex = /(?:under|below|less than|within|upto|up to|budget|max)\s*(?:₹|rs\.?|inr)?\s*(\d{2,5})/i;
    const rupeePrefixRegex = /(?:₹|rs\.?|inr)\s*(\d{2,5})\s*(?:budget|or less|under)?/i;
    const match = lower.match(budgetRegex) || lower.match(rupeePrefixRegex);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 50000) {
        detectedBudget = parsed;
      }
    }
  }

  // 2. Turnaround / Urgency extraction
  let detectedTurnaround: number | undefined = undefined;
  if (
    lower.includes('today') ||
    lower.includes('aaj') ||
    lower.includes('same day') ||
    lower.includes('urgent') ||
    lower.includes('emergency') ||
    lower.includes('few hours') ||
    lower.includes('immediate')
  ) {
    detectedTurnaround = 6;
  } else if (
    lower.includes('tomorrow') ||
    lower.includes('kal') ||
    lower.includes('1 day') ||
    lower.includes('one day') ||
    lower.includes('24 hour') ||
    lower.includes('24h') ||
    lower.includes('24 hr')
  ) {
    detectedTurnaround = 24;
  } else if (
    lower.includes('2 day') ||
    lower.includes('two day') ||
    lower.includes('48 hour') ||
    lower.includes('48h')
  ) {
    detectedTurnaround = 48;
  } else if (lower.includes('week') || lower.includes('hafte')) {
    detectedTurnaround = 168;
  }

  // 3. Proximity intent
  const wantsProximity =
    lower.includes('near me') ||
    lower.includes('nearby') ||
    lower.includes('close by') ||
    lower.includes('paas') ||
    lower.includes('around me') ||
    lower.includes('in my area') ||
    lower.includes('local');

  // 4. Category inference (if not explicitly chosen or if 'All')
  let detectedCategory: string | undefined =
    explicitCategory && explicitCategory !== 'All' ? explicitCategory : undefined;

  if (!detectedCategory) {
    let bestCat: string | undefined = undefined;
    let maxMatches = 0;

    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      let count = 0;
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          count += kw.length > 5 ? 2 : 1;
        }
      }
      if (count > maxMatches) {
        maxMatches = count;
        bestCat = cat;
      }
    }

    if (bestCat && maxMatches > 0) {
      detectedCategory = bestCat;
    }
  }

  // 5. Cleaned query: strip modifier words so keyword matching targets pure product/service tokens
  let cleaned = lower
    .replace(/(?:under|below|less than|within|upto|up to|budget|max)\s*(?:₹|rs\.?|inr)?\s*\d{2,5}/gi, '')
    .replace(/(?:₹|rs\.?|inr)\s*\d{2,5}/gi, '')
    .replace(/\b(tomorrow|today|kal|aaj|same day|urgent|emergency|near me|nearby|close by|in my area)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned && query) {
    // If the entire query was just modifiers (e.g. "under 500"), restore category keyword or original
    cleaned = detectedCategory ? detectedCategory.toLowerCase() : query;
  }

  // 6. Natural intent summary
  const summaryParts: string[] = [];
  if (cleaned) {
    summaryParts.push(`"${cleaned}"`);
  } else if (detectedCategory) {
    summaryParts.push(detectedCategory);
  }

  if (detectedTurnaround) {
    if (detectedTurnaround <= 6) summaryParts.push('Same day / Today');
    else if (detectedTurnaround <= 24) summaryParts.push('Tomorrow (24h)');
    else summaryParts.push(`Within ${detectedTurnaround / 24} days`);
  }

  if (detectedBudget) {
    summaryParts.push(`Under ₹${detectedBudget}`);
  }

  if (wantsProximity) {
    summaryParts.push('Hyperlocal Near You');
  }

  const intentSummary = summaryParts.length > 0 ? summaryParts.join(' • ') : 'Browse all local makers';

  return {
    rawQuery: query,
    cleanedQuery: cleaned,
    category: detectedCategory,
    maxBudget: detectedBudget,
    maxTurnaroundHours: detectedTurnaround,
    wantsProximity,
    intentSummary,
  };
}
