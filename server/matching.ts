import { ArtisanProfile, Listing, MatchScoreResult } from '../src/types.ts';

// Haversine formula to compute great-circle distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export function computeDistanceScore(distanceKm: number): number {
  if (distanceKm <= 1.0) return 100;
  if (distanceKm <= 2.5) return 92;
  if (distanceKm <= 5.0) return 80;
  if (distanceKm <= 10.0) return 60;
  if (distanceKm <= 15.0) return 40;
  return Math.max(10, Math.round(100 - distanceKm * 4));
}

// Common local service synonyms for hyperlocal Indian context
const SYNONYMS: Record<string, string[]> = {
  blouse: ['alteration', 'fitting', 'stitching', 'tailor', 'silai', 'saree', 'fall', 'piko'],
  alteration: ['blouse', 'fitting', 'stitch', 'tailor', 'shorten', 'tighten'],
  tiffin: ['food', 'lunch', 'dinner', 'thali', 'cook', 'roti', 'meal', 'paratha', 'punjabi', 'meals'],
  food: ['tiffin', 'cook', 'cooking', 'thali', 'paratha', 'snack', 'meals'],
  mehendi: ['henna', 'bridal', 'arabic', 'cone', 'mandala', 'beauty'],
  embroidery: ['aari', 'zari', 'zardozi', 'chikankari', 'kundan', 'needlework'],
  crochet: ['knitted', 'woolens', 'woolen', 'baby', 'sweater'],
  pottery: ['terracotta', 'clay', 'diya', 'diyas', 'planter'],
  macrame: ['cotton', 'wall hanging', 'planter', 'tote', 'toran'],
};

export function computeSkillScore(
  query: string,
  categoryFilter: string | undefined,
  listing: Listing,
  artisan: ArtisanProfile
): number {
  const q = (query || '').toLowerCase().trim();
  const cat = (categoryFilter || '').toLowerCase().trim();

  if (!q && !cat) return 85;

  let score = 25;

  // Category match
  if (cat && cat !== 'all') {
    if (listing.category.toLowerCase() === cat) {
      score += 45;
    } else if (listing.customCategory && listing.customCategory.toLowerCase() === cat) {
      score += 45;
    } else if (cat === 'other' && (listing.category.toLowerCase() === 'other' || !!listing.customCategory)) {
      score += 45;
    }
  } else if (!cat || cat === 'all') {
    // If no category filter, start with neutral baseline
    score += 15;
  }

  if (q) {
    const titleLower = listing.title.toLowerCase();
    const descLower = listing.description.toLowerCase();
    const catLower = listing.category.toLowerCase();
    const customCatLower = (listing.customCategory || '').toLowerCase();
    const tagsLower = listing.tags.map((t) => t.toLowerCase()).join(' ');
    const skillsLower = artisan.skills.map((s) => s.toLowerCase()).join(' ');
    const primarySkillLower = (artisan.primarySkill || '').toLowerCase();
    const keywordsLower = (listing.searchKeywords || []).map((k) => k.toLowerCase()).join(' ');

    const combinedSearchText = `${titleLower} ${descLower} ${catLower} ${customCatLower} ${tagsLower} ${skillsLower} ${primarySkillLower} ${keywordsLower}`;

    // Direct exact phrase match
    if (titleLower.includes(q)) score += 45;
    else if (combinedSearchText.includes(q)) score += 35;

    // Word-level token matching with synonym expansion
    const tokens = q.split(/\s+/).filter((w) => w.length >= 2 && !['the', 'and', 'for', 'with', 'near', 'in'].includes(w));
    let matchedTokens = 0;

    for (const t of tokens) {
      let tokenMatched = false;

      // Direct match
      if (combinedSearchText.includes(t)) {
        tokenMatched = true;
      } else {
        // Synonym match
        const syns = SYNONYMS[t] || [];
        for (const s of syns) {
          if (combinedSearchText.includes(s)) {
            tokenMatched = true;
            break;
          }
        }
      }

      if (tokenMatched) {
        matchedTokens++;
      }
    }

    if (tokens.length > 0) {
      const matchRatio = matchedTokens / tokens.length;
      score += Math.round(matchRatio * 40);
    }
  }

  return Math.min(100, Math.max(10, Math.round(score)));
}

export function computeBudgetScore(price: number, maxBudget?: number): number {
  if (!maxBudget || maxBudget <= 0) return 90;
  if (price <= maxBudget) {
    // If under budget, perfect fit
    return 100;
  }
  // Exceeds budget: penalty proportional to excess
  const excessRatio = (price - maxBudget) / maxBudget;
  const penalty = excessRatio * 70;
  return Math.max(15, Math.round(100 - penalty));
}

export function calculateMatchScore(
  query: string,
  categoryFilter: string | undefined,
  maxBudget: number | undefined,
  buyerLat: number,
  buyerLng: number,
  artisan: ArtisanProfile,
  listing: Listing
): MatchScoreResult {
  const distanceKm = calculateDistanceKm(
    buyerLat,
    buyerLng,
    listing.approximateLat,
    listing.approximateLng
  );

  const skillCompatibility = computeSkillScore(query, categoryFilter, listing, artisan);
  const distanceProximity = computeDistanceScore(distanceKm);
  const makerRating = Math.min(100, Math.round((artisan.rating / 5.0) * 100));
  const budgetFit = computeBudgetScore(listing.price, maxBudget);

  // Formula as mandated:
  // match_score = 0.40 * skill_compatibility + 0.35 * distance_proximity + 0.15 * maker_rating + 0.10 * budget_fit
  const weighted =
    0.4 * skillCompatibility +
    0.35 * distanceProximity +
    0.15 * makerRating +
    0.1 * budgetFit;

  const matchScore = Math.min(99, Math.max(35, Math.round(weighted)));

  const reasons: string[] = [];
  if (skillCompatibility >= 70) {
    reasons.push('Direct skill & service match');
  } else if (skillCompatibility >= 40) {
    reasons.push('Relevant local craft category');
  }

  if (distanceKm <= 3.0) {
    reasons.push(`${distanceKm} km away (very close to you)`);
  } else if (distanceKm <= 7.0) {
    reasons.push(`${distanceKm} km away (nearby neighborhood)`);
  } else {
    reasons.push(`${distanceKm} km away`);
  }

  if (artisan.rating >= 4.8) {
    reasons.push(`Top-rated artisan (${artisan.rating}/5.0 with ${artisan.reviewCount}+ reviews)`);
  }

  if (listing.turnaroundHours <= 24) {
    reasons.push(`Fast turnaround (${listing.turnaroundDisplay})`);
  }

  if (!maxBudget || listing.price <= maxBudget) {
    reasons.push(`Fits your budget (₹${listing.price})`);
  }

  return {
    artisan,
    listing,
    matchScore,
    distanceKm,
    breakdown: {
      skillCompatibility,
      distanceProximity,
      makerRating,
      budgetFit,
    },
    reasons,
  };
}
