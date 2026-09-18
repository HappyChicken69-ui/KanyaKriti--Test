// ==========================================
// KANYAKRITI CLIENT CONTEXT-AWARE ARTISAN IMAGE RESOLVER
// Allows immediate visual preview of matching craft imagery
// before publishing to the live marketplace.
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

const CRAFT_IMAGE_RULES: ImageRule[] = [
  // 1. TAILORING & ALTERATIONS
  {
    keywords: ['blouse', 'fall', 'piko', 'saree', 'sari', 'pallu', 'choli'],
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['alteration', 'fitting', 'zip', 'zipper', 'slit', 'dart', 'hem', 'shorten'],
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['kurti', 'salwar', 'suit', 'dress', 'stitching', 'tailor', 'garment', 'sewing'],
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
  },

  // 2. EMBROIDERY & NEEDLEWORK
  {
    keywords: ['zari', 'zardozi', 'aari', 'kundan', 'bridal dupatta', 'golden thread'],
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['cushion', 'pillow', 'decor textile', 'table runner', 'curtain'],
    imageUrl: 'https://images.unsplash.com/photo-1606744888344-493238955de9?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['embroidery', 'needlework', 'chikankari', 'cross stitch', 'mirror work', 'hoop'],
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
  },

  // 3. COOKING & HOMESTYLE MEALS
  {
    keywords: ['tiffin', 'thali', 'lunch', 'dinner', 'homestyle', 'meal', 'dal', 'sabzi', 'curry', 'punjabi'],
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['paratha', 'roti', 'phulka', 'chapati', 'kulcha', 'naan', 'aloo paratha'],
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['biryani', 'pulao', 'rice', 'jeera rice', 'khichdi'],
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['cake', 'bake', 'baking', 'cupcake', 'pastry', 'cookie', 'bread', 'muffin'],
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['samosa', 'pakoda', 'pakora', 'bhajji', 'snack', 'namkeen', 'chaat'],
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  },

  // 4. BEVERAGES & SWEETS
  {
    keywords: ['coffee', 'filter coffee', 'decoction', 'kaapi', 'brew'],
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['tea', 'chai', 'masala chai', 'ginger tea'],
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['ladoo', 'laddu', 'sweet', 'mithai', 'halwa', 'mysore pak', 'ghee sweet', 'barfi', 'peda'],
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
  },

  // 5. PICKLES & PRESERVES
  {
    keywords: ['pickle', 'achar', 'avakaya', 'mango pickle', 'lemon pickle', 'garlic pickle', 'citron', 'chili pickle'],
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['chutney', 'podi', 'sambar podi', 'powder', 'spice mix', 'masala'],
    imageUrl: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&auto=format&fit=crop&q=80',
  },

  // 6. BEAUTY & WELLNESS
  {
    keywords: ['threading', 'eyebrow', 'wax', 'waxing', 'upper lip', 'hair removal'],
    imageUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['facial', 'clean-up', 'fruit clean-up', 'papaya', 'aloe vera', 'skincare', 'glow'],
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['champi', 'head massage', 'hair oil', 'massage', 'scalp', 'herbal oil'],
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
  },

  // 7. MEHENDI & HENNA
  {
    keywords: ['mehendi', 'mehndi', 'henna', 'bridal henna', 'arabic henna', 'mandala', 'sojat'],
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
  },

  // 8. POTTERY & TERRACOTTA
  {
    keywords: ['diya', 'diyas', 'clay diya', 'terracotta diya', 'pooja diya', 'deepam', 'oil lamp'],
    imageUrl: 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['pottery', 'clay pot', 'mud pot', 'terracotta', 'planter', 'bird bath', 'earthen'],
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80',
  },

  // 9. HANDICRAFTS & DECOR
  {
    keywords: ['macrame', 'plant hanger', 'rope', 'knot', 'boho', 'wall hanging'],
    imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['crochet', 'knit', 'knitting', 'wool', 'booties', 'baby cap', 'woolen'],
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['jute', 'bag', 'basket', 'tote', 'cane', 'bamboo', 'straw'],
    imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['wood', 'carving', 'wooden', 'toy', 'hand carved'],
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&auto=format&fit=crop&q=80',
  },

  // 10. JEWELRY & ACCESSORIES
  {
    keywords: ['jewelry', 'jewellery', 'necklace', 'earring', 'bangle', 'bead', 'terracotta jewelry'],
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
  },

  // 11. CANDLES & SOAPS
  {
    keywords: ['candle', 'candles', 'soy candle', 'scented', 'wax'],
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['soap', 'soaps', 'herbal soap', 'handmade soap', 'cold process'],
    imageUrl: 'https://images.unsplash.com/photo-1607006314605-feed533a0e69?w=600&auto=format&fit=crop&q=80',
  },

  // 12. PLANTS & GARDENING
  {
    keywords: ['plant', 'garden', 'indoor plant', 'nursery', 'sapling', 'compost', 'gardening'],
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80',
  },
];

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  Alterations: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80',
  Tailoring: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
  Cooking: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  Embroidery: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
  Beauty: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&auto=format&fit=crop&q=80',
  Handicrafts: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&auto=format&fit=crop&q=80',
  Other: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80',
};

export function resolveContextualListingImage(input: ImageContextInput): string {
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

  let bestMatchUrl: string | null = null;
  let highestScore = 0;

  for (const rule of CRAFT_IMAGE_RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      const lower = keyword.toLowerCase();
      if (corpus.includes(lower)) {
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

  const resolvedCategory = input.category || 'Other';
  return CATEGORY_DEFAULT_IMAGES[resolvedCategory] || CATEGORY_DEFAULT_IMAGES['Other'];
}
