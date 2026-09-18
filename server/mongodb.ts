import { MongoClient, Db, Collection } from 'mongodb';
import bcrypt from 'bcryptjs';
import {
  INITIAL_USERS,
  INITIAL_ARTISAN_PROFILES,
  INITIAL_LISTINGS,
  INITIAL_ORDERS,
  INITIAL_CATEGORIES,
  INITIAL_ORDER_ITEMS,
  INITIAL_PAYMENTS,
  INITIAL_LOCATIONS,
  INITIAL_DELIVERY_ASSIGNMENTS,
  INITIAL_AI_EXTRACTIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_REVIEWS,
} from './data/seedData.ts';

// ==========================================
// MONGODB USER & PROFILE SCHEMAS
// ==========================================

export type AppRole = 'BUYER' | 'ARTISAN' | 'RUNNER' | 'ADMIN';

export interface MongoUser {
  _id: string;
  email: string;
  phone: string;
  password_hash: string;
  role: AppRole;
  name: string;
  avatar_url: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface MongoArtisanProfile {
  _id: string;
  user_id: string;
  name: string;
  avatar_url: string;
  bio: string;
  primary_skill: string;
  skills: string[];
  rating: number;
  review_count: number;
  total_earned: number;
  pending_balance: number;
  available_balance: number;
  first_thousand_reached: boolean;
  languages: string[];
  approximate_lat: number;
  approximate_lng: number;
  neighborhood: string;
  city: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface MongoBuyerProfile {
  _id: string;
  user_id: string;
  name: string;
  preferred_categories: string[];
  default_address: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  created_at: string;
  updated_at: string;
}

export interface MongoRunnerProfile {
  _id: string;
  user_id: string;
  name: string;
  vehicle_type: string;
  is_available: boolean;
  rating: number;
  total_deliveries: number;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  created_at: string;
  updated_at: string;
}

// ==========================================
// PASSWORD UTILITIES (BCRYPT)
// ==========================================

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ==========================================
// CONNECTION & SERVICE CONFIGURATION
// ==========================================

export type MongoConnectionStatus = 'LIVE_CONNECTED' | 'NOT_CONFIGURED' | 'FAILED';

class MongoUserService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  public status: MongoConnectionStatus = 'NOT_CONFIGURED';
  public lastError: string | null = null;

  // In-memory fallback stores to maintain full functionality when MONGODB_URI is not provided
  private memoryUsers: Map<string, MongoUser> = new Map();
  private memoryArtisanProfiles: Map<string, MongoArtisanProfile> = new Map();
  private memoryBuyerProfiles: Map<string, MongoBuyerProfile> = new Map();
  private memoryRunnerProfiles: Map<string, MongoRunnerProfile> = new Map();
  private memoryListings: Map<string, any> = new Map();
  private memoryCategories: Map<string, any> = new Map();
  private memoryOrders: Map<string, any> = new Map();
  private memoryOrderItems: Map<string, any> = new Map();
  private memoryPayments: Map<string, any> = new Map();
  private memoryTransactions: Map<string, any> = new Map();
  private memoryReviews: Map<string, any> = new Map();
  private memoryLocations: Map<string, any> = new Map();
  private memoryDeliveryAssignments: Map<string, any> = new Map();
  private memoryAiExtractions: Map<string, any> = new Map();

  constructor() {
    this.seedDefaultUsers();
  }

  // Pre-seed known users and collections so persona and existing demo flows have real passwords & profiles
  private async seedDefaultUsers() {
    const defaultPassword = await hashPassword('KanyaKriti@2026');

    // Seed all users from INITIAL_USERS
    for (const u of INITIAL_USERS) {
      const mongoUser: MongoUser = {
        _id: u.id,
        email: u.email,
        phone: u.phone || '+91 98000 00000',
        password_hash: defaultPassword,
        role: (u.role.toUpperCase() as AppRole),
        name: u.name,
        avatar_url: u.avatar,
        is_verified: true,
        is_active: true,
        created_at: u.created_at || '2026-08-01T10:00:00Z',
        updated_at: u.created_at || '2026-08-01T10:00:00Z',
      };
      this.memoryUsers.set(mongoUser._id, mongoUser);
    }

    // Seed all artisan profiles from INITIAL_ARTISAN_PROFILES
    for (const ap of INITIAL_ARTISAN_PROFILES) {
      this.memoryArtisanProfiles.set(ap.userId || ap.id, {
        _id: `ap-${ap.id}`,
        user_id: ap.userId || ap.id,
        name: ap.name,
        avatar_url: ap.avatar,
        bio: ap.bio,
        primary_skill: ap.primarySkill,
        skills: ap.skills,
        rating: ap.rating,
        review_count: ap.reviewCount,
        total_earned: ap.totalEarned,
        pending_balance: ap.pendingBalance,
        available_balance: ap.availableBalance,
        first_thousand_reached: ap.firstThousandReached,
        languages: ap.languages,
        approximate_lat: ap.approximateLat,
        approximate_lng: ap.approximateLng,
        neighborhood: ap.neighborhood,
        city: ap.city,
        phone: ap.phone,
        created_at: '2026-08-01T10:00:00Z',
        updated_at: '2026-08-01T10:00:00Z',
      });
    }

    // Seed all buyer profiles for buyers
    const buyers = INITIAL_USERS.filter((u) => u.role === 'buyer');
    for (const b of buyers) {
      this.memoryBuyerProfiles.set(b.id, {
        _id: `bp-${b.id}`,
        user_id: b.id,
        name: b.name,
        preferred_categories: ['Tailoring', 'Cooking', 'Alterations'],
        default_address: `${b.neighborhood}, ${b.city || 'Local Area'}`,
        neighborhood: b.neighborhood || 'Local Neighborhood',
        city: b.city || 'Local Area',
        lat: b.lat || 12.935,
        lng: b.lng || 77.625,
        created_at: b.created_at || '2026-08-05T10:00:00Z',
        updated_at: b.created_at || '2026-08-05T10:00:00Z',
      });
    }

    // Seed all runner profiles for runners
    const runners = INITIAL_USERS.filter((u) => u.role === 'runner');
    for (const r of runners) {
      this.memoryRunnerProfiles.set(r.id, {
        _id: `rp-${r.id}`,
        user_id: r.id,
        name: r.name,
        vehicle_type: 'Electric Two-Wheeler',
        is_available: true,
        rating: 4.9,
        total_deliveries: 35,
        neighborhood: r.neighborhood || 'Local Central Hub',
        city: r.city || 'Local Area',
        lat: r.lat || 12.9348,
        lng: r.lng || 77.6258,
        created_at: r.created_at || '2026-08-02T10:00:00Z',
        updated_at: r.created_at || '2026-08-02T10:00:00Z',
      });
    }

    // Seed listings, categories, orders, etc.
    for (const l of INITIAL_LISTINGS) this.memoryListings.set(l.id, l);
    for (const c of INITIAL_CATEGORIES) this.memoryCategories.set(c.id, c);
    for (const o of INITIAL_ORDERS) this.memoryOrders.set(o.id, o);
    for (const oi of INITIAL_ORDER_ITEMS) this.memoryOrderItems.set(oi.id, oi);
    for (const p of INITIAL_PAYMENTS) this.memoryPayments.set(p.id, p);
    for (const tx of INITIAL_TRANSACTIONS) this.memoryTransactions.set(tx.id, tx);
    for (const rev of INITIAL_REVIEWS) this.memoryReviews.set(rev.id, rev);
    for (const loc of INITIAL_LOCATIONS) this.memoryLocations.set(loc.id, loc);
    for (const da of INITIAL_DELIVERY_ASSIGNMENTS) this.memoryDeliveryAssignments.set(da.id, da);
    for (const ai of INITIAL_AI_EXTRACTIONS) this.memoryAiExtractions.set(ai.id, ai);
  }

  // Initialize MongoDB connection with pooling, retries, and indexes
  public async initConnection(): Promise<void> {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'kanyakriti_db';

    // Detect placeholder URI templates (e.g., <db_password>, YOUR_MONGODB_URI, or unreplaced <...>)
    const isPlaceholderUri =
      !uri ||
      uri.trim() === '' ||
      uri.includes('YOUR_MONGODB_URI') ||
      uri.includes('<db_password>') ||
      uri.includes('<password>') ||
      uri.includes('<PASSWORD>') ||
      uri.includes('<your-password>') ||
      uri.includes('<your_password>') ||
      uri.includes('<') ||
      uri.includes('>') ||
      /:\s*<[^>]+>@/.test(uri);

    if (isPlaceholderUri) {
      console.log(
        "[MongoDB] MONGODB_URI contains a placeholder ('<db_password>'). To connect to your live MongoDB Atlas cluster, replace '<db_password>' with your actual database user password and ensure IP 0.0.0.0/0 is whitelisted in Atlas Network Access. Operating in resilient embedded storage mode."
      );
      this.status = 'NOT_CONFIGURED';
      this.lastError =
        "MONGODB_URI has '<db_password>' placeholder. Replace it with your Atlas password and whitelist 0.0.0.0/0 in Atlas Network Access.";
      return;
    }

    const maxRetries = 2;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      try {
        console.log(`[MongoDB] Attempting connection to MongoDB (attempt ${attempt}/${maxRetries})...`);
        this.client = new MongoClient(uri, {
          maxPoolSize: 10,
          minPoolSize: 1,
          serverSelectionTimeoutMS: 4000,
          connectTimeoutMS: 6000,
          tls: true,
          family: 4, // Force IPv4 to prevent container IPv6 dual-stack resolution handshake aborts
        });

        await this.client.connect();
        this.db = this.client.db(dbName);
        this.status = 'LIVE_CONNECTED';
        this.lastError = null;
        console.log(`[MongoDB] Connected successfully to database: ${dbName}`);

        await this.ensureIndexes();
        return;
      } catch (err: any) {
        const rawMessage = err?.message || String(err);
        if (rawMessage.includes('SSL alert number 80') || rawMessage.includes('tlsv1 alert internal error')) {
          this.lastError =
            'Atlas SSL Handshake Refusal (SSL Alert 80): Please verify: 1) MongoDB Atlas Network Access allows 0.0.0.0/0 (Anywhere), 2) the database password in MONGODB_URI is correct, and 3) the database user exists.';
        } else if (rawMessage.includes('Authentication failed') || rawMessage.includes('bad auth')) {
          this.lastError = 'MongoDB Atlas Authentication failed: Invalid username or password.';
        } else {
          this.lastError = rawMessage;
        }

        console.warn(`[MongoDB] Connection attempt ${attempt} failed: ${this.lastError}`);

        // If it's an immediate TLS refusal or Auth rejection from Atlas, abort retries immediately to avoid blocking server boot
        const isFatalRefusal =
          rawMessage.includes('SSL alert number 80') ||
          rawMessage.includes('tlsv1 alert internal error') ||
          rawMessage.includes('Authentication failed') ||
          rawMessage.includes('bad auth');

        if (isFatalRefusal) {
          console.warn('[MongoDB] Halting connection retries due to Atlas handshake/credential rejection. Falling back gracefully to embedded identity store.');
          break;
        }

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    this.status = 'FAILED';
    console.warn('[MongoDB] Live MongoDB connection unavailable. Gracefully operating in resilient embedded storage mode.');
  }

  // Create required indexes and seed collections on live MongoDB
  private async ensureIndexes(): Promise<void> {
    if (!this.db) return;
    try {
      const usersCol = this.db.collection('users');
      await usersCol.createIndex({ email: 1 }, { unique: true, sparse: true });
      await usersCol.createIndex({ phone: 1 }, { unique: true, sparse: true });
      await usersCol.createIndex({ role: 1 });
      await usersCol.createIndex({ created_at: -1 });

      const artisanCol = this.db.collection('artisan_profiles');
      await artisanCol.createIndex({ user_id: 1 }, { unique: true });
      await artisanCol.createIndex({ neighborhood: 1 });

      const buyerCol = this.db.collection('buyer_profiles');
      await buyerCol.createIndex({ user_id: 1 }, { unique: true });

      const runnerCol = this.db.collection('runner_profiles');
      await runnerCol.createIndex({ user_id: 1 }, { unique: true });

      const listingsCol = this.db.collection('listings');
      await listingsCol.createIndex({ artisanId: 1 });
      await listingsCol.createIndex({ category: 1 });
      await listingsCol.createIndex({ isActive: 1 });
      await listingsCol.createIndex({ createdAt: -1 });

      const ordersCol = this.db.collection('orders');
      await ordersCol.createIndex({ buyerId: 1 });
      await ordersCol.createIndex({ artisanId: 1 });
      await ordersCol.createIndex({ runnerId: 1 });
      await ordersCol.createIndex({ status: 1 });
      await ordersCol.createIndex({ createdAt: -1 });

      const orderItemsCol = this.db.collection('order_items');
      await orderItemsCol.createIndex({ order_id: 1 });

      const paymentsCol = this.db.collection('payments');
      await paymentsCol.createIndex({ order_id: 1 });
      await paymentsCol.createIndex({ buyer_id: 1 });

      const txCol = this.db.collection('transactions');
      await txCol.createIndex({ artisanId: 1 });
      await txCol.createIndex({ orderId: 1 });

      const revCol = this.db.collection('reviews');
      await revCol.createIndex({ artisanId: 1 });
      await revCol.createIndex({ orderId: 1 });

      const notifCol = this.db.collection('notifications');
      await notifCol.createIndex({ userId: 1 });
      await notifCol.createIndex({ createdAt: -1 });

      const locCol = this.db.collection('locations');
      await locCol.createIndex({ pincode: 1 });

      const daCol = this.db.collection('delivery_assignments');
      await daCol.createIndex({ order_id: 1 });
      await daCol.createIndex({ runner_id: 1 });

      const aiCol = this.db.collection('ai_extractions');
      await aiCol.createIndex({ artisan_id: 1 });

      console.log('[MongoDB] Schema indexes verified across all 15 collections.');

      // Safely deduplicate any existing redundant listings in MongoDB
      await this.deduplicateMongoListings();

      // Check if collections are empty and seed them
      const userCount = await usersCol.countDocuments();
      if (userCount === 0) {
        console.log('[MongoDB] Live database is empty. Seeding initial marketplace data...');
        const userDocs = Array.from(this.memoryUsers.values());
        if (userDocs.length > 0) await usersCol.insertMany(userDocs as any[]);

        const artisanDocs = Array.from(this.memoryArtisanProfiles.values());
        if (artisanDocs.length > 0) await artisanCol.insertMany(artisanDocs as any[]);

        const buyerDocs = Array.from(this.memoryBuyerProfiles.values());
        if (buyerDocs.length > 0) await buyerCol.insertMany(buyerDocs as any[]);

        const runnerDocs = Array.from(this.memoryRunnerProfiles.values());
        if (runnerDocs.length > 0) await runnerCol.insertMany(runnerDocs as any[]);

        const listingDocs = Array.from(this.memoryListings.values()).map(l => ({ ...l, _id: l.id }));
        if (listingDocs.length > 0) await listingsCol.insertMany(listingDocs as any[]);

        const catDocs = Array.from(this.memoryCategories.values()).map(c => ({ ...c, _id: c.id }));
        if (catDocs.length > 0) await this.db.collection('categories').insertMany(catDocs as any[]);

        const orderDocs = Array.from(this.memoryOrders.values()).map(o => ({ ...o, _id: o.id }));
        if (orderDocs.length > 0) await ordersCol.insertMany(orderDocs as any[]);

        const orderItemDocs = Array.from(this.memoryOrderItems.values()).map(oi => ({ ...oi, _id: oi.id }));
        if (orderItemDocs.length > 0) await orderItemsCol.insertMany(orderItemDocs as any[]);

        const paymentDocs = Array.from(this.memoryPayments.values()).map(p => ({ ...p, _id: p.id }));
        if (paymentDocs.length > 0) await paymentsCol.insertMany(paymentDocs as any[]);

        const txDocs = Array.from(this.memoryTransactions.values()).map(t => ({ ...t, _id: t.id }));
        if (txDocs.length > 0) await txCol.insertMany(txDocs as any[]);

        const revDocs = Array.from(this.memoryReviews.values()).map(r => ({ ...r, _id: r.id }));
        if (revDocs.length > 0) await revCol.insertMany(revDocs as any[]);

        const locDocs = Array.from(this.memoryLocations.values()).map(l => ({ ...l, _id: l.id }));
        if (locDocs.length > 0) await locCol.insertMany(locDocs as any[]);

        const daDocs = Array.from(this.memoryDeliveryAssignments.values()).map(d => ({ ...d, _id: d.id }));
        if (daDocs.length > 0) await daCol.insertMany(daDocs as any[]);

        const aiDocs = Array.from(this.memoryAiExtractions.values()).map(a => ({ ...a, _id: a.id }));
        if (aiDocs.length > 0) await aiCol.insertMany(aiDocs as any[]);

        console.log('[MongoDB] All collections seeded successfully in live MongoDB.');
      }
    } catch (err: any) {
      console.warn('[MongoDB] Index/Seeding creation warning:', err?.message || err);
    }
  }

  // Graceful shutdown
  public async close(): Promise<void> {
    if (this.client) {
      console.log('[MongoDB] Closing database connection pool...');
      await this.client.close();
      this.client = null;
      this.db = null;
      this.status = 'NOT_CONFIGURED';
    }
  }

  // ==========================================
  // USER CRUD OPERATIONS
  // ==========================================

  public async findUserById(id: string): Promise<MongoUser | null> {
    if (this.db && this.status === 'LIVE_CONNECTED') {
      try {
        const user = await this.db.collection<MongoUser>('users').findOne({ _id: id });
        if (user) return user;
      } catch (err) {
        console.warn('[MongoDB] findUserById error, checking fallback store:', err);
      }
    }
    return this.memoryUsers.get(id) || null;
  }

  public async findUserByEmailOrPhone(identifier: string): Promise<MongoUser | null> {
    const trimmed = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[^0-9+]/g, '');
    const rawDigits = identifier.replace(/\D/g, '');
    const last10Digits = rawDigits.length >= 10 ? rawDigits.slice(-10) : '';

    if (this.db && this.status === 'LIVE_CONNECTED') {
      try {
        const orConditions: any[] = [
          { email: trimmed },
          { phone: identifier },
          { phone: cleanPhone },
        ];
        if (last10Digits) {
          orConditions.push({ phone: { $regex: last10Digits + '$' } });
        }
        const user = await this.db.collection<MongoUser>('users').findOne({
          $or: orConditions,
        });
        if (user) return user;
      } catch (err) {
        console.warn('[MongoDB] findUserByEmailOrPhone error, checking fallback store:', err);
      }
    }

    // In-memory lookup
    for (const u of this.memoryUsers.values()) {
      const uEmail = u.email.toLowerCase();
      const uPhone = u.phone;
      const uCleanPhone = u.phone.replace(/[^0-9+]/g, '');
      const uDigits = u.phone.replace(/\D/g, '');

      // 1. Exact or trimmed email match
      if (uEmail === trimmed) return u;

      // 2. Demo alias compatibility
      if (trimmed === 'ramesh.runner@kanyakriti.local' && u._id === 'runner-1') return u;

      // 3. Exact phone match
      if (uPhone === identifier || (cleanPhone && uCleanPhone === cleanPhone)) return u;

      // 4. 10-digit mobile number suffix match (e.g. 9845012345 matching +91 98450 12345)
      if (last10Digits && uDigits.endsWith(last10Digits)) return u;

      // 5. Name match (case-insensitive)
      if (u.name.toLowerCase() === trimmed) return u;
    }
    return null;
  }

  public async createUser(data: Omit<MongoUser, '_id' | 'created_at' | 'updated_at' | 'is_verified' | 'is_active'> & { _id?: string }): Promise<MongoUser> {
    const now = new Date().toISOString();
    const _id = data._id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newUser: MongoUser = {
      _id,
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      password_hash: data.password_hash,
      role: data.role,
      name: data.name.trim(),
      avatar_url: data.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      is_verified: true,
      is_active: true,
      created_at: now,
      updated_at: now,
      last_login_at: now,
    };

    if (this.db && this.status === 'LIVE_CONNECTED') {
      try {
        await this.db.collection<MongoUser>('users').insertOne({ ...newUser });
      } catch (err: any) {
        console.warn('[MongoDB] Error saving to live Mongo, storing in fallback:', err?.message || err);
      }
    }

    this.memoryUsers.set(newUser._id, newUser);
    return newUser;
  }

  public async updateLastLogin(id: string): Promise<void> {
    const now = new Date().toISOString();
    if (this.db && this.status === 'LIVE_CONNECTED') {
      try {
        await this.db.collection('users').updateOne(
          { _id: id as any },
          { $set: { last_login_at: now, updated_at: now } }
        );
      } catch (err) {
        // ignore
      }
    }
    const mem = this.memoryUsers.get(id);
    if (mem) {
      mem.last_login_at = now;
      mem.updated_at = now;
    }
  }

  // ==========================================
  // PROFILE SEPARATION CRUD
  // ==========================================

  // Artisan Profile
  public async getArtisanProfile(userId: string): Promise<MongoArtisanProfile | null> {
    if (this.db && this.status === 'LIVE_CONNECTED') {
      try {
        const profile = await this.db.collection<MongoArtisanProfile>('artisan_profiles').findOne({ user_id: userId });
        if (profile) return profile;
      } catch (err) {
        // fallback
      }
    }
    return this.memoryArtisanProfiles.get(userId) || null;
  }

  public async createArtisanProfile(profile: Omit<MongoArtisanProfile, '_id' | 'created_at' | 'updated_at'>): Promise<MongoArtisanProfile> {
    const now = new Date().toISOString();
    const newProfile: MongoArtisanProfile = {
      ...profile,
      _id: `ap-${profile.user_id}`,
      created_at: now,
      updated_at: now,
    };

    if (this.db && this.status === 'LIVE_CONNECTED') {
      try {
        await this.db.collection<MongoArtisanProfile>('artisan_profiles').insertOne({ ...newProfile });
      } catch (err) {
        // fallback
      }
    }

    this.memoryArtisanProfiles.set(profile.user_id, newProfile);
    return newProfile;
  }

  // Buyer Profile
  public async getBuyerProfile(userId: string): Promise<MongoBuyerProfile | null> {
    if (this.db && this.status === 'LIVE_CONNECTED') {
      try {
        const profile = await this.db.collection<MongoBuyerProfile>('buyer_profiles').findOne({ user_id: userId });
        if (profile) return profile;
      } catch (err) {
        // fallback
      }
    }
    return this.memoryBuyerProfiles.get(userId) || null;
  }

  public async createBuyerProfile(profile: Omit<MongoBuyerProfile, '_id' | 'created_at' | 'updated_at'>): Promise<MongoBuyerProfile> {
    const now = new Date().toISOString();
    const newProfile: MongoBuyerProfile = {
      ...profile,
      _id: `bp-${profile.user_id}`,
      created_at: now,
      updated_at: now,
    };

    if (this.db && this.status === 'LIVE_CONNECTED') {
      try {
        await this.db.collection<MongoBuyerProfile>('buyer_profiles').insertOne({ ...newProfile });
      } catch (err) {
        // fallback
      }
    }

    this.memoryBuyerProfiles.set(profile.user_id, newProfile);
    return newProfile;
  }

  // Runner Profile
  public async getRunnerProfile(userId: string): Promise<MongoRunnerProfile | null> {
    if (this.db && this.status === 'LIVE_CONNECTED') {
      try {
        const profile = await this.db.collection<MongoRunnerProfile>('runner_profiles').findOne({ user_id: userId });
        if (profile) return profile;
      } catch (err) {
        // fallback
      }
    }
    return this.memoryRunnerProfiles.get(userId) || null;
  }

  public async createRunnerProfile(profile: Omit<MongoRunnerProfile, '_id' | 'created_at' | 'updated_at'>): Promise<MongoRunnerProfile> {
    const now = new Date().toISOString();
    const newProfile: MongoRunnerProfile = {
      ...profile,
      _id: `rp-${profile.user_id}`,
      created_at: now,
      updated_at: now,
    };

    if (this.db && this.status === 'LIVE_CONNECTED') {
      try {
        await this.db.collection<MongoRunnerProfile>('runner_profiles').insertOne({ ...newProfile });
      } catch (err) {
        // fallback
      }
    }

    this.memoryRunnerProfiles.set(profile.user_id, newProfile);
    return newProfile;
  }

  // Listings Persistence & Deduplication
  public async saveListing(listing: any): Promise<void> {
    const doc = { ...listing, _id: listing.id };
    if (this.db && this.status === 'LIVE_CONNECTED') {
      try {
        const listingsCol = this.db.collection('listings');
        const existing = await listingsCol.findOne({
          artisanId: listing.artisanId,
          title: listing.title,
        });
        if (!existing) {
          await listingsCol.insertOne(doc);
        }
      } catch (err: any) {
        console.warn('[MongoDB] saveListing warning:', err?.message || err);
      }
    }
    this.memoryListings.set(listing.id, doc);
  }

  public async deduplicateMongoListings(): Promise<number> {
    if (!this.db || this.status !== 'LIVE_CONNECTED') return 0;
    try {
      const listingsCol = this.db.collection('listings');
      const allListings = await listingsCol.find({}).toArray();
      const seen = new Map<string, any>();
      const duplicateIds: any[] = [];

      for (const item of allListings) {
        const key = `${item.artisanId}:::${(item.title || '').trim().toLowerCase()}`;
        const existing = seen.get(key);
        if (existing) {
          const isDescMatch =
            (item.description || '').trim().toLowerCase() ===
            (existing.description || '').trim().toLowerCase();
          const diffTime = Math.abs(
            new Date(item.createdAt || 0).getTime() - new Date(existing.createdAt || 0).getTime()
          );
          if (isDescMatch || (!isNaN(diffTime) && diffTime < 120000)) {
            duplicateIds.push(item._id);
            continue;
          }
        }
        seen.set(key, item);
      }

      if (duplicateIds.length > 0) {
        await listingsCol.deleteMany({ _id: { $in: duplicateIds } as any });
        console.log(`[MongoDB] Cleaned up ${duplicateIds.length} duplicate listing records from live database.`);
      }
      return duplicateIds.length;
    } catch (err: any) {
      console.warn('[MongoDB] deduplicateMongoListings warning:', err?.message || err);
      return 0;
    }
  }

  // Live Database accessors
  public getDb(): Db | null {
    return this.db;
  }

  public getStatus(): { status: MongoConnectionStatus; isLive: boolean; lastError: string | null } {
    return {
      status: this.status,
      isLive: this.status === 'LIVE_CONNECTED',
      lastError: this.lastError,
    };
  }

  public getCollection<T = any>(name: string): Collection<T> | null {
    if (this.db && this.status === 'LIVE_CONNECTED') {
      return this.db.collection<T>(name);
    }
    return null;
  }
}

export const mongoUserService = new MongoUserService();

// Register graceful shutdown handlers
process.on('SIGINT', async () => {
  await mongoUserService.close();
});
process.on('SIGTERM', async () => {
  await mongoUserService.close();
});
