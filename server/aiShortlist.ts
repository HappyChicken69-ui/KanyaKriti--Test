import { getGeminiClient } from './gemini.ts';
import { getGroqClient, GROQ_CONFIG } from './groq.ts';
import { ParsedBuyerIntent } from './intentParser.ts';
import { MatchScoreResult } from '../src/types.ts';

export interface AiShortlistRecommendation {
  listingId: string;
  badge: string; // e.g. "AI Top Pick", "Fast Turnaround Match", "Best Value Match", "Hyperlocal Favorite"
  reason: string;
  rank: number;
  scoreBoost?: number;
}

export interface AiShortlistOutput {
  matches: MatchScoreResult[];
  shortlistSummary?: string;
  isAiEnhanced: boolean;
}

/**
 * Fallback deterministic shortlisting engine when LLM is unavailable or offline.
 * Evaluates real candidates against intent strictly using real data.
 */
export function deterministicShortlist(
  intent: ParsedBuyerIntent,
  candidates: MatchScoreResult[]
): { recommendations: Map<string, { badge: string; reason: string; scoreBoost: number }>; summary: string } {
  const recommendations = new Map<string, { badge: string; reason: string; scoreBoost: number }>();
  if (candidates.length === 0) {
    return { recommendations, summary: 'No matching artisans found in this area.' };
  }

  // 1. Identify best turnaround match if urgency was requested
  let turnaroundPickId: string | null = null;
  if (intent.maxTurnaroundHours) {
    const fastCandidates = candidates.filter(
      (c) => c.listing.turnaroundHours <= (intent.maxTurnaroundHours || 24)
    );
    if (fastCandidates.length > 0) {
      fastCandidates.sort((a, b) => a.listing.turnaroundHours - b.listing.turnaroundHours);
      turnaroundPickId = fastCandidates[0].listing.id;
      recommendations.set(turnaroundPickId, {
        badge: 'Fast Turnaround Match',
        reason: `Guaranteed delivery ${fastCandidates[0].listing.turnaroundDisplay.toLowerCase()} (${fastCandidates[0].listing.turnaroundHours}h) within ${fastCandidates[0].distanceKm} km.`,
        scoreBoost: 8,
      });
    }
  }

  // 2. Identify top overall match
  const sortedByScore = [...candidates].sort((a, b) => b.matchScore - a.matchScore);
  const topMatch = sortedByScore[0];
  if (topMatch) {
    if (!recommendations.has(topMatch.listing.id)) {
      recommendations.set(topMatch.listing.id, {
        badge: 'AI Top Pick',
        reason: `Highest match score (${topMatch.matchScore}%) combining ${topMatch.artisan.primarySkill}, ${topMatch.distanceKm} km proximity, and ₹${topMatch.listing.price} price.`,
        scoreBoost: 10,
      });
    }
  }

  // 3. Identify best value / budget fit if not already assigned
  const valueCandidates = candidates.filter((c) => !recommendations.has(c.listing.id));
  if (valueCandidates.length > 0) {
    valueCandidates.sort((a, b) => a.listing.price - b.listing.price);
    const bestValue = valueCandidates[0];
    if (bestValue.listing.price <= (intent.maxBudget || 1000)) {
      recommendations.set(bestValue.listing.id, {
        badge: 'Best Value Match',
        reason: `Exceptional neighborhood craft at just ₹${bestValue.listing.price} by verified artisan ${bestValue.artisan.name} (${bestValue.artisan.rating}★).`,
        scoreBoost: 6,
      });
    }
  }

  // 4. Identify closest hyperlocal favorite
  const proximityCandidates = candidates.filter((c) => !recommendations.has(c.listing.id));
  if (proximityCandidates.length > 0) {
    proximityCandidates.sort((a, b) => a.distanceKm - b.distanceKm);
    const closest = proximityCandidates[0];
    if (closest.distanceKm <= 3.0) {
      recommendations.set(closest.listing.id, {
        badge: 'Hyperlocal Favorite',
        reason: `Closest verified maker at only ${closest.distanceKm} km away in ${closest.listing.neighborhood}.`,
        scoreBoost: 5,
      });
    }
  }

  const topName = topMatch ? topMatch.artisan.name : 'local makers';
  const summary = `Found ${candidates.length} verified makers. Top recommendation: ${topName} for ${intent.cleanedQuery || intent.category || 'service'}.`;

  return { recommendations, summary };
}

/**
 * AI Relevance Ranking and Shortlisting pipeline.
 * Evaluates real candidates, ranks them according to buyer intent,
 * and adds verified AI insights without ever inventing data.
 */
export async function rankAndShortlistCandidates(
  intent: ParsedBuyerIntent,
  candidates: MatchScoreResult[]
): Promise<AiShortlistOutput> {
  if (candidates.length === 0) {
    return { matches: [], isAiEnhanced: false };
  }

  // Prepare minimal candidate payload (only real IDs and verified attributes)
  const candidatePayload = candidates.slice(0, 8).map((c) => ({
    id: c.listing.id,
    title: c.listing.title,
    artisanName: c.artisan.name,
    category: c.listing.category,
    price: c.listing.price,
    turnaround: c.listing.turnaroundDisplay,
    turnaroundHours: c.listing.turnaroundHours,
    distanceKm: c.distanceKm,
    rating: c.artisan.rating,
    reviewCount: c.artisan.reviewCount,
    skills: c.artisan.skills,
    neighborhood: c.listing.neighborhood,
    tags: c.listing.tags,
  }));

  const prompt = `You are KanyaKriti's neighborhood artisan matching engine in India.
Empower local women artisans by accurately shortlisting candidates for a buyer search.

Buyer Query: "${intent.rawQuery}"
Interpreted Intent: ${intent.intentSummary}
Category: ${intent.category || 'Any'}
Max Budget: ${intent.maxBudget ? '₹' + intent.maxBudget : 'Any'}
Urgency: ${intent.maxTurnaroundHours ? intent.maxTurnaroundHours + ' hours' : 'Normal'}
Proximity Preference: ${intent.wantsProximity ? 'High proximity requested' : 'Standard'}

Real Candidate Listings:
${JSON.stringify(candidatePayload, null, 2)}

STRICT RULES:
1. ONLY evaluate and reference the provided candidate listing IDs.
2. DO NOT invent or alter any artisan, listing, price, or distance.
3. Select the top 1 to 3 best-fitting candidates to SHORTLIST.
4. For each shortlisted candidate, provide:
   - "listingId": exact ID from candidate list
   - "badge": one of ["AI Top Pick", "Fast Turnaround Match", "Best Value Match", "Hyperlocal Favorite", "Top-Rated Artisan"]
   - "reason": concise 1-sentence grounded justification highlighting her real skill, distance, speed, or price.
   - "rank": 1, 2, or 3
   - "scoreBoost": integer 5 to 12
5. Provide a 1-sentence "summary" explaining the recommendation.

Output strict JSON only conforming to:
{
  "shortlist": [
    {
      "listingId": "list-X",
      "badge": "AI Top Pick",
      "reason": "...",
      "rank": 1,
      "scoreBoost": 10
    }
  ],
  "summary": "..."
}`;

  let aiResult: { shortlist: AiShortlistRecommendation[]; summary?: string } | null = null;

  // 1. Try Gemini 3.8 Flash (Server-Side)
  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text?.trim() || '';
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed?.shortlist)) {
          aiResult = parsed;
        }
      }
    } catch (err: any) {
      console.warn('[AI Shortlist] Gemini call fallback warning:', err?.message || err);
    }
  }

  // 2. Try Groq secondary if Gemini did not return
  if (!aiResult && GROQ_CONFIG.isConfigured) {
    const groq = getGroqClient();
    if (groq) {
      try {
        const response = await groq.chat.completions.create({
          model: GROQ_CONFIG.chatModel,
          messages: [
            { role: 'system', content: 'You are KanyaKriti AI Shortlisting Engine. Return valid JSON only.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        });
        const text = response.choices[0]?.message?.content?.trim() || '';
        if (text) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed?.shortlist)) {
            aiResult = parsed;
          }
        }
      } catch (err: any) {
        console.warn('[AI Shortlist] Groq secondary fallback warning:', err?.message || err);
      }
    }
  }

  // 3. Fallback to deterministic engine if AI unavailable or failed
  const recommendationMap = new Map<string, { badge: string; reason: string; scoreBoost: number }>();
  let finalSummary = '';
  let isAiEnhanced = false;

  if (aiResult && aiResult.shortlist && aiResult.shortlist.length > 0) {
    isAiEnhanced = true;
    finalSummary = aiResult.summary || 'AI evaluated matching local artisans based on your query and neighbourhood distance.';
    // Verify each shortlisted ID actually exists in the real candidate list
    const candidateIdSet = new Set(candidates.map((c) => c.listing.id));
    for (const item of aiResult.shortlist) {
      if (candidateIdSet.has(item.listingId)) {
        recommendationMap.set(item.listingId, {
          badge: item.badge || 'AI Top Pick',
          reason: item.reason,
          scoreBoost: typeof item.scoreBoost === 'number' ? Math.min(15, Math.max(2, item.scoreBoost)) : 8,
        });
      }
    }
  }

  // If no valid AI recommendations (or offline), use deterministic heuristics
  if (recommendationMap.size === 0) {
    const fallback = deterministicShortlist(intent, candidates);
    fallback.recommendations.forEach((val, key) => recommendationMap.set(key, val));
    finalSummary = fallback.summary;
    isAiEnhanced = false;
  }

  // Enrich candidate matches with AI Shortlist metadata
  const enriched: MatchScoreResult[] = candidates.map((candidate) => {
    const rec = recommendationMap.get(candidate.listing.id);
    if (rec) {
      const boostedScore = Math.min(99, candidate.matchScore + rec.scoreBoost);
      return {
        ...candidate,
        matchScore: boostedScore,
        aiInsight: {
          isShortlisted: true,
          badge: rec.badge,
          reason: rec.reason,
        },
      };
    }
    return candidate;
  });

  // Sort by final matchScore (shortlisted items naturally rank at the top)
  enriched.sort((a, b) => b.matchScore - a.matchScore);

  return {
    matches: enriched,
    shortlistSummary: finalSummary,
    isAiEnhanced,
  };
}
