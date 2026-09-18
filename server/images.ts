// ==========================================
// KANYAKRITI CONTEXT-AWARE ARTISAN IMAGE RESOLVER
// Maps artisan skills, crafts, categories, and keywords
// to authentic, high-quality craft-specific imagery.
// Never uses a single generic placeholder.
// ==========================================

export interface ImageContextInput {
  title?: string;
  category?: string;
  customCategory?: string;
  description?: string;
  tags?: string[];
  searchKeywords?: string[];
}

interface ImageRule {
  keywords: string[];
  imageUrl: string;
}

// Domain-specific authentic craft image definitions
const CRAFT_IMAGE_RULES: ImageRule[] = [
  // 1. TAILORING & ALTERATIONS
  {
    keywords: ['blouse', 'fall', 'piko', 'saree', 'sari', 'pallu', 'choli'],
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80', // Hand-stitched Indian silk saree with ornate border
  },
  {
    keywords: ['alteration', 'fitting', 'zip', 'zipper', 'slit', 'dart', 'hem', 'shorten'],
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80', // Artisan tailor workstation with sewing machine and tape
  },
  {
    keywords: ['kurti', 'salwar', 'suit', 'dress', 'stitching', 'tailor', 'garment', 'sewing'],
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80', // Tailoring fabric pattern, scissors, and garment measuring
  },

  // 2. EMBROIDERY & NEEDLEWORK
  {
    keywords: ['zari', 'zardozi', 'aari', 'kundan', 'bridal dupatta', 'golden thread'],
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80', // Intricate golden zari and aari hand embroidery
  },
  {
    keywords: ['cushion', 'pillow', 'decor textile', 'table runner', 'curtain'],
    imageUrl: 'https://images.unsplash.com/photo-1606744888344-493238955de9?w=600&auto=format&fit=crop&q=80', // Hand-embroidered raw silk cushion textiles
  },
  {
    keywords: ['embroidery', 'needlework', 'chikankari', 'cross stitch', 'mirror work', 'hoop'],
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80', // Fine hand needlecraft embroidery and threads
  },

  // 3. COOKING & HOMESTYLE MEALS
  {
    keywords: ['tiffin', 'thali', 'lunch', 'dinner', 'homestyle', 'meal', 'dal', 'sabzi', 'curry', 'punjabi'],
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80', // Fresh balanced Indian thali meal with rotis and curries
  },
  {
    keywords: ['paratha', 'roti', 'phulka', 'chapati', 'kulcha', 'naan', 'aloo paratha'],
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80', // Crisp golden stuffed paratha with butter & curd
  },
  {
    keywords: ['biryani', 'pulao', 'rice', 'jeera rice', 'khichdi'],
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', // Spiced homestyle artisanal biryani
  },
  {
    keywords: ['cake', 'bake', 'baking', 'cupcake', 'pastry', 'cookie', 'bread', 'muffin'],
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80', // Handcrafted artisan chocolate and fruit cake
  },
  {
    keywords: ['samosa', 'pakoda', 'pakora', 'bhajji', 'snack', 'namkeen', 'chaat'],
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', // Golden crispy samosas with fresh green chutney
  },

  // 4. BEVERAGES & SWEETS
  {
    keywords: ['coffee', 'filter coffee', 'decoction', 'kaapi', 'brew'],
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', // South Indian traditional brass filter coffee
  },
  {
    keywords: ['tea', 'chai', 'masala chai', 'ginger tea'],
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80', // Steaming aromatic clay cup of spiced masala chai
  },
  {
    keywords: ['ladoo', 'laddu', 'sweet', 'mithai', 'halwa', 'mysore pak', 'ghee sweet', 'barfi', 'peda'],
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80', // Golden handcrafted Indian besan ladoos with nuts
  },

  // 5. PICKLES & PRESERVES
  {
    keywords: ['pickle', 'achar', 'avakaya', 'mango pickle', 'lemon pickle', 'garlic pickle', 'citron', 'chili pickle'],
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80', // Traditional sun-cured spiced mango and lemon pickle jar
  },
  {
    keywords: ['chutney', 'podi', 'sambar podi', 'powder', 'spice mix', 'masala'],
    imageUrl: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&auto=format&fit=crop&q=80', // Stone-ground fresh aromatic Indian spice powders
  },

  // 6. BEAUTY & WELLNESS
  {
    keywords: ['threading', 'eyebrow', 'wax', 'waxing', 'upper lip', 'hair removal'],
    imageUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&auto=format&fit=crop&q=80', // Professional herbal salon treatment & eyebrow threading
  },
  {
    keywords: ['facial', 'clean-up', 'fruit clean-up', 'papaya', 'aloe vera', 'skincare', 'glow'],
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80', // Natural botanical fruit facial and skincare treatment
  },
  {
    keywords: ['champi', 'head massage', 'hair oil', 'massage', 'scalp', 'herbal oil'],
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80', // Relaxing natural herbal hair oil scalp massage
  },

  // 7. MEHENDI & HENNA
  {
    keywords: ['mehendi', 'mehndi', 'henna', 'bridal henna', 'arabic henna', 'mandala', 'sojat'],
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80', // Dark staining bridal mehendi artwork on hands
  },

  // 8. POTTERY & TERRACOTTA
  {
    keywords: ['diya', 'diyas', 'clay diya', 'terracotta diya', 'pooja diya', 'deepam', 'oil lamp'],
    imageUrl: 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?w=600&auto=format&fit=crop&q=80', // Hand-painted festive terracotta clay diyas with gold dust
  },
  {
    keywords: ['pottery', 'clay pot', 'mud pot', 'terracotta', 'planter', 'bird bath', 'earthen'],
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80', // Artisan spinning terracotta earthenware on potter wheel
  },

  // 9. HANDICRAFTS & DECOR
  {
    keywords: ['macrame', 'plant hanger', 'rope', 'knot', 'boho', 'wall hanging'],
    imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&auto=format&fit=crop&q=80', // Handcrafted knotted cotton macrame plant hanger
  },
  {
    keywords: ['crochet', 'knit', 'knitting', 'wool', 'booties', 'baby cap', 'woolen'],
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80', // Delicate handmade pastel woolen baby booties & crochet set
  },
  {
    keywords: ['jute', 'bag', 'basket', 'tote', 'cane', 'bamboo', 'straw'],
    imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80', // Handwoven natural eco-friendly jute and cane craft
  },
  {
    keywords: ['wood', 'carving', 'wooden', 'toy', 'hand carved'],
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&auto=format&fit=crop&q=80', // Hand-carved traditional wooden craft
  },

  // 10. JEWELRY & ACCESSORIES
  {
    keywords: ['jewelry', 'jewellery', 'necklace', 'earring', 'bangle', 'bead', 'terracotta jewelry'],
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80', // Handmade artisanal Indian jewelry and beads
  },

  // 11. CANDLES & SOAPS
  {
    keywords: ['candle', 'candles', 'soy candle', 'scented', 'wax'],
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80', // Hand-poured botanical scented soy candles
  },
  {
    keywords: ['soap', 'soaps', 'herbal soap', 'handmade soap', 'cold process'],
    imageUrl: 'https://images.unsplash.com/photo-1607006314605-feed533a0e69?w=600&auto=format&fit=crop&q=80', // Natural artisanal herbal cold-pressed soaps
  },

  // 12. PLANTS & GARDENING
  {
    keywords: ['plant', 'garden', 'indoor plant', 'nursery', 'sapling', 'compost', 'gardening'],
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80', // Potted indoor green plants and botanical garden care
  },
];

// Fallback images strictly per category if no specific craft keywords matched
const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  Alterations: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80', // Tailoring machine & measuring tape
  Tailoring: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80', // Tailoring garment drafting
  Cooking: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80', // Fresh balanced Indian thali meal
  Embroidery: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80', // Traditional needlework zari
  Beauty: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&auto=format&fit=crop&q=80', // Salon eyebrow & skincare
  Handicrafts: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&auto=format&fit=crop&q=80', // Handmade cotton macrame & home decor
  Other: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80', // Traditional handcrafted pottery
};

/**
 * Intelligently resolves an authentic, context-aware image URL
 * matching the artisan's actual work based on craft terms, category, title, and description.
 */
export function resolveContextualListingImage(input: ImageContextInput): string {
  // Aggregate all context into a single normalized search string
  const corpus = [
    input.title || '',
    input.category || '',
    input.customCategory || '',
    input.description || '',
    ...(input.tags || []),
    ...(input.searchKeywords || []),
  ]
    .join(' ')
    .toLowerCase();

  // Find the rule with the highest match count
  let bestMatchUrl: string | null = null;
  let highestScore = 0;

  for (const rule of CRAFT_IMAGE_RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      const lower = keyword.toLowerCase();
      if (corpus.includes(lower)) {
        // Boost matches appearing in title or customCategory
        if (input.title?.toLowerCase().includes(lower)) {
          score += 3;
        } else if (input.customCategory?.toLowerCase().includes(lower)) {
          score += 2;
        } else {
          score += 1;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatchUrl = rule.imageUrl;
    }
  }

  if (bestMatchUrl && highestScore > 0) {
    return bestMatchUrl;
  }

  // Fallback to category-level default
  const resolvedCategory = input.category || 'Other';
  return CATEGORY_DEFAULT_IMAGES[resolvedCategory] || CATEGORY_DEFAULT_IMAGES['Other'];
}
