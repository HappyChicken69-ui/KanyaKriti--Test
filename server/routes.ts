import express, { Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { db } from './db.ts';
import {
  extractSkillWithGroq,
  generateListingWithGroq,
  transcribeAudioWithGroq,
  GROQ_CONFIG,
} from './groq.ts';
import { calculateMatchScore, calculateDistanceKm } from './matching.ts';
import { parseBuyerIntent } from './intentParser.ts';
import { rankAndShortlistCandidates } from './aiShortlist.ts';
import { resolveContextualListingImage } from './images.ts';
import { OrderStatus, PaymentMethod } from '../src/types.ts';
import {
  mongoUserService,
  AppRole,
  hashPassword,
  comparePassword,
} from './mongodb.ts';
import {
  generateToken,
  setSessionCookie,
  clearSessionCookie,
  sanitizeUser,
  requireAuth,
  requireRole,
} from './auth.ts';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

const router = express.Router();

// ==========================================
// 1. AUTHENTICATION & IDENTITY (MONGODB + ZOD)
// ==========================================

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().min(8, 'Phone number must be at least 8 digits').optional().or(z.literal('')),
  password: z.string().min(6, 'Please choose a stronger password (at least 6 characters)'),
  role: z.enum(['BUYER', 'ARTISAN', 'RUNNER', 'ADMIN', 'buyer', 'artisan', 'runner', 'admin']).optional(),
  preferredLanguage: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
}).refine((data) => !!(data.email || data.phone), {
  message: 'Please provide either an email or a phone number.',
  path: ['email'],
});

const LoginSchema = z.object({
  identifier: z.string().min(1, 'Email/phone or password is required.'),
  password: z.string().min(1, 'Email/phone or password is required.'),
  role: z.enum(['BUYER', 'ARTISAN', 'RUNNER', 'ADMIN', 'buyer', 'artisan', 'runner', 'admin']).optional(),
});

// Helper: Common Registration handler
async function handleUserRegistration(req: Request, res: Response, forcedRole?: AppRole) {
  try {
    const parseResult = RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Invalid registration details';
      return res.status(400).json({ error: firstError });
    }

    const { name, email, phone, password, role, preferredLanguage, city, neighborhood } = parseResult.data;
    const targetRole: AppRole = forcedRole || (role ? (role.toUpperCase() as AppRole) : 'BUYER');

    const identifier = (email && email.trim().length > 0) ? email.trim() : (phone?.trim() || '');

    // 1. Check if user already exists in MongoDB
    const existing = await mongoUserService.findUserByEmailOrPhone(identifier);
    if (existing) {
      return res.status(409).json({ error: 'An account with these details already exists.' });
    }

    // 2. Hash password securely with bcrypt
    const password_hash = await hashPassword(password);
    const resolvedEmail = (email && email.trim().length > 0)
      ? email.trim().toLowerCase()
      : `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}@kanyakriti.local`;
    const resolvedPhone = (phone && phone.trim().length > 0) ? phone.trim() : '+91 99000 00000';

    // Explicitly prohibit public Administrator signup
    if (targetRole === 'ADMIN') {
      return res.status(403).json({
        error: 'Public registration for Administrator accounts is restricted. Please log in with authorized administrator credentials.',
        code: 'ADMIN_REGISTRATION_RESTRICTED',
      });
    }

    // 3. Create MongoDB User
    const newUser = await mongoUserService.createUser({
      name: name.trim(),
      email: resolvedEmail,
      phone: resolvedPhone,
      password_hash,
      role: targetRole,
      avatar_url: targetRole === 'ARTISAN'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
        : targetRole === 'RUNNER'
        ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    // 4. Role Profile Separation in MongoDB
    if (targetRole === 'ARTISAN') {
      await mongoUserService.createArtisanProfile({
        user_id: newUser._id,
        name: newUser.name,
        avatar_url: newUser.avatar_url,
        bio: 'Skilled artisan crafting authentic local goods with care.',
        primary_skill: 'General Craftsmanship',
        skills: ['Artisan Craft'],
        rating: 5.0,
        review_count: 0,
        total_earned: 0,
        pending_balance: 0,
        available_balance: 0,
        first_thousand_reached: false,
        languages: preferredLanguage ? [preferredLanguage, 'English'] : ['Hindi', 'English'],
        approximate_lat: 12.9345,
        approximate_lng: 77.6265,
        neighborhood: neighborhood || 'Local Neighborhood',
        city: city || 'Local Area',
        phone: newUser.phone,
      });

      // Synchronize with runtime database store for immediate marketplace/matching/order support
      db.users.push({
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: 'artisan',
        phone: newUser.phone,
        avatar: newUser.avatar_url,
        city: city || 'Local Area',
        neighborhood: neighborhood || 'Local Neighborhood',
        lat: 12.9345,
        lng: 77.6265,
        created_at: newUser.created_at,
      });

      db.artisanProfiles.push({
        id: `ap-${newUser._id}`,
        userId: newUser._id,
        name: newUser.name,
        avatar: newUser.avatar_url,
        bio: 'Skilled artisan crafting authentic local goods with care.',
        primarySkill: 'General Craftsmanship',
        skills: ['Artisan Craft'],
        rating: 5.0,
        reviewCount: 0,
        totalEarned: 0,
        pendingBalance: 0,
        availableBalance: 0,
        firstThousandReached: false,
        approximateLat: 12.9345,
        approximateLng: 77.6265,
        neighborhood: neighborhood || 'Local Neighborhood',
        city: city || 'Local Area',
        languages: preferredLanguage ? [preferredLanguage, 'English'] : ['Hindi', 'English'],
        phone: newUser.phone,
      });
    } else if (targetRole === 'BUYER') {
      await mongoUserService.createBuyerProfile({
        user_id: newUser._id,
        name: newUser.name,
        preferred_categories: ['Tailoring', 'Cooking'],
        default_address: `${neighborhood || 'Local Neighborhood'}, ${city || 'Local Area'}`,
        neighborhood: neighborhood || 'Local Neighborhood',
        city: city || 'Local Area',
        lat: typeof req.body.lat === 'number' ? req.body.lat : (db.activeLocation?.latitude ?? 0),
        lng: typeof req.body.lng === 'number' ? req.body.lng : (db.activeLocation?.longitude ?? 0),
      });

      db.users.push({
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: 'buyer',
        phone: newUser.phone,
        avatar: newUser.avatar_url,
        city: city || 'Local Area',
        neighborhood: neighborhood || 'Local Neighborhood',
        lat: typeof req.body.lat === 'number' ? req.body.lat : (db.activeLocation?.latitude ?? 0),
        lng: typeof req.body.lng === 'number' ? req.body.lng : (db.activeLocation?.longitude ?? 0),
        created_at: newUser.created_at,
      });
    } else if (targetRole === 'RUNNER') {
      await mongoUserService.createRunnerProfile({
        user_id: newUser._id,
        name: newUser.name,
        vehicle_type: (req.body.vehicleType as string) || 'Electric Two-Wheeler',
        is_available: true,
        rating: 5.0,
        total_deliveries: 0,
        neighborhood: neighborhood || 'Local Neighborhood',
        city: city || 'Local Area',
        lat: typeof req.body.lat === 'number' ? req.body.lat : (db.activeLocation?.latitude ?? 0),
        lng: typeof req.body.lng === 'number' ? req.body.lng : (db.activeLocation?.longitude ?? 0),
      });

      db.users.push({
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: 'runner',
        phone: newUser.phone,
        avatar: newUser.avatar_url,
        city: city || 'Local Area',
        neighborhood: neighborhood || 'Local Neighborhood',
        lat: 12.9348,
        lng: 77.6258,
        created_at: newUser.created_at,
      });
    }

    // 5. Generate secure JWT & set HttpOnly Session Cookie
    const token = generateToken(newUser);
    setSessionCookie(res, token);

    return res.status(201).json({
      success: true,
      user: sanitizeUser(newUser),
      token,
      message: 'Account created successfully',
    });
  } catch (err: any) {
    console.error('[Auth Register] Error:', err);
    return res.status(500).json({ error: "We're having trouble connecting. Please try again." });
  }
}

// Helper: Common Login handler
async function handleUserLogin(req: Request, res: Response, expectedRole?: AppRole) {
  try {
    const rawId = req.body.identifier || req.body.email || req.body.phone;
    const rawPassword = req.body.password;

    if (!rawId || !rawPassword) {
      return res.status(400).json({ error: 'Email/phone or password is required.' });
    }

    // 1. Look up user in MongoDB by email or phone
    const user = await mongoUserService.findUserByEmailOrPhone(rawId);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Email/phone or password is incorrect.' });
    }

    // 2. Verify password with bcrypt
    const isMatch = await comparePassword(rawPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email/phone or password is incorrect.' });
    }

    // 3. Verify role if targeted by role portal
    const targetRole = expectedRole || (req.body.role ? (req.body.role.toUpperCase() as AppRole) : undefined);
    if (targetRole && user.role !== targetRole) {
      return res.status(403).json({
        error: `This account is registered as ${user.role}. Please log in via the ${user.role.toLowerCase()} portal.`,
        requiredRole: targetRole,
        userRole: user.role,
      });
    }

    // 4. Update last login timestamp in MongoDB
    await mongoUserService.updateLastLogin(user._id);

    // 5. Ensure in-memory sync for existing orders/ratings
    if (!db.getUserById(user._id)) {
      db.users.push({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase() as any,
        phone: user.phone,
        avatar: user.avatar_url,
        city: 'Local Area',
        neighborhood: 'Local Neighborhood',
        lat: 12.9345,
        lng: 77.6265,
        created_at: user.created_at,
      });
    }

    // 6. Generate secure JWT & set HttpOnly Session Cookie
    const token = generateToken(user);
    setSessionCookie(res, token);

    return res.json({
      success: true,
      user: sanitizeUser(user),
      token,
      message: 'Logged in successfully',
    });
  } catch (err: any) {
    console.error('[Auth Login] Error:', err);
    return res.status(500).json({ error: "We're having trouble connecting. Please try again." });
  }
}

// General Register
router.post('/auth/register', (req: Request, res: Response) => {
  return handleUserRegistration(req, res);
});

// Dedicated Artisan Register
router.post('/auth/artisan/register', (req: Request, res: Response) => {
  return handleUserRegistration(req, res, 'ARTISAN');
});

// Dedicated Buyer Register
router.post('/auth/buyer/register', (req: Request, res: Response) => {
  return handleUserRegistration(req, res, 'BUYER');
});

// Dedicated Runner Register
router.post('/auth/runner/register', (req: Request, res: Response) => {
  return handleUserRegistration(req, res, 'RUNNER');
});

// Disallow public Admin Register
router.post('/auth/admin/register', (_req: Request, res: Response) => {
  return res.status(403).json({
    error: 'Public registration for Administrator accounts is restricted. Please log in with authorized administrator credentials.',
    code: 'ADMIN_REGISTRATION_RESTRICTED',
  });
});

// General Login
router.post('/auth/login', (req: Request, res: Response) => {
  // Support legacy demo body with only userId or role when in hackathon demo mode
  if (!req.body.password && (req.body.userId || req.body.role)) {
    if (req.body.userId) {
      const user = db.getUserById(req.body.userId);
      if (user) return res.json({ success: true, user });
    }
    if (req.body.role) {
      const user = db.users.find((u) => u.role === req.body.role);
      if (user) return res.json({ success: true, user });
    }
  }
  return handleUserLogin(req, res);
});

// Dedicated Artisan Login
router.post('/auth/artisan/login', (req: Request, res: Response) => {
  return handleUserLogin(req, res, 'ARTISAN');
});

// Dedicated Buyer Login
router.post('/auth/buyer/login', (req: Request, res: Response) => {
  return handleUserLogin(req, res, 'BUYER');
});

// Dedicated Runner Login
router.post('/auth/runner/login', (req: Request, res: Response) => {
  return handleUserLogin(req, res, 'RUNNER');
});

// Dedicated Admin Login
router.post('/auth/admin/login', (req: Request, res: Response) => {
  return handleUserLogin(req, res, 'ADMIN');
});

// Logout (clears HttpOnly cookie)
router.post('/auth/logout', (_req: Request, res: Response) => {
  clearSessionCookie(res);
  return res.json({ success: true, message: 'Logged out successfully' });
});

// Current Session Info
router.get('/auth/me', (req: Request, res: Response) => {
  if (req.user) {
    return res.json({
      user: sanitizeUser(req.user),
      isDemo: !!req.isDemoSession,
      authenticated: true,
    });
  }

  // Fallback demo lookup for demo switcher header
  const demoUserId = req.headers['x-user-id'] as string;
  if (demoUserId) {
    const user = db.getUserById(demoUserId);
    if (user) {
      return res.json({ user, isDemo: true, authenticated: true });
    }
  }

  return res.status(401).json({
    error: 'Your session has expired. Please log in again.',
    authenticated: false,
  });
});

// MongoDB Status endpoint
router.get('/db/status', (_req: Request, res: Response) => {
  return res.json({
    mongoStatus: mongoUserService.status,
    isLive: mongoUserService.status === 'LIVE_CONNECTED',
    database: process.env.MONGODB_DB_NAME || 'kanyakriti_db',
    lastError: mongoUserService.lastError,
  });
});

// ==========================================
// 2. AI VOICE & LISTING ENDPOINTS
// ==========================================

router.post('/ai/transcribe', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    let audioBuffer: Buffer | null = null;
    let mimeType = 'audio/webm';
    let filename = 'voice_recording.webm';

    if (req.file) {
      audioBuffer = req.file.buffer;
      mimeType = req.file.mimetype || 'audio/webm';
      filename = req.file.originalname || 'voice_recording.webm';
    } else if (req.body?.audioData) {
      const base64Data = req.body.audioData.replace(/^data:audio\/[a-z0-9]+;base64,/, '');
      audioBuffer = Buffer.from(base64Data, 'base64');
      mimeType = req.body.mimeType || 'audio/webm';
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      // If empty recording or test trigger, return friendly transcription
      return res.json({
        transcript: 'I stitch blouse alterations. I charge around 250 rupees and can finish it by tomorrow.',
      });
    }

    const requestedLang = (req.body?.language as string) || (req.headers['x-language'] as string);
    const transcript = await transcribeAudioWithGroq(audioBuffer, filename, mimeType, requestedLang);
    return res.json({ transcript });
  } catch (err: any) {
    console.error('[Groq] AI transcribe error:', err);
    return res.status(500).json({ error: 'Failed to transcribe audio note' });
  }
});

router.post('/ai/extract-skill', async (req: Request, res: Response) => {
  try {
    const { spokenText, language } = req.body;
    if (!spokenText || typeof spokenText !== 'string' || spokenText.trim() === '') {
      return res.status(400).json({ error: 'spokenText is required' });
    }
    const extracted = await extractSkillWithGroq(spokenText.trim(), language);
    return res.json(extracted);
  } catch (err: any) {
    console.error('[Groq] AI extraction error:', err);
    return res.status(500).json({ error: 'Failed to extract skill information' });
  }
});

router.post('/ai/generate-listing', async (req: Request, res: Response) => {
  try {
    const { extracted, artisanName } = req.body;
    if (!extracted) {
      return res.status(400).json({ error: 'extracted skill details are required' });
    }
    const generated = await generateListingWithGroq(extracted, artisanName || 'Local Artisan');
    return res.json(generated);
  } catch (err: any) {
    console.error('[Groq] AI listing generation error:', err);
    return res.status(500).json({ error: 'Failed to generate listing' });
  }
});

// ==========================================
// 3. ARTISANS ENDPOINTS
// ==========================================

router.get('/artisans', (_req: Request, res: Response) => {
  return res.json({ artisans: db.artisanProfiles });
});

router.get('/artisans/:id', (req: Request, res: Response) => {
  const artisan = db.getArtisanProfileById(req.params.id);
  if (!artisan) {
    return res.status(404).json({ error: 'Artisan not found' });
  }
  const artisanListings = db.listings.filter((l) => l.artisanId === artisan.userId || l.artisanId === artisan.id);
  const artisanReviews = db.reviews.filter((r) => r.artisanId === artisan.userId || r.artisanId === artisan.id);
  return res.json({ artisan, listings: artisanListings, reviews: artisanReviews });
});

router.post('/artisans/profile', (req: Request, res: Response) => {
  const { userId, ...data } = req.body;
  const updated = db.updateArtisanProfile(userId, data);
  if (!updated) {
    return res.status(404).json({ error: 'Artisan profile not found' });
  }
  return res.json({ artisan: updated });
});

router.put('/artisans/profile', (req: Request, res: Response) => {
  const { userId, ...data } = req.body;
  const updated = db.updateArtisanProfile(userId, data);
  if (!updated) {
    return res.status(404).json({ error: 'Artisan profile not found' });
  }
  return res.json({ artisan: updated });
});

// ==========================================
// 4. LISTINGS ENDPOINTS
// ==========================================

router.get('/listings', (req: Request, res: Response) => {
  const { category, search, artisanId } = req.query;
  // Ensure database store is deduplicated
  db.deduplicateListings();
  let results = [...db.listings];

  if (artisanId) {
    results = results.filter((l) => l.artisanId === artisanId);
  }
  if (category && category !== 'All') {
    results = results.filter((l) => l.category.toLowerCase() === (category as string).toLowerCase());
  }
  if (search) {
    const q = (search as string).toLowerCase();
    results = results.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return res.json({ listings: results });
});

router.get('/listings/:id', (req: Request, res: Response) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  const artisan = db.getArtisanProfileById(listing.artisanId);
  return res.json({ listing, artisan });
});

router.post('/listings', async (req: Request, res: Response) => {
  const {
    artisanId,
    title,
    description,
    category,
    customCategory,
    price,
    turnaroundHours,
    turnaroundDisplay,
    searchKeywords,
    tags,
    imageUrl,
  } = req.body;

  if (!artisanId || !title || !price || !category) {
    return res.status(400).json({ error: 'Missing required fields: artisanId, title, price, category' });
  }

  // Idempotency check: prevent duplicate listing for same artisan with same title/details
  const existingDuplicate = db.findDuplicateListing(artisanId, title, description);
  if (existingDuplicate) {
    console.log(`[POST /listings] Duplicate submission detected for artisan ${artisanId} ("${title}"). Returning existing ${existingDuplicate.id}`);
    return res.status(200).json({ listing: existingDuplicate, isExisting: true });
  }

  const artisan = db.getArtisanProfileById(artisanId) || db.getArtisanProfileByUserId(artisanId);
  const artisanName = artisan ? artisan.name : 'Sunita Devi';
  const artisanAvatar = artisan ? artisan.avatar : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';
  const approximateLat = artisan ? artisan.approximateLat : (db.activeLocation?.latitude ?? 0);
  const approximateLng = artisan ? artisan.approximateLng : (db.activeLocation?.longitude ?? 0);
  const neighborhood = artisan ? artisan.neighborhood : (db.activeLocation?.locality ?? 'Local Neighborhood');
  const city = artisan ? artisan.city : (db.activeLocation?.city ?? 'Local Area');

  // Resolve authentic context-aware image matching the actual craft/work
  const resolvedCategory = category;
  const resolvedCustomCategory = customCategory || (category !== 'Other' && !['Tailoring', 'Cooking', 'Alterations', 'Handicrafts', 'Embroidery', 'Beauty'].includes(category) ? category : undefined);

  const matchedImageUrl = (imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 10 && !imageUrl.includes('placeholder'))
    ? imageUrl.trim()
    : resolveContextualListingImage({
        title,
        category: resolvedCategory,
        customCategory: resolvedCustomCategory,
        description,
        tags,
        searchKeywords,
      });

  const newListing = db.addListing({
    artisanId,
    artisanName,
    artisanAvatar,
    artisanRating: artisan ? artisan.rating : 4.9,
    artisanReviewCount: artisan ? artisan.reviewCount : 1,
    title,
    description,
    category: resolvedCategory,
    customCategory: resolvedCustomCategory,
    price: Number(price),
    currency: 'INR',
    turnaroundHours: Number(turnaroundHours) || 24,
    turnaroundDisplay: turnaroundDisplay || 'Within 1 day',
    searchKeywords: searchKeywords || [title.toLowerCase()],
    tags: tags || ['#LocalArtisan'],
    availability: true,
    approximateLat,
    approximateLng,
    neighborhood,
    city,
    imageUrl: matchedImageUrl,
  });

  // Persist to MongoDB collection (or embedded memory store)
  await mongoUserService.saveListing(newListing);

  return res.status(201).json({ listing: newListing });
});

// ==========================================
// 5. HYPERLOCAL MATCHING ENGINE
// ==========================================

router.post('/location/active', (req: Request, res: Response) => {
  const { latitude, longitude, locality, city, source } = req.body;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Valid numerical latitude and longitude are required' });
  }

  db.setActiveLocation({
    latitude,
    longitude,
    locality,
    city,
    source,
  });

  return res.json({
    success: true,
    activeLocation: db.activeLocation,
    totalListings: db.listings.length,
  });
});

router.get('/location/active', (_req: Request, res: Response) => {
  return res.json({
    activeLocation: db.activeLocation,
  });
});

// ==========================================
// 5. BUYER SEARCH, SUGGESTIONS & AI SHORTLISTING
// ==========================================

router.get('/search/suggestions', (req: Request, res: Response) => {
  const q = ((req.query.q as string) || '').trim().toLowerCase();

  const allListings = db.listings;
  const allArtisans = db.artisanProfiles;

  if (!q) {
    // Dynamic popular suggestions based on real active services in seed/mongo database
    const defaultSuggestions = [
      { text: 'Blouse alteration tomorrow', type: 'service', subtitle: 'In Alterations • Fast 24h turnaround' },
      { text: 'Homestyle Punjabi tiffin', type: 'service', subtitle: 'In Cooking • Fresh homemade thali' },
      { text: 'Bridal mehendi near me', type: 'service', subtitle: 'In Beauty • Natural organic henna' },
      { text: 'Hand embroidery under ₹500', type: 'service', subtitle: 'In Embroidery • Zari & aari work' },
      { text: 'Handmade macrame planters', type: 'service', subtitle: 'In Handicrafts • 100% cotton craft' },
      { text: 'Saree fall & piko finishing', type: 'service', subtitle: 'In Tailoring • Within 1 day' },
    ];
    return res.json({ suggestions: defaultSuggestions });
  }

  const matches: Array<{ text: string; type: 'service' | 'category' | 'skill'; subtitle?: string }> = [];
  const seenTexts = new Set<string>();

  // 1. Categories
  const categories = ['Tailoring', 'Alterations', 'Cooking', 'Handicrafts', 'Embroidery', 'Beauty'];
  for (const cat of categories) {
    if (cat.toLowerCase().includes(q)) {
      const count = allListings.filter((l) => l.category.toLowerCase() === cat.toLowerCase()).length;
      matches.push({
        text: cat,
        type: 'category',
        subtitle: `${count} verified ${cat.toLowerCase()} artisans nearby`,
      });
      seenTexts.add(cat.toLowerCase());
    }
  }

  // 2. Real Listing titles & keywords
  for (const listing of allListings) {
    const title = listing.title;
    if (title.toLowerCase().includes(q) && !seenTexts.has(title.toLowerCase())) {
      matches.push({
        text: title,
        type: 'service',
        subtitle: `₹${listing.price} • by ${listing.artisanName} (${listing.neighborhood})`,
      });
      seenTexts.add(title.toLowerCase());
    }
    // Also check keywords
    for (const kw of listing.searchKeywords || []) {
      if (kw.toLowerCase().includes(q) && !seenTexts.has(kw.toLowerCase()) && kw.length > 3) {
        matches.push({
          text: kw.charAt(0).toUpperCase() + kw.slice(1),
          type: 'service',
          subtitle: `In ${listing.category} • from ₹${listing.price}`,
        });
        seenTexts.add(kw.toLowerCase());
      }
    }
  }

  // 3. Real Artisan skills
  for (const artisan of allArtisans) {
    for (const skill of artisan.skills || []) {
      if (skill.toLowerCase().includes(q) && !seenTexts.has(skill.toLowerCase())) {
        matches.push({
          text: skill,
          type: 'skill',
          subtitle: `Verified skill of ${artisan.name}`,
        });
        seenTexts.add(skill.toLowerCase());
      }
    }
  }

  // 4. Natural query templates
  if (!q.includes('near me') && matches.length > 0) {
    const nearMeText = `${q} near me`;
    if (!seenTexts.has(nearMeText.toLowerCase())) {
      matches.push({
        text: nearMeText,
        type: 'service',
        subtitle: `Search nearby in your active neighbourhood`,
      });
      seenTexts.add(nearMeText.toLowerCase());
    }
  }

  return res.json({ suggestions: matches.slice(0, 8) });
});

router.post('/match', async (req: Request, res: Response) => {
  try {
    const { query, category, maxBudget, buyerLat, buyerLng, radiusKm, locality, city } = req.body;

    // Determine active coordinates: passed explicitly from client, or from db.activeLocation
    let lat = typeof buyerLat === 'number' && !isNaN(buyerLat) ? buyerLat : db.activeLocation?.latitude;
    let lng = typeof buyerLng === 'number' && !isNaN(buyerLng) ? buyerLng : db.activeLocation?.longitude;

    if (lat === undefined || lng === undefined) {
      return res.json({
        matches: [],
        total: 0,
        criteria: {
          buyerLocation: null,
          radiusKm: typeof radiusKm === 'number' ? radiusKm : 5,
          needsLocation: true,
        },
      });
    }

    // Ensure community listings and artisans are localized to the active center
    if (!db.activeLocation || db.activeLocation.latitude !== lat || db.activeLocation.longitude !== lng) {
      db.setActiveLocation({
        latitude: lat,
        longitude: lng,
        locality: locality || db.activeLocation?.locality,
        city: city || db.activeLocation?.city,
      });
    }

    const maxRadius = typeof radiusKm === 'number' && radiusKm > 0 ? radiusKm : 5;

    // 1. Natural Language Intent Parsing
    const parsedIntent = parseBuyerIntent(
      query || '',
      category && category !== 'All' ? category : undefined,
      maxBudget ? Number(maxBudget) : undefined
    );

    const activeCategory = category && category !== 'All' ? category : parsedIntent.category;
    const effectiveBudget = maxBudget ? Number(maxBudget) : parsedIntent.maxBudget;

    // 2. Candidate Retrieval & Strict Hard Constraints (Applied BEFORE Scoring & AI)
    db.deduplicateListings();
    const candidateListings = db.listings.filter((listing) => {
      // Hard Constraint: Must be available
      if (listing.availability === false) return false;

      // Hard Constraint: Radius (distance cannot exceed selected radius)
      const distance = calculateDistanceKm(lat!, lng!, listing.approximateLat, listing.approximateLng);
      if (distance > maxRadius) return false;

      // Hard Constraint: Category (if specified)
      if (activeCategory && activeCategory !== 'All') {
        const catLower = activeCategory.toLowerCase();
        const lCatLower = (listing.category || '').toLowerCase();
        const lCustomCatLower = (listing.customCategory || '').toLowerCase();
        if (lCatLower !== catLower && lCustomCatLower !== catLower) {
          return false;
        }
      }

      // Hard Constraint: Budget (if specified from dropdown or natural query)
      if (effectiveBudget && effectiveBudget > 0) {
        if (listing.price > effectiveBudget) return false;
      }

      return true;
    });

    // 3. Deterministic Multi-Factor Scoring
    const rawMatches = candidateListings.map((listing) => {
      const artisan = db.getArtisanProfileById(listing.artisanId) || db.artisanProfiles[0];
      return calculateMatchScore(
        parsedIntent.cleanedQuery || query || '',
        activeCategory,
        effectiveBudget,
        lat!,
        lng!,
        artisan,
        listing
      );
    });

    // 4. AI Shortlisting & Relevance Ranking Pipeline
    const shortlistResult = await rankAndShortlistCandidates(parsedIntent, rawMatches);

    return res.json({
      matches: shortlistResult.matches,
      total: shortlistResult.matches.length,
      parsedIntent,
      shortlistSummary: shortlistResult.shortlistSummary,
      isAiEnhanced: shortlistResult.isAiEnhanced,
      criteria: {
        formula: '0.40 * skill_compatibility + 0.35 * distance_proximity + 0.15 * maker_rating + 0.10 * budget_fit',
        buyerLocation: { lat, lng },
        radiusKm: maxRadius,
        effectiveBudget,
        effectiveCategory: activeCategory || 'All',
      },
    });
  } catch (err: any) {
    console.error('[API /match] Error computing matches:', err);
    return res.status(500).json({ error: 'Failed to compute matches', message: err?.message });
  }
});

router.get('/match/nearby', (req: Request, res: Response) => {
  const reqLat = parseFloat(req.query.lat as string);
  const reqLng = parseFloat(req.query.lng as string);
  const lat = !isNaN(reqLat) ? reqLat : db.activeLocation?.latitude;
  const lng = !isNaN(reqLng) ? reqLng : db.activeLocation?.longitude;

  if (lat === undefined || lng === undefined) {
    return res.json({ matches: [] });
  }

  const radius = parseFloat(req.query.radius as string) || 5;

  const matches = db.listings.map((listing) => {
    const artisan = db.getArtisanProfileById(listing.artisanId) || db.artisanProfiles[0];
    return calculateMatchScore('', undefined, undefined, lat, lng, artisan, listing);
  }).filter((m) => m.distanceKm <= radius);

  matches.sort((a, b) => a.distanceKm - b.distanceKm);

  return res.json({ matches });
});

// ==========================================
// 6. ORDER SYSTEM & STATE MACHINE
// ==========================================

router.get('/orders', (req: Request, res: Response) => {
  const { role, userId } = req.query;
  let list = [...db.orders];

  if (userId) {
    if (role === 'artisan') {
      list = list.filter((o) => o.artisanId === userId);
    } else if (role === 'buyer') {
      list = list.filter((o) => o.buyerId === userId);
    } else if (role === 'runner') {
      list = list.filter((o) => o.runnerId === userId || o.status === 'READY');
    }
  }

  return res.json({ orders: list });
});

router.get('/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json({ order });
});

router.post('/orders', (req: Request, res: Response) => {
  const { buyerId, listingId, paymentMethod, deliveryAddress, instructions } = req.body;

  if (!buyerId || !listingId) {
    return res.status(400).json({ error: 'buyerId and listingId are required' });
  }

  const result = db.createOrder({
    buyerId,
    listingId,
    paymentMethod: (paymentMethod as PaymentMethod) || 'UPI',
    deliveryAddress: deliveryAddress || 'Local Doorstep Address, Local Area',
    instructions,
  });

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(201).json({ order: result.order });
});

router.patch('/orders/:id/status', (req: Request, res: Response) => {
  const { status, runnerId, actorRole } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const result = db.updateOrderStatus(req.params.id, status as OrderStatus, runnerId, actorRole);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({ order: result.order });
});

// ==========================================
// 7. RUNNER & DELIVERY ENDPOINTS
// ==========================================

router.get('/deliveries', (_req: Request, res: Response) => {
  // Available deliveries: READY orders waiting for runner
  const available = db.orders.filter((o) => o.status === 'READY' && !o.runnerId);
  // Active deliveries: PICKED_UP or ongoing assigned to runner
  const active = db.orders.filter((o) => o.runnerId && (o.status === 'READY' || o.status === 'PICKED_UP'));
  return res.json({ available, active, all: db.orders });
});

router.post('/deliveries/:id/accept', (req: Request, res: Response) => {
  // Enforce role check: Only RUNNER or ADMIN can accept deliveries
  if (req.user && req.user.role !== 'RUNNER' && req.user.role !== 'ADMIN' && !req.isDemoSession) {
    return res.status(403).json({
      error: "You don't have permission to access this page.",
      code: 'FORBIDDEN_ROLE',
    });
  }

  const { runnerId } = req.body;
  const effectiveRunnerId = (req.user && req.user.role === 'RUNNER') ? req.user._id : (runnerId || 'runner-1');
  const result = db.assignRunnerToOrder(req.params.id, effectiveRunnerId);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({ order: result.order });
});

router.patch('/deliveries/:id/status', (req: Request, res: Response) => {
  // Enforce role check
  if (req.user && req.user.role !== 'RUNNER' && req.user.role !== 'ADMIN' && !req.isDemoSession) {
    return res.status(403).json({
      error: "You don't have permission to access this page.",
      code: 'FORBIDDEN_ROLE',
    });
  }

  const { status, runnerId } = req.body;
  const effectiveRunnerId = (req.user && req.user.role === 'RUNNER') ? req.user._id : (runnerId || 'runner-1');
  const result = db.updateOrderStatus(req.params.id, status as OrderStatus, effectiveRunnerId, 'runner');
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({ order: result.order });
});

router.post('/deliveries/:id/location', (req: Request, res: Response) => {
  const { lat, lng } = req.body;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'lat and lng must be numbers' });
  }
  const order = db.updateRunnerLocation(req.params.id, lat, lng);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json({ success: true, runnerLat: lat, runnerLng: lng });
});

// ==========================================
// 8. PAYMENTS & EARNINGS ENDPOINTS
// ==========================================

router.post('/payments/simulate', (req: Request, res: Response) => {
  const { orderId, paymentMethod, status } = req.body;
  const order = db.getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.paymentMethod = paymentMethod || 'UPI';
  order.paymentStatus = status || 'SUCCESS';
  db.broadcastEvent({ type: 'PAYMENT_UPDATED', orderId, paymentStatus: order.paymentStatus });

  return res.json({
    success: true,
    orderId,
    status: order.paymentStatus,
    amount: order.totalAmount,
    gatewayRef: `UPI-${Date.now().toString(36).toUpperCase()}`,
  });
});

router.get('/earnings', (req: Request, res: Response) => {
  // Strict role security check
  if (req.user) {
    // 1. Buyers and Runners cannot access earnings
    if (req.user.role === 'BUYER' || req.user.role === 'RUNNER') {
      return res.status(403).json({
        error: "You don't have permission to access this page.",
        code: 'FORBIDDEN_ROLE',
      });
    }

    // 2. Artisans can only view their own earnings unless they are admin or in demo mode
    if (req.user.role === 'ARTISAN' && !req.isDemoSession) {
      const requestedId = req.query.artisanId as string;
      if (requestedId && requestedId !== req.user._id && requestedId !== `ap-${req.user._id}`) {
        return res.status(403).json({
          error: "You don't have permission to access another artisan's private data.",
          code: 'FORBIDDEN_ACCESS',
        });
      }
    }
  }

  const artisanId = (req.query.artisanId as string) || (req.user ? req.user._id : 'artisan-1');
  const profile = db.getArtisanProfileById(artisanId) || db.getArtisanProfileByUserId(artisanId);
  if (!profile) {
    return res.status(404).json({ error: 'Artisan profile not found' });
  }

  const txs = db.transactions.filter((t) => t.artisanId === profile.userId || t.artisanId === profile.id);
  const completedOrders = db.orders.filter(
    (o) => (o.artisanId === profile.userId || o.artisanId === profile.id) && o.status === 'COMPLETED'
  );

  return res.json({
    totalEarned: profile.totalEarned,
    availableBalance: profile.availableBalance,
    pendingBalance: profile.pendingBalance,
    firstThousandReached: profile.firstThousandReached,
    milestoneProgress: Math.min(100, Math.round((profile.totalEarned / 1000) * 100)),
    completedOrdersCount: completedOrders.length,
    transactions: txs,
  });
});

router.get('/earnings/transactions', (req: Request, res: Response) => {
  // Role security check
  if (req.user && (req.user.role === 'BUYER' || req.user.role === 'RUNNER')) {
    return res.status(403).json({
      error: "You don't have permission to access this page.",
      code: 'FORBIDDEN_ROLE',
    });
  }

  const artisanId = (req.query.artisanId as string) || (req.user ? req.user._id : 'artisan-1');
  const txs = db.transactions.filter((t) => t.artisanId === artisanId);
  return res.json({ transactions: txs });
});

// Admin-only metrics endpoint with strict authorization
router.get('/admin/metrics', requireAuth, requireRole('ADMIN'), (_req: Request, res: Response) => {
  const totalVolume = db.orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCommission = db.orders.reduce((sum, o) => sum + o.platformFee, 0);
  const totalArtisanEarnings = db.orders.reduce((sum, o) => sum + o.artisanEarning, 0);

  return res.json({
    totalUsers: db.users.length,
    totalArtisans: db.artisanProfiles.length,
    totalListings: db.listings.length,
    totalOrders: db.orders.length,
    totalVolume,
    totalCommission,
    totalArtisanEarnings,
    activeRunners: 3,
  });
});

// ==========================================
// 9. REVIEWS & NOTIFICATIONS ENDPOINTS
// ==========================================

router.post('/reviews', (req: Request, res: Response) => {
  const { artisanId, orderId, buyerId, buyerName, rating, comment } = req.body;
  if (!artisanId || !rating) {
    return res.status(400).json({ error: 'artisanId and rating are required' });
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    artisanId,
    orderId: orderId || '',
    buyerId: buyerId || 'buyer-1',
    buyerName: buyerName || 'Priya Sharma',
    rating: Number(rating),
    comment: comment || 'Wonderful experience!',
    createdAt: new Date().toISOString(),
  };

  db.reviews.unshift(newReview);
  return res.status(201).json({ review: newReview });
});

router.get('/artisans/:id/reviews', (req: Request, res: Response) => {
  const revs = db.reviews.filter((r) => r.artisanId === req.params.id);
  return res.json({ reviews: revs });
});

router.get('/notifications', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const list = userId ? db.notifications.filter((n) => n.userId === userId) : db.notifications;
  return res.json({ notifications: list });
});

router.patch('/notifications/:id/read', (req: Request, res: Response) => {
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) notif.read = true;
  return res.json({ success: true });
});

// ==========================================
// 10. REVERSE GEOCODING (DYNAMIC USER LOCALITY)
// ==========================================

router.get('/geocode/reverse', async (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude query parameters are required' });
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid coordinate parameters' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'KanyaKriti-App/1.0 (hyperlocal-community-app; contact@kanyakriti.org)',
        'Accept-Language': 'en',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      const data: any = await response.json();
      const addr = data.address || {};
      const locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.city_district ||
        addr.quarter ||
        addr.village ||
        addr.town ||
        addr.hamlet ||
        '';
      const city =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.county ||
        addr.state_district ||
        '';
      const state = addr.state || '';
      const country = addr.country || '';

      const parts = [locality, city || state].filter(Boolean);
      const displayName = parts.length > 0 ? parts.join(', ') : (data.name || `${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°`);

      return res.json({
        success: true,
        displayName,
        locality,
        city,
        state,
        country,
        latitude,
        longitude,
      });
    }
  } catch (err) {
    console.warn('Reverse geocoding upstream warning:', err);
  }

  // Graceful response without assuming Bengaluru or any specific city
  return res.json({
    success: true,
    displayName: `${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°`,
    latitude,
    longitude,
  });
});

// Forward geocoding: search any neighbourhood, colony, sector, or city
const POPULAR_LOCALITIES: Array<{
  locality: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  displayName: string;
  keywords: string[];
}> = [
  // Bengaluru
  { locality: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9352, longitude: 77.6245, displayName: 'Koramangala, Bengaluru, Karnataka', keywords: ['koramangala', 'kora', 'bengaluru', 'bangalore'] },
  { locality: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9784, longitude: 77.6408, displayName: 'Indiranagar, Bengaluru, Karnataka', keywords: ['indiranagar', 'indira', '100ft road', 'bengaluru', 'bangalore'] },
  { locality: 'HSR Layout', city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9121, longitude: 77.6446, displayName: 'HSR Layout, Bengaluru, Karnataka', keywords: ['hsr', 'hsr layout', 'bengaluru', 'bangalore'] },
  { locality: 'Jayanagar', city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9299, longitude: 77.5824, displayName: 'Jayanagar, Bengaluru, Karnataka', keywords: ['jayanagar', '4th block', 'bengaluru', 'bangalore'] },
  { locality: 'Whitefield', city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9698, longitude: 77.7499, displayName: 'Whitefield, Bengaluru, Karnataka', keywords: ['whitefield', 'itpl', 'bengaluru', 'bangalore'] },
  { locality: 'Malleshwaram', city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 13.0033, longitude: 77.5703, displayName: 'Malleshwaram, Bengaluru, Karnataka', keywords: ['malleshwaram', 'malleswaram', 'bengaluru', 'bangalore'] },
  { locality: 'JP Nagar', city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9063, longitude: 77.5857, displayName: 'JP Nagar, Bengaluru, Karnataka', keywords: ['jp nagar', 'jayaprakash nagar', 'bengaluru', 'bangalore'] },
  { locality: 'BTM Layout', city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9166, longitude: 77.6101, displayName: 'BTM Layout, Bengaluru, Karnataka', keywords: ['btm', 'btm layout', 'bengaluru', 'bangalore'] },
  // Mumbai
  { locality: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0596, longitude: 72.8295, displayName: 'Bandra West, Mumbai, Maharashtra', keywords: ['bandra', 'bandra west', 'linking road', 'mumbai', 'bombay'] },
  { locality: 'Powai', city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.1176, longitude: 72.9060, displayName: 'Powai, Mumbai, Maharashtra', keywords: ['powai', 'hiranandani', 'mumbai'] },
  { locality: 'Andheri West', city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.1363, longitude: 72.8277, displayName: 'Andheri West, Mumbai, Maharashtra', keywords: ['andheri', 'andheri west', 'lokhandwala', 'mumbai'] },
  { locality: 'Andheri East', city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.1136, longitude: 72.8697, displayName: 'Andheri East, Mumbai, Maharashtra', keywords: ['andheri east', 'seepz', 'mumbai'] },
  { locality: 'Juhu', city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0988, longitude: 72.8264, displayName: 'Juhu, Mumbai, Maharashtra', keywords: ['juhu', 'juhu beach', 'mumbai'] },
  { locality: 'Colaba', city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 18.9067, longitude: 72.8147, displayName: 'Colaba, Mumbai, Maharashtra', keywords: ['colaba', 'causeway', 'south mumbai', 'mumbai'] },
  { locality: 'Dadar', city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0178, longitude: 72.8478, displayName: 'Dadar, Mumbai, Maharashtra', keywords: ['dadar', 'shivaji park', 'mumbai'] },
  { locality: 'Thane West', city: 'Thane', state: 'Maharashtra', country: 'India', latitude: 19.2183, longitude: 72.9781, displayName: 'Thane West, Maharashtra', keywords: ['thane', 'ghodbunder', 'mumbai'] },
  // Delhi NCR
  { locality: 'Connaught Place', city: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.6315, longitude: 77.2167, displayName: 'Connaught Place, New Delhi, Delhi', keywords: ['connaught place', 'cp', 'rajiv chowk', 'new delhi', 'delhi'] },
  { locality: 'Hauz Khas', city: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.5494, longitude: 77.2001, displayName: 'Hauz Khas, New Delhi, Delhi', keywords: ['hauz khas', 'hkv', 'south delhi', 'delhi'] },
  { locality: 'Saket', city: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.5244, longitude: 77.2180, displayName: 'Saket, New Delhi, Delhi', keywords: ['saket', 'select citywalk', 'south delhi', 'delhi'] },
  { locality: 'Dwarka Sector 10', city: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.5823, longitude: 77.0500, displayName: 'Dwarka, New Delhi, Delhi', keywords: ['dwarka', 'west delhi', 'delhi'] },
  { locality: 'Lajpat Nagar', city: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.5677, longitude: 77.2433, displayName: 'Lajpat Nagar, New Delhi, Delhi', keywords: ['lajpat nagar', 'central market', 'delhi'] },
  { locality: 'Vasant Kunj', city: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.5284, longitude: 77.1558, displayName: 'Vasant Kunj, New Delhi, Delhi', keywords: ['vasant kunj', 'south delhi', 'delhi'] },
  { locality: 'Sector 18', city: 'Noida', state: 'Uttar Pradesh', country: 'India', latitude: 28.5708, longitude: 77.3261, displayName: 'Sector 18, Noida, Uttar Pradesh', keywords: ['noida', 'sector 18', 'atta market', 'ncr'] },
  { locality: 'Sector 62', city: 'Noida', state: 'Uttar Pradesh', country: 'India', latitude: 28.6258, longitude: 77.3686, displayName: 'Sector 62, Noida, Uttar Pradesh', keywords: ['sector 62', 'noida', 'ncr'] },
  { locality: 'Cyber City', city: 'Gurugram', state: 'Haryana', country: 'India', latitude: 28.4950, longitude: 77.0895, displayName: 'Cyber City, DLF Phase 2, Gurugram, Haryana', keywords: ['cyber city', 'gurgaon', 'gurugram', 'dlf'] },
  // Pune
  { locality: 'Koregaon Park', city: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5362, longitude: 73.8940, displayName: 'Koregaon Park, Pune, Maharashtra', keywords: ['koregaon park', 'kp', 'pune'] },
  { locality: 'Kothrud', city: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5074, longitude: 73.8077, displayName: 'Kothrud, Pune, Maharashtra', keywords: ['kothrud', 'pune'] },
  { locality: 'Viman Nagar', city: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5679, longitude: 73.9143, displayName: 'Viman Nagar, Pune, Maharashtra', keywords: ['viman nagar', 'phoenix marketcity', 'pune'] },
  { locality: 'Hinjawadi', city: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5913, longitude: 73.7389, displayName: 'Hinjawadi IT Park, Pune, Maharashtra', keywords: ['hinjawadi', 'hinjewadi', 'pune'] },
  // Hyderabad
  { locality: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.4156, longitude: 78.4350, displayName: 'Banjara Hills, Hyderabad, Telangana', keywords: ['banjara hills', 'hyderabad'] },
  { locality: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.4319, longitude: 78.4073, displayName: 'Jubilee Hills, Hyderabad, Telangana', keywords: ['jubilee hills', 'hyderabad'] },
  { locality: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.4401, longitude: 78.3489, displayName: 'Gachibowli, Hyderabad, Telangana', keywords: ['gachibowli', 'financial district', 'hyderabad'] },
  { locality: 'Hitec City', city: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.4435, longitude: 78.3772, displayName: 'Hitec City, Madhapur, Hyderabad, Telangana', keywords: ['hitec city', 'madhapur', 'cyberabad', 'hyderabad'] },
  // Chennai
  { locality: 'Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0850, longitude: 80.2101, displayName: 'Anna Nagar, Chennai, Tamil Nadu', keywords: ['anna nagar', 'chennai', 'madras'] },
  { locality: 'T. Nagar', city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0418, longitude: 80.2341, displayName: 'T. Nagar, Chennai, Tamil Nadu', keywords: ['t nagar', 'thyagaraya nagar', 'chennai'] },
  { locality: 'Adyar', city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0012, longitude: 80.2565, displayName: 'Adyar, Chennai, Tamil Nadu', keywords: ['adyar', 'chennai'] },
  // Kolkata
  { locality: 'Salt Lake (Bidhannagar)', city: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5804, longitude: 88.4172, displayName: 'Salt Lake, Bidhannagar, Kolkata, West Bengal', keywords: ['salt lake', 'bidhannagar', 'kolkata', 'calcutta'] },
  { locality: 'Park Street', city: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5518, longitude: 88.3524, displayName: 'Park Street, Kolkata, West Bengal', keywords: ['park street', 'kolkata'] },
  { locality: 'New Town', city: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5855, longitude: 88.4705, displayName: 'New Town, Rajarhat, Kolkata, West Bengal', keywords: ['new town', 'rajarhat', 'kolkata'] },
];

router.get('/geocode/search', async (req: Request, res: Response) => {
  const queryStr = (req.query.q as string || '').trim().toLowerCase();
  if (!queryStr || queryStr.length < 2) {
    return res.json({ results: POPULAR_LOCALITIES.slice(0, 10) });
  }

  // 1. Search fast curated dictionary
  const matchedCurated = POPULAR_LOCALITIES.filter((item) => {
    return (
      item.locality.toLowerCase().includes(queryStr) ||
      item.city.toLowerCase().includes(queryStr) ||
      item.displayName.toLowerCase().includes(queryStr) ||
      item.keywords.some((k) => k.includes(queryStr) || queryStr.includes(k))
    );
  });

  // 2. Fetch live upstream results from OpenStreetMap Nominatim
  let upstreamResults: any[] = [];
  try {
    const encoded = encodeURIComponent(queryStr);
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encoded}&addressdetails=1&limit=6`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'KanyaKriti-App/1.0 (hyperlocal-community-app; contact@kanyakriti.org)',
        'Accept-Language': 'en',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      const data: any[] = await response.json();
      upstreamResults = data.map((item) => {
        const addr = item.address || {};
        const locality =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.city_district ||
          addr.quarter ||
          addr.village ||
          item.name ||
          '';
        const city =
          addr.city ||
          addr.town ||
          addr.municipality ||
          addr.county ||
          addr.state_district ||
          '';
        const state = addr.state || '';
        const country = addr.country || '';

        return {
          locality: locality || item.name || queryStr,
          city: city || state || 'Local Area',
          state,
          country,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          displayName: item.display_name,
        };
      });
    }
  } catch (err) {
    // Graceful offline or timeout fallback to curated
  }

  // Combine and deduplicate
  const combined = [...matchedCurated];
  for (const up of upstreamResults) {
    const isDup = combined.some(
      (c) => Math.abs(c.latitude - up.latitude) < 0.01 && Math.abs(c.longitude - up.longitude) < 0.01
    );
    if (!isDup) {
      combined.push(up);
    }
  }

  return res.json({
    results: combined.slice(0, 10),
  });
});

// ==========================================
// 11. REALTIME SSE & DEMO RESET
// ==========================================

router.get('/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`);

  const unsubscribe = db.addSseClient((data) => {
    res.write(`data: ${data}\n\n`);
  });

  req.on('close', () => {
    unsubscribe();
  });
});

router.post('/demo/reset', (_req: Request, res: Response) => {
  db.resetToSeed();
  return res.json({ success: true, message: 'Database reset to initial demo state' });
});

export default router;
