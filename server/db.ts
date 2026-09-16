import {
  User,
  ArtisanProfile,
  Listing,
  Order,
  OrderStatus,
  Transaction,
  Review,
  NotificationItem,
  PaymentStatus,
  PaymentMethod,
} from '../src/types.ts';
import {
  INITIAL_USERS,
  INITIAL_ARTISAN_PROFILES,
  INITIAL_LISTINGS,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS,
  INITIAL_REVIEWS,
} from './data/seedData.ts';

class DatabaseStore {
  public users: User[] = [];
  public artisanProfiles: ArtisanProfile[] = [];
  public listings: Listing[] = [];
  public orders: Order[] = [];
  public transactions: Transaction[] = [];
  public reviews: Review[] = [];
  public notifications: NotificationItem[] = [];
  private sseClients: Array<(data: string) => void> = [];

  constructor() {
    this.resetToSeed();
  }

  public resetToSeed() {
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.artisanProfiles = JSON.parse(JSON.stringify(INITIAL_ARTISAN_PROFILES));
    this.listings = JSON.parse(JSON.stringify(INITIAL_LISTINGS));
    this.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
    this.transactions = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
    this.reviews = JSON.parse(JSON.stringify(INITIAL_REVIEWS));
    this.notifications = [
      {
        id: 'notif-1',
        userId: 'artisan-1',
        role: 'artisan',
        title: 'Welcome to KanyaKriti',
        message: 'Your voice is your storefront! Speak your skills to reach nearby buyers.',
        type: 'SYSTEM',
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif-2',
        userId: 'artisan-1',
        role: 'artisan',
        title: 'Order Ready for Pickup',
        message: 'Order #ord-101 is marked ready. Runner Ramesh is assigned.',
        type: 'ORDER_UPDATE',
        read: false,
        orderId: 'ord-101',
        createdAt: new Date().toISOString(),
      },
    ];
    this.broadcastEvent({ type: 'DEMO_RESET' });
  }

  // Realtime SSE registration
  public addSseClient(callback: (data: string) => void): () => void {
    this.sseClients.push(callback);
    return () => {
      this.sseClients = this.sseClients.filter((c) => c !== callback);
    };
  }

  public broadcastEvent(event: any) {
    const payload = JSON.stringify(event);
    for (const client of this.sseClients) {
      try {
        client(payload);
      } catch (err) {
        // ignore closed stream
      }
    }
  }

  public addNotification(notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) {
    const newNotif: NotificationItem = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(newNotif);
    this.broadcastEvent({ type: 'NOTIFICATION', notification: newNotif });
    return newNotif;
  }

  // Users & Profiles
  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getArtisanProfileByUserId(userId: string): ArtisanProfile | undefined {
    return this.artisanProfiles.find((p) => p.userId === userId);
  }

  public getArtisanProfileById(id: string): ArtisanProfile | undefined {
    return this.artisanProfiles.find((p) => p.id === id || p.userId === id);
  }

  public updateArtisanProfile(userId: string, data: Partial<ArtisanProfile>): ArtisanProfile | null {
    const idx = this.artisanProfiles.findIndex((p) => p.userId === userId || p.id === userId);
    if (idx === -1) return null;
    this.artisanProfiles[idx] = { ...this.artisanProfiles[idx], ...data };
    this.broadcastEvent({ type: 'ARTISAN_UPDATED', profile: this.artisanProfiles[idx] });
    return this.artisanProfiles[idx];
  }

  // Listings
  public getListings(): Listing[] {
    return this.listings;
  }

  public getListingById(id: string): Listing | undefined {
    return this.listings.find((l) => l.id === id);
  }

  public addListing(listing: Omit<Listing, 'id' | 'createdAt' | 'ordersCompleted'>): Listing {
    const newListing: Listing = {
      ...listing,
      id: `list-${Date.now()}`,
      ordersCompleted: 0,
      createdAt: new Date().toISOString(),
    };
    this.listings.unshift(newListing);
    this.broadcastEvent({ type: 'NEW_LISTING', listing: newListing });
    return newListing;
  }

  // Orders & State Machine
  public getOrders(): Order[] {
    return this.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id);
  }

  public createOrder(data: {
    buyerId: string;
    listingId: string;
    paymentMethod: PaymentMethod;
    deliveryAddress: string;
    instructions?: string;
  }): { order: Order | null; error?: string } {
    const buyer = this.getUserById(data.buyerId);
    if (!buyer) return { order: null, error: 'Buyer not found' };

    const listing = this.getListingById(data.listingId);
    if (!listing) return { order: null, error: 'Listing not found' };

    const artisan = this.getArtisanProfileById(listing.artisanId);
    const artisanUser = this.getUserById(listing.artisanId) || this.users.find(u => u.name === listing.artisanName);

    const price = listing.price;
    const platformFee = Math.round(price * 0.05); // 5% platform fee
    const artisanEarning = price - platformFee; // 95% to artisan
    const deliveryFee = 40;
    const totalAmount = price + deliveryFee;

    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-6)}`,
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerPhone: buyer.phone,
      artisanId: artisanUser ? artisanUser.id : listing.artisanId,
      artisanName: listing.artisanName,
      artisanPhone: artisanUser ? artisanUser.phone : '+91 98450 00000',
      listingId: listing.id,
      listingTitle: listing.title,
      category: listing.category,
      price,
      platformFee,
      artisanEarning,
      deliveryFee,
      totalAmount,
      status: 'PENDING',
      paymentStatus: data.paymentMethod === 'UPI' ? 'SUCCESS' : 'PENDING',
      paymentMethod: data.paymentMethod,
      pickupAddress: `${listing.neighborhood}, ${listing.city}`,
      pickupLat: listing.approximateLat,
      pickupLng: listing.approximateLng,
      deliveryAddress: data.deliveryAddress || `${buyer.neighborhood}, ${buyer.city}`,
      deliveryLat: buyer.lat || 12.9352,
      deliveryLng: buyer.lng || 77.6245,
      instructions: data.instructions,
      timeline: [
        {
          status: 'PENDING',
          timestamp: new Date().toISOString(),
          note: `Order placed by ${buyer.name} via ${data.paymentMethod}`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);

    // Notify artisan
    this.addNotification({
      userId: newOrder.artisanId,
      role: 'artisan',
      title: 'New order received!',
      message: `${buyer.name} ordered "${listing.title}" for ₹${listing.price}`,
      type: 'ORDER_NEW',
      orderId: newOrder.id,
    });

    this.broadcastEvent({ type: 'ORDER_CREATED', order: newOrder });
    return { order: newOrder };
  }

  // Strict Server-Side State Machine Validation
  private static VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['ACCEPTED'],
    ACCEPTED: ['PREPARING', 'IN_PROGRESS'],
    PREPARING: ['READY'],
    IN_PROGRESS: ['READY'],
    READY: ['PICKED_UP'],
    PICKED_UP: ['DELIVERED'],
    DELIVERED: ['COMPLETED'],
    COMPLETED: [],
  };

  public updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    runnerId?: string,
    actorRole?: string
  ): { order: Order | null; error?: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { order: null, error: 'Order not found' };

    const allowed = DatabaseStore.VALID_TRANSITIONS[order.status];
    if (!allowed.includes(newStatus)) {
      return {
        order: null,
        error: `Invalid status transition: Cannot transition from ${order.status} to ${newStatus}. Allowed next state: ${allowed.join(', ')}`,
      };
    }

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    let note = `Status changed to ${newStatus}`;

    if (newStatus === 'ACCEPTED') {
      note = `Order accepted by artisan ${order.artisanName}`;
      this.addNotification({
        userId: order.buyerId,
        role: 'buyer',
        title: 'Order Accepted',
        message: `${order.artisanName} accepted your order for ${order.listingTitle}.`,
        type: 'ORDER_UPDATE',
        orderId: order.id,
      });
    } else if (newStatus === 'PREPARING' || (newStatus as string) === 'IN_PROGRESS') {
      note = `Artisan is now actively preparing/stitching your order.`;
      this.addNotification({
        userId: order.buyerId,
        role: 'buyer',
        title: 'Preparation in Progress',
        message: `Work is underway on your order.`,
        type: 'ORDER_UPDATE',
        orderId: order.id,
      });
    } else if (newStatus === 'READY') {
      note = `Order is finished and securely packed for pickup.`;
      // Notify runners and buyer
      this.addNotification({
        userId: order.buyerId,
        role: 'buyer',
        title: 'Order Ready',
        message: `Your order is ready for pickup! Delivery partner is being dispatched.`,
        type: 'ORDER_UPDATE',
        orderId: order.id,
      });
      // Broadcast to runners
      this.broadcastEvent({ type: 'DELIVERY_AVAILABLE', orderId: order.id });
    } else if (newStatus === 'PICKED_UP') {
      if (runnerId) {
        const runner = this.getUserById(runnerId);
        if (runner) {
          order.runnerId = runner.id;
          order.runnerName = runner.name;
          order.runnerPhone = runner.phone;
          order.runnerLat = order.pickupLat;
          order.runnerLng = order.pickupLng;
        }
      }
      note = `Picked up by delivery runner ${order.runnerName || 'Ramesh Kumar'}. On the way!`;
      this.addNotification({
        userId: order.buyerId,
        role: 'buyer',
        title: 'Order Picked Up',
        message: `Your order has been picked up and is on its way to you!`,
        type: 'ORDER_UPDATE',
        orderId: order.id,
      });
    } else if (newStatus === 'DELIVERED') {
      note = `Package safely delivered to customer!`;
      order.paymentStatus = 'SUCCESS';

      // Automatically calculate and credit artisan earnings!
      this.creditArtisanEarnings(order);

      this.addNotification({
        userId: order.buyerId,
        role: 'buyer',
        title: 'Order Delivered',
        message: `Your order "${order.listingTitle}" has been delivered!`,
        type: 'ORDER_UPDATE',
        orderId: order.id,
      });
    } else if (newStatus === 'COMPLETED') {
      note = `Order fully closed and verified.`;
    }

    order.timeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note,
    });

    this.broadcastEvent({ type: 'ORDER_UPDATED', order });
    return { order };
  }

  // Credit earnings to artisan balance
  private creditArtisanEarnings(order: Order) {
    const profile = this.getArtisanProfileById(order.artisanId) || this.getArtisanProfileByUserId(order.artisanId);
    if (!profile) return;

    profile.totalEarned += order.artisanEarning;
    profile.availableBalance += order.artisanEarning;

    // Milestone calculation for North Star Metric: ₹1,000
    const wasAlreadyReached = profile.firstThousandReached;
    if (!wasAlreadyReached && profile.totalEarned >= 1000) {
      profile.firstThousandReached = true;
      profile.milestoneDate = new Date().toISOString().split('T')[0];
      this.addNotification({
        userId: profile.userId,
        role: 'artisan',
        title: 'Milestone Achieved: First ₹1,000 Club!',
        message: `Incredible achievement! You have officially earned your first ₹1,000 on KanyaKriti.`,
        type: 'EARNING',
        orderId: order.id,
      });
    }

    // Record transaction
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      artisanId: profile.userId,
      orderId: order.id,
      type: 'EARNING',
      amount: order.artisanEarning,
      balanceAfter: profile.availableBalance,
      description: `${order.listingTitle} (Order #${order.id})`,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };
    this.transactions.unshift(tx);

    this.addNotification({
      userId: profile.userId,
      role: 'artisan',
      title: `₹${order.artisanEarning} credited to your earnings!`,
      message: `Payment released for order #${order.id}. Current balance: ₹${profile.availableBalance}`,
      type: 'EARNING',
      orderId: order.id,
    });

    this.broadcastEvent({ type: 'EARNINGS_UPDATED', artisanId: profile.userId, profile, transaction: tx });
  }

  // Delivery partner accept
  public assignRunnerToOrder(orderId: string, runnerId: string): { order: Order | null; error?: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { order: null, error: 'Order not found' };
    const runner = this.getUserById(runnerId);
    if (!runner) return { order: null, error: 'Runner not found' };

    order.runnerId = runner.id;
    order.runnerName = runner.name;
    order.runnerPhone = runner.phone;
    order.runnerLat = order.pickupLat;
    order.runnerLng = order.pickupLng;

    order.timeline.push({
      status: order.status,
      timestamp: new Date().toISOString(),
      note: `Assigned to delivery runner ${runner.name}`,
    });

    this.broadcastEvent({ type: 'ORDER_UPDATED', order });
    return { order };
  }

  // Runner GPS simulation movement towards destination
  public updateRunnerLocation(orderId: string, lat: number, lng: number): Order | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;
    order.runnerLat = lat;
    order.runnerLng = lng;
    this.broadcastEvent({
      type: 'RUNNER_LOCATION',
      orderId,
      runnerLat: lat,
      runnerLng: lng,
    });
    return order;
  }
}

export const db = new DatabaseStore();
