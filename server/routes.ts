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
import { calculateMatchScore } from './matching.ts';
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
        lat: 12.9352,
        lng: 77.6245,
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
        lat: 12.9352,
        lng: 77.6245,
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
        lat: 12.9348,
        lng: 77.6258,
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

router.post('/listings', (req: Request, res: Response) => {
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

  const artisan = db.getArtisanProfileById(artisanId) || db.getArtisanProfileByUserId(artisanId);
  const artisanName = artisan ? artisan.name : 'Sunita Devi';
  const artisanAvatar = artisan ? artisan.avatar : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';
  const approximateLat = artisan ? artisan.approximateLat : 12.9345;
  const approximateLng = artisan ? artisan.approximateLng : 77.6265;
  const neighborhood = artisan ? artisan.neighborhood : 'Local Neighborhood';
  const city = artisan ? artisan.city : 'Local Area';

  const newListing = db.addListing({
    artisanId,
    artisanName,
    artisanAvatar,
    artisanRating: artisan ? artisan.rating : 4.9,
    artisanReviewCount: artisan ? artisan.reviewCount : 1,
    title,
    description,
    category,
    customCategory: customCategory || (category !== 'Other' && !['Tailoring', 'Cooking', 'Alterations', 'Handicrafts', 'Embroidery', 'Beauty'].includes(category) ? category : undefined),
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
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop&q=80',
  });

  return res.status(201).json({ listing: newListing });
});

// ==========================================
// 5. HYPERLOCAL MATCHING ENGINE
// ==========================================

router.post('/match', (req: Request, res: Response) => {
  const { query, category, maxBudget, buyerLat, buyerLng, radiusKm } = req.body;

  const lat = typeof buyerLat === 'number' ? buyerLat : 12.9352;
  const lng = typeof buyerLng === 'number' ? buyerLng : 77.6245;
  const maxRadius = typeof radiusKm === 'number' ? radiusKm : 15;

  const matches = db.listings.map((listing) => {
    const artisan = db.getArtisanProfileById(listing.artisanId) || db.artisanProfiles[0];
    return calculateMatchScore(
      query || '',
      category,
      maxBudget ? Number(maxBudget) : undefined,
      lat,
      lng,
      artisan,
      listing
    );
  });

  // Filter by dynamic radius if required
  const filtered = matches.filter((m) => m.distanceKm <= maxRadius);

  // Sort descending by transparent match_score
  filtered.sort((a, b) => b.matchScore - a.matchScore);

  return res.json({
    matches: filtered,
    total: filtered.length,
    criteria: {
      formula: '0.40 * skill_compatibility + 0.35 * distance_proximity + 0.15 * maker_rating + 0.10 * budget_fit',
      buyerLocation: { lat, lng },
      radiusKm: maxRadius,
    },
  });
});

router.get('/match/nearby', (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || 12.9352;
  const lng = parseFloat(req.query.lng as string) || 77.6245;
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
