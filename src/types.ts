export type UserRole = 'artisan' | 'buyer' | 'runner' | 'admin';

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'IN_PROGRESS'
  | 'READY'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'COMPLETED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type PaymentMethod = 'UPI' | 'COD';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar: string;
  city: string;
  neighborhood: string;
  lat: number;
  lng: number;
  created_at: string;
}

export interface ArtisanProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  bio: string;
  primarySkill: string;
  skills: string[];
  rating: number;
  reviewCount: number;
  totalEarned: number;
  pendingBalance: number;
  availableBalance: number;
  firstThousandReached: boolean;
  milestoneDate?: string;
  approximateLat: number;
  approximateLng: number;
  neighborhood: string;
  city: string;
  languages: string[];
  phone: string;
}

export interface Listing {
  id: string;
  artisanId: string;
  artisanName: string;
  artisanAvatar: string;
  artisanRating: number;
  artisanReviewCount: number;
  title: string;
  description: string;
  category: 'Tailoring' | 'Cooking' | 'Alterations' | 'Handicrafts' | 'Embroidery' | 'Beauty' | 'Other';
  price: number;
  currency: 'INR';
  turnaroundHours: number;
  turnaroundDisplay: string;
  searchKeywords: string[];
  tags: string[];
  availability: boolean;
  approximateLat: number;
  approximateLng: number;
  neighborhood: string;
  city: string;
  ordersCompleted: number;
  createdAt: string;
  imageUrl?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  artisanId: string;
  artisanName: string;
  artisanPhone: string;
  runnerId?: string;
  runnerName?: string;
  runnerPhone?: string;
  listingId: string;
  listingTitle: string;
  category: string;
  price: number;
  platformFee: number;
  artisanEarning: number;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  runnerLat?: number;
  runnerLng?: number;
  instructions?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  artisanId: string;
  orderId?: string;
  type: 'EARNING' | 'WITHDRAWAL' | 'PLATFORM_FEE';
  amount: number;
  balanceAfter: number;
  description: string;
  status: 'COMPLETED' | 'PENDING';
  createdAt: string;
}

export interface Review {
  id: string;
  artisanId: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  role: UserRole;
  title: string;
  message: string;
  type: 'ORDER_NEW' | 'ORDER_UPDATE' | 'EARNING' | 'RUNNER_ASSIGNED' | 'SYSTEM';
  read: boolean;
  orderId?: string;
  createdAt: string;
}

export interface ExtractedSkillInfo {
  skill: string;
  category: 'Tailoring' | 'Cooking' | 'Alterations' | 'Handicrafts' | 'Embroidery' | 'Beauty' | 'Other';
  description: string;
  price: number;
  currency: 'INR';
  turnaround_hours: number;
  turnaround_display: string;
  availability: boolean;
  language: string;
  confidence: number;
  suggestedTitle: string;
  suggestedTags: string[];
  location?: {
    latitude: number;
    longitude: number;
    neighborhood?: string;
  };
}

export interface GeneratedListing {
  title: string;
  shortDescription: string;
  category: 'Tailoring' | 'Cooking' | 'Alterations' | 'Handicrafts' | 'Embroidery' | 'Beauty' | 'Other';
  price: number;
  estimatedTurnaround: string;
  turnaroundHours: number;
  searchKeywords: string[];
  suggestedTags: string[];
  artisanProfileSummary: string;
}

export interface MatchScoreResult {
  artisan: ArtisanProfile;
  listing: Listing;
  matchScore: number; // 0 - 100
  distanceKm: number;
  breakdown: {
    skillCompatibility: number; // 0 - 100
    distanceProximity: number; // 0 - 100
    makerRating: number; // 0 - 100
    budgetFit: number; // 0 - 100
  };
  reasons: string[];
}
